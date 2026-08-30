import { create } from 'zustand'

import { chatService } from '@/services/chat'
import type { Message, SendInput } from '@/services/chat/types'

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
  sendPhoto(uri: string): Promise<void>
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

      const messages = await chatService.listMessages()
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

    async sendPhoto(uri) {
      const tempId = nextTempId()
      const optimistic: Message = {
        id: tempId,
        authorId: 'me',
        kind: 'photo',
        mediaUri: uri,
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

      await settle(tempId, { kind: 'photo', mediaUri: uri })
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
