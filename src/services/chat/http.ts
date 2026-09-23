/**
 * CHAT OVER HTTP + WEBSOCKET.
 *
 * ── WRITES GO OVER HTTP, NOT THE SOCKET ────────────────────────────────────
 * A socket has no status codes, no retries and no idempotency. A send lost
 * during a reconnect would vanish with nothing to report. So `sendMessage` is
 * a `POST` that either succeeds or throws — which is exactly what the chat
 * store's optimistic send/retry path was written against — and the socket only
 * ever *notifies*. It can drop entirely without losing data, because the next
 * `listMessages()` is the source of truth.
 *
 * ── IDEMPOTENCY ────────────────────────────────────────────────────────────
 * Every send carries a `clientId`. If the response is lost after the server
 * stored the message, the retry returns the original instead of posting a
 * second copy. Without it, "send failed, tap to retry" on a flaky connection
 * is a duplicate-message generator.
 *
 * ── WHY THIS FILE THROWS INSTEAD OF RETURNING `Result` ─────────────────────
 * Unlike the other four services, `ChatService` is declared with plain
 * `Promise<T>`. The store catches and marks the bubble `failed`. Wrapping
 * errors in a `Result` here would change that signature and force a component
 * change, which is the one thing this integration must not do.
 *
 * ── WHAT THE SOCKET DELIBERATELY DROPS ─────────────────────────────────────
 * Reaction and pin frames are mapped to `update`, never `message`: the store
 * replaces the existing bubble instead of appending a duplicate.
 */
import { API_URL, WS_URL, requireApiUrl } from '@/config/env'
import { get, post, refreshSession, request } from '@/services/http/client'
import { getAccessToken, hydrate, isAccessTokenExpired } from '@/services/http/tokens'
import { ensureRemoteUri } from '@/services/media'
import type {
  ChatEvent,
  ChatService,
  Message,
  MessageKind,
  SendInput,
} from '@/services/chat/types'

const PAGE_SIZE = 100

/** Server statuses only — `sending` and `failed` are client-side inventions. */
type ServerStatus = 'sent' | 'delivered' | 'read'

type MessageResponse = {
  id: string
  authorId: 'me' | 'partner'
  kind: MessageKind
  body?: string | null
  mediaUri?: string | null
  durationMs?: number | null
  replyToId?: string | null
  reactions?: { emoji: string; authorId: string }[] | null
  pinned: boolean
  sentAt: string
  status: ServerStatus
  clientId?: string | null
}

const optional = (value: string | null | undefined): string | undefined => value ?? undefined

function toMessage(row: MessageResponse): Message {
  return {
    id: row.id,
    authorId: row.authorId,
    kind: row.kind,
    body: optional(row.body),
    mediaUri: optional(row.mediaUri),
    durationMs: row.durationMs ?? undefined,
    replyToId: optional(row.replyToId),
    reactions: row.reactions ?? [],
    pinned: row.pinned,
    sentAt: row.sentAt,
    status: row.status,
    clientId: optional(row.clientId),
  }
}

/**
 * An idempotency key, not a secret. `randomUUID` when the runtime has it,
 * otherwise time plus entropy — collisions only need to be impossible within
 * one couple's message history, not globally unique.
 */
