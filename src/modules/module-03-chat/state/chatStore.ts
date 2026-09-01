import { create } from 'zustand'

import { chatService } from '@/services/chat'
import type { Message, SendInput } from '@/services/chat/types'
import { memoriesService } from '@/services/memories'
import type { NewMemory } from '@/services/memories/types'

type ChatState = {
  messages: Message[]
  isPartnerTyping: boolean
  draft: string
  replyTarget: string | null
  selectedMessageId: string | null
  isRecording: boolean
  attachmentSheetOpen: boolean
  pendingPhotoUri: string | null
  load(): Promise<void>
  setDraft(value: string): void
  send(body: string): Promise<void>
  sendPhoto(uri: string, caption?: string): Promise<void>
  sendVoice(uri: string, durationMs: number): Promise<void>
  retry(id: string): Promise<void>
  startReply(id: string): void
  cancelReply(): void
  selectMessage(id: string): void
  clearSelection(): void
  openAttachments(): void
  closeAttachments(): void
  react(id: string, emoji: string): Promise<void>
  togglePin(id: string): Promise<void>
  /** Resolves `true` on a successful save, `false` otherwise — the caller
   *  (`ConversationScreen`) uses this to decide which `FeedbackBanner` to show. */
  saveAsMemory(id: string): Promise<boolean>
  startRecording(): void
  stopRecording(): void
  stagePhoto(uri: string): void
  clearPhoto(): void
  reset(): void
}

const EMPTY = {
  messages: [] as Message[],
  isPartnerTyping: false,
  draft: '',
  replyTarget: null,
  selectedMessageId: null,
  isRecording: false,
  attachmentSheetOpen: false,
  pendingPhotoUri: null,
}

/**
 * Holds the live subscription's unsubscribe function, outside the store's own
 * state. `load()` can run more than once in a session — Task 14's end-to-end
 * test mounts one chat screen, unmounts it, then mounts another, and both call
 * `load()`. `chatService.subscribe` does not dedupe listeners: subscribing
 * again on every `load()` would leave two listeners registered against the one
 * mock service, so a single partner message or status change would be applied
 * to `messages` twice (e.g. an incoming message appended twice). Guarding on
 * this slot keeps at most one live subscription per store instance; `reset()`
 * tears it down so a test that resets and reloads still ends up with exactly
 * one.
 */
let unsubscribe: (() => void) | null = null

/**
 * Every locally-created outgoing message needs an id before the service has
 * assigned one, so the bubble can be found again to reconcile or fail it. A
 * counter (rather than only `Date.now()`) keeps two sends issued in the same
 * millisecond from colliding.
 */
let tempIdCounter = 0
const nextTempId = () => `local-${Date.now()}-${(tempIdCounter += 1)}`

/**
 * How much of a message body a Memory `title` field can carry. The Memories
 * home grid and detail header size a title as a short phrase (see
 * `MemoryDetailScreen` / the sample library's titles like `"Rome '23"` or
 * `"First coffee"`) — not a whole chat bubble, which can run to several
 * sentences. Chosen, not measured off a token: long enough that most chat
 * one-liners survive whole, short enough that a title never wraps to three
 * lines on the card that shows it.
 */
const MEMORY_TITLE_MAX = 60

/**
 * Turns a saved message into the `NewMemory` the Memories service actually
 * takes (`src/services/memories/types.ts`) — NOT the `{ note, mediaUri }`
 * shape this task's brief guessed at. `title`, `date` and `tags` are
 * required there and there is no `mediaUri` field, only `photoUri`.
 *
 * - `title`: the body, trimmed to `MEMORY_TITLE_MAX` with an ellipsis, or a
 *   placeholder for a message with no text (a bare photo/voice note).
 * - `date`: sliced straight off the message's `sentAt` ISO string — it is
 *   already UTC `YYYY-MM-DDTHH:mm:ss.sssZ`, so the first 10 characters ARE
 *   the date the `Memory` type wants, with no timezone-dependent reparsing.
 * - `note`: the full, untruncated body — this is the field the design calls
 *   "Our Note", so nothing here should be cut for length.
 * - `photoUri`: the message's `mediaUri` when it has one (a photo message),
 *   else omitted.
 * - `tags`: `['Little Things']` — the one sample album (`SAMPLE_ALBUMS`) built
 *   for exactly this: small, in-the-moment captures rather than a trip, a
 *   date, or a birthday, which a chat snippet is essentially never.
 */
