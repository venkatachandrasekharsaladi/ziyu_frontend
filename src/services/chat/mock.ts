import type {
  ChatEvent, ChatService, ChatTimings, Message, SendInput,
} from '@/services/chat/types'

export const CHAT_TIMINGS: ChatTimings = {
  statusStepMs: 400,
  typingDelayMs: 900,
  replyDelayMs: 1600,
}

/**
 * The thread as `Conversation — Normal` (Figma 3390:665) draws it, verbatim.
 * The parity fixture asserts these strings against the frame.
 */
function seed(): Message[] {
  const base = (id: string, authorId: 'me' | 'partner', body: string, min: number): Message => ({
    id, authorId, kind: 'text', body,
    reactions: [], pinned: false,
    sentAt: new Date(Date.UTC(2026, 7, 30, 12, min)).toISOString(),
    status: 'read',
  })

  return [
    base('m1', 'partner', 'Are we still going for coffee tonight? ☰❤️', 42),
    base('m2', 'me', 'Obviously.', 43),
    base('m3', 'partner', 'Good. I found a place you might actually like 😊', 44),
    base('m4', 'me', "That's a bold claim.", 45),
    base('m5', 'partner', 'Just trust me.', 45),
  ]
}

const REPLIES = ['Miss you.', 'Can\'t wait.', 'Tell me more.', 'You always say that.']

export function createMockChatService(timings: Partial<ChatTimings> = {}): ChatService {
  const t = { ...CHAT_TIMINGS, ...timings }
  let messages = seed()
  let listeners: ((event: ChatEvent) => void)[] = []
  let replyIndex = 0

  const emit = (event: ChatEvent) => listeners.forEach((l) => l(event))
  const later = (fn: () => void, ms: number) => { setTimeout(fn, ms) }

  const replace = (next: Message): Message => {
    messages = messages.map((m) => (m.id === next.id ? next : m))
    return next
  }

  const find = (id: string): Message => {
    const found = messages.find((m) => m.id === id)
    if (!found) throw new Error(`No message ${id}`)
    return found
  }

  return {
    async listMessages() {
      return [...messages]
    },

    async sendMessage(input: SendInput) {
      const message: Message = {
        id: `m${messages.length + 1}-${Date.now()}`,
        authorId: 'me',
        kind: input.kind,
        body: input.body,
        mediaUri: input.mediaUri,
        durationMs: input.durationMs,
        replyToId: input.replyToId,
        reactions: [],
        pinned: false,
        sentAt: new Date().toISOString(),
        status: 'sending',
      }
      messages = [...messages, message]

      const steps: Message['status'][] = ['sent', 'delivered', 'read']
      steps.forEach((status, i) => {
        later(() => {
          replace({ ...find(message.id), status })
          emit({ type: 'status', messageId: message.id, status })

          // Only a text message draws a reply, so media sends assert in isolation.
          if (status === 'read' && input.kind === 'text') {
            later(() => {
              emit({ type: 'typing', isTyping: true })
              later(() => {
                const reply: Message = {
                  id: `r${replyIndex}-${Date.now()}`,
                  authorId: 'partner',
                  kind: 'text',
                  body: REPLIES[replyIndex % REPLIES.length],
                  reactions: [], pinned: false,
                  sentAt: new Date().toISOString(),
                  status: 'read',
                }
                replyIndex += 1
                messages = [...messages, reply]
                emit({ type: 'typing', isTyping: false })
                emit({ type: 'message', message: reply })
              }, t.replyDelayMs)
            }, t.typingDelayMs)
          }
        }, t.statusStepMs * (i + 1))
      })

      return message
    },

    async react(messageId, emoji) {
      const current = find(messageId)
      const has = current.reactions.some((r) => r.emoji === emoji && r.authorId === 'me')
      return replace({
        ...current,
        reactions: has
          ? current.reactions.filter((r) => !(r.emoji === emoji && r.authorId === 'me'))
          : [...current.reactions, { emoji, authorId: 'me' }],
      })
    },

    async togglePin(messageId) {
      const current = find(messageId)
      return replace({ ...current, pinned: !current.pinned })
    },

    async search(query) {
      const q = query.trim().toLowerCase()
      if (!q) return []
      return messages.filter((m) => (m.body ?? '').toLowerCase().includes(q))
    },

    subscribe(listener) {
      listeners = [...listeners, listener]
      return () => { listeners = listeners.filter((l) => l !== listener) }
    },
  }
}