function newClientId(): string {
  const webCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Falls back to deriving the socket URL from the API URL.
 *
 * Setting `EXPO_PUBLIC_WS_URL` is preferred — the socket may well live on a
 * different host once this is behind a load balancer — but a dev who has set
 * only the API URL should get a working chat rather than a silent no-op.
 */
function socketUrl(): string {
  if (WS_URL) return WS_URL
  return `${API_URL.replace(/^http/i, 'ws')}/ws`
}

// ── Socket ──────────────────────────────────────────────────────────────────

const HEARTBEAT_MS = 25_000
const MAX_BACKOFF_MS = 30_000

/**
 * One socket for the whole app, shared by every subscriber.
 *
 * The store calls `subscribe` on mount and unsubscribes on unmount, and the
 * chat screen can be mounted twice during a navigation transition. A socket per
 * subscriber would open and close a connection on every such transition, and
 * the server counts connections for presence — the partner would see them
 * flicker offline. So connections are reference-counted instead.
 */
let socket: WebSocket | null = null
let listeners: ((event: ChatEvent) => void)[] = []
let backoffMs = 1_000
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
/** Set while intentionally tearing down, so `onclose` does not reconnect. */
let closing = false

function emit(event: ChatEvent): void {
  for (const listener of listeners) listener(event)
}

function clearTimers(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function handleServerEvent(raw: unknown): void {
  if (typeof raw !== 'object' || raw === null) return
  const event = raw as { type?: unknown }

  switch (event.type) {
    case 'message': {
      const { message } = event as { message?: MessageResponse }
      if (message) {
        emit({ type: 'message', message: toMessage(message) })
        if (message.authorId === 'partner' && socket?.readyState === 1) {
          socket.send(JSON.stringify({ type: 'read', upToMessageId: message.id }))
        }
      }
      return
    }
    case 'typing': {
      const { isTyping } = event as { isTyping?: boolean }
      emit({ type: 'typing', isTyping: Boolean(isTyping) })
      return
    }
    case 'status': {
      const { messageId, status } = event as { messageId?: string; status?: ServerStatus }
      if (messageId && status) emit({ type: 'status', messageId, status })
      return
    }
    case 'reaction':
    case 'pin': {
      const { message } = event as { message?: MessageResponse }
      if (message) emit({ type: 'update', message: toMessage(message) })
      return
    }
    default:
      // `presence` and `pong` do not affect the current ChatService contract.
  }
}

async function connect(): Promise<void> {
  if (socket || closing) return

  await hydrate()
  // A socket authenticates once, at the handshake, and then lives for hours.
  // Opening it with a token that expires in ten seconds means an immediate
  // reconnect loop, so it is refreshed first.
  if (isAccessTokenExpired()) await refreshSession()

  const token = getAccessToken()
  // No session yet: stay closed. `subscribe` is called again after sign-in.
  if (!token) return
  if (socket || closing) return

  const next = new WebSocket(`${socketUrl()}?token=${encodeURIComponent(token)}`)
  socket = next

  next.onopen = () => {
    backoffMs = 1_000
    clearTimers()
    heartbeatTimer = setInterval(() => {
      if (next.readyState === 1) next.send(JSON.stringify({ type: 'ping' }))
    }, HEARTBEAT_MS)
  }

  next.onmessage = (message) => {
    try {
      handleServerEvent(JSON.parse(String(message.data)))
    } catch {
      // A frame we cannot parse is not worth killing the connection over.
    }
  }

  next.onerror = () => {
    // `onclose` always follows; reconnection is handled there, once.
  }

  next.onclose = () => {
    socket = null
    clearTimers()
    if (closing || listeners.length === 0) return

    /**
     * Exponential backoff with jitter. A server restart drops every socket at
     * once; without jitter every client in the fleet would reconnect on the
     * same tick and knock it over again.
     */
    const delay = backoffMs + Math.random() * 500
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS)
    reconnectTimer = setTimeout(() => {
      void connect()
    }, delay)
  }
}

function disconnect(): void {
  closing = true
  clearTimers()
  socket?.close()
  socket = null
  backoffMs = 1_000
  closing = false
}

// ── Service ─────────────────────────────────────────────────────────────────

export function createHttpChatService(): ChatService {
  requireApiUrl()

  return {
    /**
     * Returns the most recent page, oldest-to-newest, which is what the thread
     * renders. Older messages are reachable by cursor, but the interface has no
     * parameter for one — infinite scroll is a `types.ts` change and therefore
     * a separate piece of work.
     */
    async listMessages(): Promise<Message[]> {
      const response = await request<MessageResponse[]>('/chat/messages', {
        query: { limit: PAGE_SIZE },
      })
      const rows = response.data.map(toMessage)
      const latestPartner = [...rows].reverse().find((message) => message.authorId === 'partner')
      if (latestPartner) {
        try {
          await post('/chat/read', { upToMessageId: latestPartner.id })
        } catch {
          // The durable message page is still useful; the socket or next load
          // can retry this advisory receipt without hiding the conversation.
        }
      }
      return rows
    },

    async sendMessage(input: SendInput): Promise<Message> {
      // A voice note or photo is a local file until it is uploaded.
      const mediaUri = await ensureRemoteUri(input.mediaUri)

      const sent = await post<MessageResponse>('/chat/messages', {
        ...input,
        mediaUri,
        clientId: input.clientId ?? newClientId(),
      })
      return toMessage(sent)
    },

    /** Toggles: the same emoji twice removes it. The server decides which. */
    async react(messageId: string, emoji: string): Promise<Message> {
      const updated = await post<MessageResponse>(
        `/chat/messages/${encodeURIComponent(messageId)}/reactions`,
        { emoji },
      )
      return toMessage(updated)
    },

    async togglePin(messageId: string): Promise<Message> {
      const updated = await post<MessageResponse>(
        `/chat/messages/${encodeURIComponent(messageId)}/pin`,
      )
      return toMessage(updated)
    },

    async search(query: string): Promise<Message[]> {
      const trimmed = query.trim()
      if (!trimmed) return []

      const rows = await get<MessageResponse[]>('/chat/messages/search', {
        q: trimmed,
        limit: PAGE_SIZE,
      })
      return rows.map(toMessage)
    },

    setTyping(isTyping: boolean): void {
      if (socket?.readyState === 1) {
        socket.send(JSON.stringify({ type: 'typing', isTyping }))
      }
    },

    subscribe(listener: (event: ChatEvent) => void): () => void {
      listeners = [...listeners, listener]
      // Fire and forget: the caller gets its unsubscribe synchronously, as the
      // interface promises, and events start arriving once the socket is up.
      void connect()

      return () => {
        listeners = listeners.filter((entry) => entry !== listener)
        // Last one out closes the connection.
        if (listeners.length === 0) disconnect()
      }
    },
  }
}