function memoryFromMessage(message: Message): NewMemory {
  const body = message.body?.trim()
  const title = !body
    ? 'From our chat'
    : body.length > MEMORY_TITLE_MAX
      ? `${body.slice(0, MEMORY_TITLE_MAX).trimEnd()}…`
      : body

  return {
    title,
    date: message.sentAt.slice(0, 10),
    note: message.body,
    photoUri: message.mediaUri,
    tags: ['Little Things'],
  }
}

export const useChatStore = create<ChatState>((set, get) => {
  /**
   * Resolves an outgoing message that is already sitting in `messages` under
   * `tempId` (either a fresh optimistic bubble, or a `failed` one being
   * retried). Never throws: a rejection from the service means the send
   * genuinely failed, and the whole point of this path is to surface that in
   * the thread — marking the existing entry `failed` — rather than let the
   * rejection escape and silently drop the message.
   */
  const settle = async (tempId: string, input: SendInput) => {
    try {
      const sent = await chatService.sendMessage(input)
      set({ messages: get().messages.map((m) => (m.id === tempId ? sent : m)) })
    } catch {
      set({
        messages: get().messages.map((m) =>
          (m.id === tempId ? { ...m, status: 'failed' } : m)),
      })
    }
  }

  return {
    ...EMPTY,

    async load() {
      // Claim the subscription slot, and subscribe if it is still empty,
      // BEFORE the only `await` in this function. Two `load()` calls issued
      // without awaiting the first (e.g. `Promise.all([load(), load()])`)
      // both run their synchronous prefix — including this check — before
      // either one's `listMessages()` resolves. Checking after the await
      // would let both calls observe `unsubscribe` as null and each
      // subscribe, doubling every future event.
      if (!unsubscribe) {
        unsubscribe = chatService.subscribe((event) => {
          if (event.type === 'typing') set({ isPartnerTyping: event.isTyping })
          if (event.type === 'message') set({ messages: [...get().messages, event.message] })
          if (event.type === 'status') {
            set({
              messages: get().messages.map((m) =>
                m.id === event.messageId ? { ...m, status: event.status } : m),
            })
          }
        })
      }

      const serverMessages = await chatService.listMessages()

      // A `failed` (or still-`sending`) message exists ONLY in this store's
      // own state — `mock.ts` never adds a failed send to the list it hands
      // back from `listMessages()`. Replacing `messages` wholesale with
      // whatever the service returns, as this used to do unconditionally,
      // would silently delete it the next time this screen (re)mounts,
      // which is every navigation into the thread — the branch a couple's
      // actual unsent text depends on. Keeping it means checking the
      // service's own answer for it FIRST: if the service ever does learn
      // about it (a retry that lands, or a real backend eventually
      // returning it), that copy wins over the stale local one.
      const serverIds = new Set(serverMessages.map((m) => m.id))
      const localOnly = get().messages.filter(
        (m) => (m.status === 'failed' || m.status === 'sending') && !serverIds.has(m.id),
      )

      // Merged and re-sorted by `sentAt`, not simply appended — a locally-
      // failed message keeps its place in thread order instead of jumping
      // to the end every time `load()` runs again.
      const messages = [...serverMessages, ...localOnly].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      )
      set({ messages })
    },

    setDraft(value) { set({ draft: value }) },

    async send(body) {
      const replyToId = get().replyTarget ?? undefined
      const tempId = nextTempId()
      const optimistic: Message = {
        id: tempId,
        authorId: 'me',
        kind: 'text',
        body,
        replyToId,
        reactions: [],
        pinned: false,
        sentAt: new Date().toISOString(),
        status: 'sending',
      }
      // The bubble goes up immediately — before the service is even asked to
      // send it — so the sender always sees their own message right away,
      // whatever the network is doing.
      set({ draft: '', replyTarget: null, messages: [...get().messages, optimistic] })

      await settle(tempId, { kind: 'text', body, replyToId })
    },

    async sendPhoto(uri, caption) {
      const tempId = nextTempId()
      const optimistic: Message = {
        id: tempId,
        authorId: 'me',
        kind: 'photo',
        mediaUri: uri,
        // `body` doubles as the caption here, same field `send()` uses for a
        // plain text message — `Message`/`SendInput` never carried a
        // dedicated caption field, so there is nothing else for this to be.
        body: caption,
        reactions: [],
        pinned: false,
        sentAt: new Date().toISOString(),
        status: 'sending',
      }
      set({
        pendingPhotoUri: null,
        attachmentSheetOpen: false,
        messages: [...get().messages, optimistic],
      })

      await settle(tempId, { kind: 'photo', mediaUri: uri, body: caption })
    },

    async sendVoice(uri, durationMs) {
      const tempId = nextTempId()
      const optimistic: Message = {
        id: tempId,
        authorId: 'me',
        kind: 'voice',
        mediaUri: uri,
        durationMs,
        reactions: [],
        pinned: false,
        sentAt: new Date().toISOString(),
        status: 'sending',
      }
      set({ isRecording: false, messages: [...get().messages, optimistic] })

      await settle(tempId, { kind: 'voice', mediaUri: uri, durationMs })
    },

    async retry(id) {
      const message = get().messages.find((m) => m.id === id)
      // Only a message the thread already marked `failed` is retryable —
      // retrying anything else (already sent, or mid-flight) would re-send
      // it a second time.
      if (!message || message.status !== 'failed') return

      set({
        messages: get().messages.map((m) => (m.id === id ? { ...m, status: 'sending' } : m)),
      })

      await settle(id, {
        kind: message.kind,
        body: message.body,
        mediaUri: message.mediaUri,
        durationMs: message.durationMs,
        replyToId: message.replyToId,
      })
    },

    startReply(id) { set({ replyTarget: id, selectedMessageId: null }) },
    cancelReply() { set({ replyTarget: null }) },

    // The two overlays are mutually exclusive: opening one closes the other.
    selectMessage(id) { set({ selectedMessageId: id, attachmentSheetOpen: false }) },
    clearSelection() { set({ selectedMessageId: null }) },
    openAttachments() { set({ attachmentSheetOpen: true, selectedMessageId: null }) },
    closeAttachments() { set({ attachmentSheetOpen: false }) },

    async react(id, emoji) {
      const updated = await chatService.react(id, emoji)
      set({
        messages: get().messages.map((m) => (m.id === id ? updated : m)),
        selectedMessageId: null,
      })
    },

    async togglePin(id) {
      const updated = await chatService.togglePin(id)
      set({
        messages: get().messages.map((m) => (m.id === id ? updated : m)),
        selectedMessageId: null,
      })
    },

    /**
     * The real "Media & Memories Bridge". The 16-task plan deliberately does
     * NOT build Figma frame 3390:4 as a screen — it is a picker over the
     * couple's existing memories, and would just duplicate the Memories home
     * screen the M03 module already ships. This action IS the bridge instead:
     * one message becomes one memory, through the same `memoriesService`
     * every other memories screen writes through.
     *
     * `memoriesService.create` returns a `Result`, not a bare `Memory` — a
     * network failure is a normal, expected outcome here, not an exception.
     * On `ok: false` the overlay is deliberately left OPEN (nothing is
     * cleared): the message is still selected, so a retry from the same menu
     * is the recovery path, rather than the user having to long-press again.
     *
     * Returns a plain boolean rather than the raw `Result` (or throwing) —
     * `ConversationScreen` is the caller that turns this into a
     * `FeedbackBanner`, and a boolean is all it needs to pick "Saved to
     * Memories." vs. the failure copy; leaking the service's own error
     * shape up through the store would make the screen couple itself to a
     * contract it has no other reason to know about. A message id that
     * isn't in the thread at all also resolves `false` — nothing was saved,
     * so there is nothing to call a success.
     */
    async saveAsMemory(id) {
      const message = get().messages.find((m) => m.id === id)
      if (!message) return false

      const result = await memoriesService.create(memoryFromMessage(message))
      if (!result.ok) return false

      set({ selectedMessageId: null })
      return true
    },

    startRecording() { set({ isRecording: true }) },
    stopRecording() { set({ isRecording: false }) },
    stagePhoto(uri) { set({ pendingPhotoUri: uri, attachmentSheetOpen: false }) },
    clearPhoto() { set({ pendingPhotoUri: null }) },

    reset() {
      unsubscribe?.()
      unsubscribe = null
      set({ ...EMPTY })
    },
  }
})
