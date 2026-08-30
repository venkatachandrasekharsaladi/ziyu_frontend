import { create } from 'zustand'

import { chatService } from '@/services/chat'
import type { Message } from '@/services/chat/types'

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

export const useChatStore = create<ChatState>((set, get) => ({
  ...EMPTY,

  async load() {
    const messages = await chatService.listMessages()
    set({ messages })

    if (unsubscribe) return

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
  },

  setDraft(value) { set({ draft: value }) },

  async send(body) {
    const replyToId = get().replyTarget ?? undefined
    set({ draft: '', replyTarget: null })
    const optimistic = await chatService.sendMessage({ kind: 'text', body, replyToId })
    set({ messages: [...get().messages.filter((m) => m.id !== optimistic.id), optimistic] })
  },

  async sendPhoto(uri) {
    set({ pendingPhotoUri: null, attachmentSheetOpen: false })
    const sent = await chatService.sendMessage({ kind: 'photo', mediaUri: uri })
    set({ messages: [...get().messages, sent] })
  },

  async sendVoice(uri, durationMs) {
    set({ isRecording: false })
    const sent = await chatService.sendMessage({ kind: 'voice', mediaUri: uri, durationMs })
    set({ messages: [...get().messages, sent] })
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
}))
