# Chat Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the LoveOS Chat module — thread, reactions, attachments, voice notes, search, and voice/video Moments — from the Ziyu Figma frames, with an A-Z journey test, a written test-case catalogue, and design-parity assertions against Figma.

**Architecture:** Four layers, strictly one-directional: `services/chat` (mock, swappable at one line) → `module-03-chat/state` (zustand) → `module-03-chat/components` (presentational, never import a service) → `module-03-chat/screens` (composition only). Routes under `app/(app)/chat/` are one-line re-export shims. Most Figma frames are *states* of one conversation screen, not destinations.

**Tech Stack:** Expo 57, React Native 0.86, expo-router, zustand 5, react-native-unistyles 3, jest-expo, @testing-library/react-native 14.

**Spec:** `docs/superpowers/specs/2026-08-30-chat-module-design.md`

## Global Constraints

- **Never import `tokens/colors.ts` outside `design-system/themes/`.** Screens and components read semantic names off the theme. Enforced by QA check 5.
- **Components never import a service.** They take data and callbacks as props. This is what makes every state renderable in a test.
- **Adding a colour means adding it to `ThemeColors` and to BOTH `lavenderTheme` and `midnightTheme`** — the type makes omission a compile error, and `themes/__tests__/theme.parity.test.ts` asserts it at runtime.
- **Fuschia/100 `#EF5DA8` never carries body text and never hosts a white label at body size** — measured 3.09:1 on white, 2.93:1 on the app background. Iris/100 `#5D5FEF` is the safe interactive accent at 4.83:1.
- **`renderScreen` is async.** Always `await renderScreen(<X />)` — RNTL v14 made rendering asynchronous.
- **Every icon-only control carries an `accessibilityLabel`.** Enforced by QA check 6.
- **Palette values, verbatim:** `fuschia100 #EF5DA8`, `fuschia80 #F178B6`, `fuschia60 #FCDDEC`, `iris100 #5D5FEF`, `iris80 #7879F1`, `iris60 #A5A6F6`.
- **Commit after every task.** No Claude attribution in commit messages.

---

### Task 1: Chat palette tokens and theme roles

**Files:**
- Modify: `src/design-system/tokens/colors.ts`
- Modify: `src/design-system/themes/theme.ts`
- Test: `src/design-system/themes/__tests__/chatContrast.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `theme.colors.chat` with keys `bubbleOutgoing`, `bubbleIncoming`, `bubbleInk`, `accent`, `accentSoft`, `onAccent`

- [ ] **Step 1: Write the failing contrast test**

```ts
// src/design-system/themes/__tests__/chatContrast.test.ts
import { contrast } from '@/test/contrast'
import { lavenderTheme, midnightTheme } from '@/design-system/themes/theme'

const THEMES = [
  ['lavender', lavenderTheme],
  ['midnight', midnightTheme],
] as const

describe.each(THEMES)('chat colours — %s', (_name, theme) => {
  const chat = theme.colors.chat

  it('puts readable ink on both bubbles', () => {
    expect(contrast(chat.bubbleInk, chat.bubbleOutgoing)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(chat.bubbleInk, chat.bubbleIncoming)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the accent legible on the page', () => {
    expect(contrast(chat.accent, theme.colors.surface.page)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps a label legible on the accent', () => {
    expect(contrast(chat.onAccent, chat.accent)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('fuschia is never used as an accent', () => {
  it.each(THEMES)('%s', (_name, theme) => {
    expect(theme.colors.chat.accent.toUpperCase()).not.toBe('#EF5DA8')
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest src/design-system/themes/__tests__/chatContrast.test.ts`
Expected: FAIL — `chat` does not exist on `theme.colors`.

- [ ] **Step 3: Add the raw values to the palette**

In `src/design-system/tokens/colors.ts`, append to `palette`:

```ts
  /**
   * CHAT — Figma `Ziyu` colour styles Fuschia and Iris (91:0–91:5).
   *
   * Fuschia is decorative only. It reaches 3.09:1 on white and 2.93:1 on the
   * page, so it never carries body text and never hosts a white label.
   * `chatContrast.test.ts` asserts it is not wired to `chat.accent`.
   */
  fuschia100: '#EF5DA8',
  fuschia80: '#F178B6',
  fuschia60: '#FCDDEC',
  iris100: '#5D5FEF',
  iris80: '#7879F1',
  iris60: '#A5A6F6',
```

Append to `midnightPalette` (bubbles must stay dark, ink light):

```ts
  fuschia60Dark: '#3A2130',
  iris60Dark: '#282A57',
  iris300: '#A5A6F6',
```

- [ ] **Step 4: Extend the theme type**

In `theme.ts`, add to `ThemeColors`:

```ts
  /**
   * CHAT — bubble fills, and the one accent Chat is allowed to tint with.
   *
   * `accent` is Iris, never Fuschia: Fuschia fails AA both as text on the page
   * and under a white label. Fuschia survives as `bubbleIncoming`'s tint in
   * lavender, where it only ever sits behind `bubbleInk`.
   */
  chat: {
    bubbleOutgoing: string
    bubbleIncoming: string
    /** Ink on top of both bubbles. One value — both fills are contrast-checked for it. */
    bubbleInk: string
    accent: string
    accentSoft: string
    /** Label on top of `accent`. */
    onAccent: string
  }
```

- [ ] **Step 5: Fill it in for both themes**

`lavenderTheme.colors`:

```ts
    chat: {
      bubbleOutgoing: palette.iris60,
      bubbleIncoming: palette.fuschia60,
      bubbleInk: palette.ink900,
      accent: palette.iris100,
      accentSoft: palette.iris60,
      onAccent: palette.white,
    },
```

`midnightTheme.colors`:

```ts
    chat: {
      bubbleOutgoing: dark.iris60Dark,
      bubbleIncoming: dark.fuschia60Dark,
      bubbleInk: dark.paper50,
      accent: dark.iris300,
      accentSoft: dark.iris60Dark,
      onAccent: dark.ink900 ?? '#1A1428',
    },
```

If `dark.ink900` does not exist, add `ink900: '#1A1428'` to `midnightPalette` rather than inlining the hex.

- [ ] **Step 6: Run the tests**

Run: `npx jest src/design-system/themes && npm run typecheck`
Expected: PASS, including the existing `theme.parity` suite.

- [ ] **Step 7: Commit**

```bash
git add src/design-system
git commit -m "Add the chat palette and its contrast floor"
```

---

### Task 2: Chat service — types and mock

**Files:**
- Create: `src/services/chat/types.ts`, `src/services/chat/mock.ts`, `src/services/chat/index.ts`
- Test: `src/services/chat/__tests__/mock.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Message`, `MessageKind`, `MessageStatus`, `Reaction`, `ChatEvent`, `ChatService`, `createMockChatService(options?)`, `CHAT_TIMINGS`, `chatService`

- [ ] **Step 1: Write the failing test**

```ts
// src/services/chat/__tests__/mock.test.ts
import { createMockChatService } from '@/services/chat/mock'

const instant = { statusStepMs: 0, typingDelayMs: 0, replyDelayMs: 0 }

describe('mock chat service', () => {
  it('seeds the conversation from the Figma frame', async () => {
    const service = createMockChatService(instant)
    const messages = await service.listMessages()

    expect(messages).toHaveLength(5)
    expect(messages[0].body).toBe('Are we still going for coffee tonight? ☰❤️')
    expect(messages[0].authorId).toBe('partner')
    expect(messages[1].body).toBe('Obviously.')
    expect(messages[1].authorId).toBe('me')
  })

  it('walks an outgoing message through every status', async () => {
    const service = createMockChatService(instant)
    const seen: string[] = []
    service.subscribe((e) => {
      if (e.type === 'status') seen.push(e.status)
    })

    const sent = await service.sendMessage({ kind: 'text', body: 'Hello' })

    expect(sent.status).toBe('sending')
    await new Promise((r) => setTimeout(r, 0))
    expect(seen).toEqual(['sent', 'delivered', 'read'])
  })

  it('attaches and toggles a reaction', async () => {
    const service = createMockChatService(instant)
    const [first] = await service.listMessages()

    const reacted = await service.react(first.id, '❤️')
    expect(reacted.reactions).toEqual([{ emoji: '❤️', authorId: 'me' }])

    const cleared = await service.react(first.id, '❤️')
    expect(cleared.reactions).toEqual([])
  })

  it('toggles pinned', async () => {
    const service = createMockChatService(instant)
    const [first] = await service.listMessages()

    expect((await service.togglePin(first.id)).pinned).toBe(true)
    expect((await service.togglePin(first.id)).pinned).toBe(false)
  })

  it('searches case-insensitively on body text', async () => {
    const service = createMockChatService(instant)

    const hits = await service.search('COFFEE')
    expect(hits).toHaveLength(1)
    expect(hits[0].body).toContain('coffee')
  })

  it('does not auto-reply to a photo', async () => {
    const service = createMockChatService(instant)
    const replies: string[] = []
    service.subscribe((e) => {
      if (e.type === 'message') replies.push(e.message.id)
    })

    await service.sendMessage({ kind: 'photo', mediaUri: 'file://p.jpg' })
    await new Promise((r) => setTimeout(r, 0))

    expect(replies).toHaveLength(0)
  })

  it('stops delivering events after unsubscribe', async () => {
    const service = createMockChatService(instant)
    let count = 0
    const off = service.subscribe(() => { count += 1 })
    off()

    await service.sendMessage({ kind: 'text', body: 'Hi' })
    await new Promise((r) => setTimeout(r, 0))

    expect(count).toBe(0)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest src/services/chat`
Expected: FAIL — cannot resolve `@/services/chat/mock`.

- [ ] **Step 3: Write the types**

```ts
// src/services/chat/types.ts
export type MessageKind = 'text' | 'photo' | 'voice' | 'video'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export type Reaction = { emoji: string; authorId: string }

export type Message = {
  id: string
  authorId: 'me' | 'partner'
  kind: MessageKind
  body?: string
  mediaUri?: string
  durationMs?: number
  replyToId?: string
  reactions: Reaction[]
  pinned: boolean
  sentAt: string
  status: MessageStatus
}

export type SendInput = {
  kind: MessageKind
  body?: string
  mediaUri?: string
  durationMs?: number
  replyToId?: string
}

export type ChatEvent =
  | { type: 'typing'; isTyping: boolean }
  | { type: 'message'; message: Message }
  | { type: 'status'; messageId: string; status: MessageStatus }

export type ChatService = {
  listMessages(): Promise<Message[]>
  sendMessage(input: SendInput): Promise<Message>
  react(messageId: string, emoji: string): Promise<Message>
  togglePin(messageId: string): Promise<Message>
  search(query: string): Promise<Message[]>
  subscribe(listener: (event: ChatEvent) => void): () => void
}

/** Every delay the mock uses. Tests pass zeroes; the app uses the defaults. */
export type ChatTimings = {
  statusStepMs: number
  typingDelayMs: number
  replyDelayMs: number
}
```

- [ ] **Step 4: Write the mock**

```ts
// src/services/chat/mock.ts
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

const REPLIES = ['Miss you.', 'Can’t wait.', 'Tell me more.', 'You always say that.']

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
```

- [ ] **Step 5: Write the swap point**

```ts
// src/services/chat/index.ts
import { createMockChatService } from '@/services/chat/mock'

export type * from '@/services/chat/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `chatService` from here, never from `mock`.
 */
export const chatService = createMockChatService()
```

- [ ] **Step 6: Run the tests**

Run: `npx jest src/services/chat && npm run typecheck`
Expected: PASS, 7 tests.

- [ ] **Step 7: Commit**

```bash
git add src/services/chat
git commit -m "Add the chat service behind a mock"
```

---

### Task 3: Chat store

**Files:**
- Create: `src/modules/module-03-chat/state/chatStore.ts`
- Test: `src/modules/module-03-chat/state/__tests__/chatStore.test.ts`

**Interfaces:**
- Consumes: `chatService`, `Message` from Task 2
- Produces: `useChatStore` with state `messages`, `isPartnerTyping`, `draft`, `replyTarget`, `selectedMessageId`, `isRecording`, `attachmentSheetOpen`, `pendingPhotoUri`; actions `load`, `setDraft`, `send`, `startReply`, `cancelReply`, `selectMessage`, `clearSelection`, `openAttachments`, `closeAttachments`, `react`, `togglePin`, `startRecording`, `stopRecording`, `stagePhoto`, `clearPhoto`, `reset`

- [ ] **Step 1: Write the failing test**

```ts
// src/modules/module-03-chat/state/__tests__/chatStore.test.ts
import { act } from '@testing-library/react-native'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'

beforeEach(() => { act(() => { useChatStore.getState().reset() }) })

describe('chat store', () => {
  it('loads the thread', async () => {
    await act(async () => { await useChatStore.getState().load() })
    expect(useChatStore.getState().messages.length).toBeGreaterThan(0)
  })

  it('shows an outgoing message immediately, before the service resolves', async () => {
    await act(async () => { await useChatStore.getState().load() })
    const before = useChatStore.getState().messages.length

    await act(async () => { await useChatStore.getState().send('Hello') })

    const after = useChatStore.getState().messages
    expect(after).toHaveLength(before + 1)
    expect(after[after.length - 1].body).toBe('Hello')
  })

  it('clears the draft and the reply target on send', async () => {
    await act(async () => { await useChatStore.getState().load() })
    act(() => {
      useChatStore.getState().setDraft('Hi')
      useChatStore.getState().startReply('m1')
    })

    await act(async () => { await useChatStore.getState().send('Hi') })

    expect(useChatStore.getState().draft).toBe('')
    expect(useChatStore.getState().replyTarget).toBeNull()
  })

  it('never opens the attachment sheet and the reaction overlay together', () => {
    act(() => {
      useChatStore.getState().selectMessage('m1')
      useChatStore.getState().openAttachments()
    })
    expect(useChatStore.getState().selectedMessageId).toBeNull()
    expect(useChatStore.getState().attachmentSheetOpen).toBe(true)

    act(() => { useChatStore.getState().selectMessage('m2') })
    expect(useChatStore.getState().attachmentSheetOpen).toBe(false)
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest src/modules/module-03-chat/state`
Expected: FAIL — cannot resolve `chatStore`.

- [ ] **Step 3: Implement the store**

```ts
// src/modules/module-03-chat/state/chatStore.ts
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

export const useChatStore = create<ChatState>((set, get) => ({
  ...EMPTY,

  async load() {
    const messages = await chatService.listMessages()
    set({ messages })

    chatService.subscribe((event) => {
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
  reset() { set({ ...EMPTY }) },
}))
```

- [ ] **Step 4: Run the tests**

Run: `npx jest src/modules/module-03-chat/state && npm run typecheck`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/modules/module-03-chat/state
git commit -m "Add the chat store with optimistic send"
```

---

### Task 4: Message bubble, grouping, day divider, read receipt

**Files:**
- Create: `src/modules/module-03-chat/components/MessageBubble.tsx`, `DayDivider.tsx`, `ReadReceipt.tsx`
- Test: `src/modules/module-03-chat/components/__tests__/MessageBubble.test.tsx`

**Interfaces:**
- Consumes: `Message` from Task 2, `theme.colors.chat` from Task 1
- Produces: `<MessageBubble message onLongPress />`, `<DayDivider label />`, `<ReadReceipt status />`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/components/__tests__/MessageBubble.test.tsx
import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import { renderScreen } from '@/test/renderScreen'
import type { Message } from '@/services/chat/types'

const message = (over: Partial<Message> = {}): Message => ({
  id: 'm1', authorId: 'partner', kind: 'text', body: 'Just trust me.',
  reactions: [], pinned: false,
  sentAt: new Date(Date.UTC(2026, 7, 30, 12, 45)).toISOString(),
  status: 'read', ...over,
})

describe('MessageBubble', () => {
  it('renders the body', async () => {
    const { getByText } = await renderScreen(<MessageBubble message={message()} />)
    expect(getByText('Just trust me.')).toBeTruthy()
  })

  it('shows a read receipt on outgoing messages only', async () => {
    const out = await renderScreen(
      <MessageBubble message={message({ authorId: 'me', status: 'read' })} />)
    expect(out.getByLabelText('Read')).toBeTruthy()

    const incoming = await renderScreen(<MessageBubble message={message()} />)
    expect(incoming.queryByLabelText('Read')).toBeNull()
  })

  it('renders reactions attached to the message', async () => {
    const { getByText } = await renderScreen(
      <MessageBubble message={message({ reactions: [{ emoji: '❤️', authorId: 'me' }] })} />)
    expect(getByText('❤️')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest src/modules/module-03-chat/components`
Expected: FAIL — cannot resolve `MessageBubble`.

- [ ] **Step 3: Implement `ReadReceipt`**

```tsx
// src/modules/module-03-chat/components/ReadReceipt.tsx
import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import type { MessageStatus } from '@/services/chat/types'

const LABEL: Record<MessageStatus, string> = {
  sending: 'Sending', sent: 'Sent', delivered: 'Delivered',
  read: 'Read', failed: 'Failed to send',
}

export function ReadReceipt({ status }: { status: MessageStatus }) {
  const { theme } = useUnistyles()
  const tint = status === 'read' ? theme.colors.chat.accent : theme.colors.text.placeholder

  return (
    <View style={styles.row} accessibilityLabel={LABEL[status]}>
      <Feather name={status === 'sending' ? 'clock' : 'check'} size={12} color={tint} />
      {(status === 'delivered' || status === 'read') && (
        <Feather name="check" size={12} color={tint} style={styles.second} />
      )}
    </View>
  )
}

const styles = StyleSheet.create(() => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  second: { marginLeft: -6 },
}))
```

- [ ] **Step 4: Implement `DayDivider`**

```tsx
// src/modules/module-03-chat/components/DayDivider.tsx
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Text } from '@/design-system/primitives/Text'

export function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Text variant="caption" style={styles.label}>{label}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: { alignItems: 'center', marginVertical: theme.spacing.lg },
  pill: {
    backgroundColor: theme.colors.chat.accentSoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  label: { color: theme.colors.chat.bubbleInk, letterSpacing: 0.5 },
}))
```

If `Text` does not accept a `variant` prop, read `src/design-system/primitives/Text.tsx` and use whatever prop it exposes — do not add one.

- [ ] **Step 5: Implement `MessageBubble`**

```tsx
// src/modules/module-03-chat/components/MessageBubble.tsx
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Text } from '@/design-system/primitives/Text'
import { ReadReceipt } from '@/modules/module-03-chat/components/ReadReceipt'
import type { Message } from '@/services/chat/types'

type Props = {
  message: Message
  onLongPress?: (id: string) => void
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * One message. Figma `Ziyu` 3390:665.
 *
 * The frame draws a darker vertical strip on the leading edge of incoming
 * bubbles. It is a misaligned overlay, not a design element, and is not
 * reproduced — see the spec, §9.
 */
export function MessageBubble({ message, onLongPress }: Props) {
  const mine = message.authorId === 'me'

  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <Pressable
        onLongPress={() => onLongPress?.(message.id)}
        accessibilityRole="button"
        accessibilityLabel={message.body ?? 'Message'}
        style={[styles.bubble, mine ? styles.mine : styles.theirs]}
      >
        {message.body ? <Text style={styles.body}>{message.body}</Text> : null}
      </Pressable>

      {message.reactions.length > 0 && (
        <View style={styles.reactions}>
          {message.reactions.map((r) => (
            <Text key={`${r.emoji}-${r.authorId}`} style={styles.reaction}>{r.emoji}</Text>
          ))}
        </View>
      )}

      <View style={styles.meta}>
        <Text variant="caption" style={styles.time}>{clockTime(message.sentAt)}</Text>
        {mine && <ReadReceipt status={message.status} />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: { marginBottom: theme.spacing.lg, maxWidth: '82%' },
  rowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.panel,
  },
  mine: { backgroundColor: theme.colors.chat.bubbleOutgoing },
  theirs: { backgroundColor: theme.colors.chat.bubbleIncoming },
  body: { color: theme.colors.chat.bubbleInk },
  reactions: { flexDirection: 'row', marginTop: -theme.spacing.sm },
  reaction: { fontSize: 14 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  time: { color: theme.colors.text.placeholder },
}))
```

- [ ] **Step 6: Run the tests**

Run: `npx jest src/modules/module-03-chat/components && npm run typecheck`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add src/modules/module-03-chat/components
git commit -m "Draw the message bubble, day divider, and read receipt"
```

---

### Task 5: Composer, typing indicator, reply preview

**Files:**
- Create: `components/Composer.tsx`, `components/TypingIndicator.tsx`, `components/ReplyPreview.tsx`
- Test: `components/__tests__/Composer.test.tsx`

**Interfaces:**
- Consumes: Task 1 theme
- Produces: `<Composer value onChangeText onSend onAttach onRecord replyTo onCancelReply />`, `<TypingIndicator />`, `<ReplyPreview body onCancel />`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/components/__tests__/Composer.test.tsx
import { fireEvent } from '@testing-library/react-native'
import { Composer } from '@/modules/module-03-chat/components/Composer'
import { renderScreen } from '@/test/renderScreen'

const noop = () => {}

describe('Composer', () => {
  it('labels every icon-only control', async () => {
    const { getByLabelText } = await renderScreen(
      <Composer value="" onChangeText={noop} onSend={noop} onAttach={noop} onRecord={noop} />)

    expect(getByLabelText('Add attachment')).toBeTruthy()
    expect(getByLabelText('Record voice note')).toBeTruthy()
  })

  it('sends the typed text', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <Composer value="Hello" onChangeText={noop} onSend={onSend} onAttach={noop} onRecord={noop} />)

    fireEvent.press(getByLabelText('Send message'))
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('offers send instead of record once there is text', async () => {
    const { queryByLabelText } = await renderScreen(
      <Composer value="Hi" onChangeText={noop} onSend={noop} onAttach={noop} onRecord={noop} />)

    expect(queryByLabelText('Record voice note')).toBeNull()
  })

  it('shows the quoted message when replying', async () => {
    const { getByText } = await renderScreen(
      <Composer value="" onChangeText={noop} onSend={noop} onAttach={noop} onRecord={noop}
        replyTo="Just trust me." onCancelReply={noop} />)

    expect(getByText('Just trust me.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest components/__tests__/Composer.test.tsx`
Expected: FAIL — cannot resolve `Composer`.

- [ ] **Step 3: Implement `ReplyPreview` and `TypingIndicator`**

```tsx
// src/modules/module-03-chat/components/ReplyPreview.tsx
import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Text } from '@/design-system/primitives/Text'

export function ReplyPreview({ body, onCancel }: { body: string; onCancel: () => void }) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrap}>
      <View style={styles.bar} />
      <Text numberOfLines={1} style={styles.body}>{body}</Text>
      <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel reply">
        <Feather name="x" size={18} color={theme.colors.text.placeholder} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface.field,
  },
  bar: { width: 3, height: 28, borderRadius: 2, backgroundColor: theme.colors.chat.accent },
  body: { flex: 1, color: theme.colors.text.body },
}))
```

```tsx
// src/modules/module-03-chat/components/TypingIndicator.tsx
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export function TypingIndicator() {
  return (
    <View style={styles.bubble} accessibilityLabel="Partner is typing">
      {[0, 1, 2].map((i) => <View key={i} style={styles.dot} />)}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bubble: {
    alignSelf: 'flex-start', flexDirection: 'row', gap: theme.spacing.xs,
    backgroundColor: theme.colors.chat.bubbleIncoming,
    borderRadius: theme.radii.panel,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.chat.bubbleInk },
}))
```

- [ ] **Step 4: Implement `Composer`**

```tsx
// src/modules/module-03-chat/components/Composer.tsx
import { Feather } from '@expo/vector-icons'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { ReplyPreview } from '@/modules/module-03-chat/components/ReplyPreview'

type Props = {
  value: string
  onChangeText: (v: string) => void
  onSend: (v: string) => void
  onAttach: () => void
  onRecord: () => void
  replyTo?: string
  onCancelReply?: () => void
}

export function Composer({
  value, onChangeText, onSend, onAttach, onRecord, replyTo, onCancelReply,
}: Props) {
  const { theme } = useUnistyles()
  const hasText = value.trim().length > 0

  return (
    <View>
      {replyTo && onCancelReply && <ReplyPreview body={replyTo} onCancel={onCancelReply} />}

      <View style={styles.bar}>
        <Pressable onPress={onAttach} accessibilityRole="button" accessibilityLabel="Add attachment"
          style={styles.round}>
          <Feather name="plus" size={20} color={theme.colors.text.body} />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Message Sarah…"
          placeholderTextColor={theme.colors.text.placeholder}
          accessibilityLabel="Message"
          multiline
          style={styles.input}
        />

        {hasText ? (
          <Pressable onPress={() => onSend(value)} accessibilityRole="button"
            accessibilityLabel="Send message" style={styles.send}>
            <Feather name="arrow-up" size={20} color={theme.colors.chat.onAccent} />
          </Pressable>
        ) : (
          <Pressable onPress={onRecord} accessibilityRole="button"
            accessibilityLabel="Record voice note" style={styles.send}>
            <Feather name="mic" size={20} color={theme.colors.chat.onAccent} />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    borderTopWidth: 1, borderTopColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  round: {
    width: 40, height: 40, borderRadius: theme.radii.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface.field,
  },
  input: {
    flex: 1, maxHeight: 120, minHeight: 40,
    paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
    color: theme.colors.text.body,
  },
  send: {
    width: 40, height: 40, borderRadius: theme.radii.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.chat.accent,
  },
}))
```

- [ ] **Step 5: Run the tests**

Run: `npx jest src/modules/module-03-chat && npm run typecheck`
Expected: PASS, 4 new tests.

- [ ] **Step 6: Commit**

```bash
git add src/modules/module-03-chat/components
git commit -m "Add the composer, typing indicator, and reply preview"
```

---

### Task 6: Conversation screen — normal, typing, replying

**Files:**
- Create: `src/modules/module-03-chat/screens/ConversationScreen.tsx`, `src/app/(app)/chat/conversation.tsx`
- Test: `src/modules/module-03-chat/screens/__tests__/ConversationFlow.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–5
- Produces: `ConversationScreen`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/screens/__tests__/ConversationFlow.test.tsx
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

beforeEach(() => { act(() => { useChatStore.getState().reset() }) })

describe('ConversationScreen', () => {
  it('renders the seeded thread in order', async () => {
    const { getByText } = await renderScreen(<ConversationScreen />)

    await waitFor(() => expect(getByText('Just trust me.')).toBeTruthy())
    expect(getByText('Obviously.')).toBeTruthy()
  })

  it('sends what was typed and clears the field', async () => {
    const { getByLabelText, getByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Obviously.')).toBeTruthy())

    fireEvent.changeText(getByLabelText('Message'), 'On my way')
    fireEvent.press(getByLabelText('Send message'))

    await waitFor(() => expect(getByText('On my way')).toBeTruthy())
    expect(getByLabelText('Message').props.value).toBe('')
  })

  it('shows the typing indicator while the partner types', async () => {
    const { getByLabelText, queryByLabelText } = await renderScreen(<ConversationScreen />)
    expect(queryByLabelText('Partner is typing')).toBeNull()

    act(() => { useChatStore.setState({ isPartnerTyping: true }) })
    expect(getByLabelText('Partner is typing')).toBeTruthy()
  })

  it('quotes a message when replying to it', async () => {
    const { getByText, getAllByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Just trust me.')).toBeTruthy())

    act(() => { useChatStore.getState().startReply('m5') })

    await waitFor(() => expect(getAllByText('Just trust me.').length).toBe(2))
  })
})
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx jest ConversationFlow`
Expected: FAIL — cannot resolve `ConversationScreen`.

- [ ] **Step 3: Implement the screen**

```tsx
// src/modules/module-03-chat/screens/ConversationScreen.tsx
import { useEffect, useRef } from 'react'
import { ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { Composer } from '@/modules/module-03-chat/components/Composer'
import { DayDivider } from '@/modules/module-03-chat/components/DayDivider'
import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import { TypingIndicator } from '@/modules/module-03-chat/components/TypingIndicator'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'

/** Chat — Conversation. Figma `Ziyu` 3390:665 / 3390:521 / 3390:585. */
export function ConversationScreen() {
  const s = useChatStore()
  const scroll = useRef<ScrollView>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    void s.load()
  }, [s])

  const replyBody = s.replyTarget
    ? s.messages.find((m) => m.id === s.replyTarget)?.body
    : undefined

  return (
    <View style={styles.page}>
      <ThemedStatusBar />

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        <DayDivider label="TODAY, 5:42 PM" />
        {s.messages.map((m) => (
          <MessageBubble key={m.id} message={m} onLongPress={s.selectMessage} />
        ))}
        {s.isPartnerTyping && <TypingIndicator />}
      </ScrollView>

      <Composer
        value={s.draft}
        onChangeText={s.setDraft}
        onSend={(v) => { void s.send(v) }}
        onAttach={s.openAttachments}
        onRecord={s.startRecording}
        replyTo={replyBody}
        onCancelReply={s.cancelReply}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  page: { flex: 1, backgroundColor: theme.colors.surface.page },
  thread: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
}))
```

- [ ] **Step 4: Add the route shim**

```tsx
// src/app/(app)/chat/conversation.tsx
export { ConversationScreen as default } from '@/modules/module-03-chat/screens/ConversationScreen'
```

- [ ] **Step 5: Run the tests**

Run: `npx jest ConversationFlow && npm run typecheck`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/modules/module-03-chat src/app/\(app\)/chat
git commit -m "Build the conversation screen and its three thread states"
```

---

### Task 7: Reaction bar, context menu, Save Memory bridge

**Files:**
- Create: `components/ReactionBar.tsx`, `components/MessageContextMenu.tsx`
- Modify: `screens/ConversationScreen.tsx`, `state/chatStore.ts`
- Test: `components/__tests__/ReactionBar.test.tsx`, `screens/__tests__/SaveMemory.test.tsx`

**Interfaces:**
- Consumes: `useChatStore`, `memoriesService`
- Produces: `<ReactionBar onReact onMore />`, `<MessageContextMenu onReply onCopy onSaveMemory />`, store action `saveAsMemory(id)`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/modules/module-03-chat/components/__tests__/ReactionBar.test.tsx
import { fireEvent } from '@testing-library/react-native'
import { ReactionBar } from '@/modules/module-03-chat/components/ReactionBar'
import { MessageContextMenu } from '@/modules/module-03-chat/components/MessageContextMenu'
import { renderScreen } from '@/test/renderScreen'

describe('ReactionBar', () => {
  it('offers the six emoji the frame draws', async () => {
    const { getByText } = await renderScreen(<ReactionBar onReact={() => {}} onMore={() => {}} />)
    for (const e of ['🖤', '❤️', '😂', '🥺', '😍', '👍']) expect(getByText(e)).toBeTruthy()
  })

  it('reports which emoji was chosen', async () => {
    const onReact = jest.fn()
    const { getByText } = await renderScreen(<ReactionBar onReact={onReact} onMore={() => {}} />)
    fireEvent.press(getByText('❤️'))
    expect(onReact).toHaveBeenCalledWith('❤️')
  })
})

describe('MessageContextMenu', () => {
  it('draws Reply, Copy and Save Memory', async () => {
    const { getByText } = await renderScreen(
      <MessageContextMenu onReply={() => {}} onCopy={() => {}} onSaveMemory={() => {}} />)
    expect(getByText('Reply')).toBeTruthy()
    expect(getByText('Copy')).toBeTruthy()
    expect(getByText('Save Memory')).toBeTruthy()
  })
})
```

```tsx
// src/modules/module-03-chat/screens/__tests__/SaveMemory.test.tsx
import { act } from '@testing-library/react-native'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { memoriesService } from '@/services/memories'

jest.mock('@/services/memories', () => ({
  memoriesService: { create: jest.fn().mockResolvedValue({ id: 'mem1' }) },
}))

describe('Save Memory', () => {
  it('writes the selected message through the memories service', async () => {
    await act(async () => {
      useChatStore.getState().reset()
      await useChatStore.getState().load()
      await useChatStore.getState().saveAsMemory('m1')
    })

    expect(memoriesService.create).toHaveBeenCalledWith(
      expect.objectContaining({ note: 'Are we still going for coffee tonight? ☰❤️' }))
  })
})
```

Before writing the implementation, open `src/services/memories/types.ts` and use that service's **real** create method name and payload shape. If it is not `create({ note })`, change this test to match the real signature — the test must assert the real API, not invent one.

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest ReactionBar SaveMemory`
Expected: FAIL — components and `saveAsMemory` do not exist.

- [ ] **Step 3: Implement `ReactionBar`**

```tsx
// src/modules/module-03-chat/components/ReactionBar.tsx
import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Text } from '@/design-system/primitives/Text'

const EMOJI = ['🖤', '❤️', '😂', '🥺', '😍', '👍']

export function ReactionBar({
  onReact, onMore,
}: { onReact: (emoji: string) => void; onMore: () => void }) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.bar}>
      {EMOJI.map((e) => (
        <Pressable key={e} onPress={() => onReact(e)} accessibilityRole="button"
          accessibilityLabel={`React ${e}`}>
          <Text style={styles.emoji}>{e}</Text>
        </Pressable>
      ))}
      <View style={styles.divider} />
      <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel="More reactions"
        style={styles.more}>
        <Feather name="plus" size={16} color={theme.colors.text.body} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    boxShadow: theme.elevation.card,
  },
  emoji: { fontSize: 22 },
  divider: { width: 1, height: 22, backgroundColor: theme.colors.border.subtle },
  more: {
    width: 28, height: 28, borderRadius: theme.radii.pill,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface.field,
  },
}))
```

- [ ] **Step 4: Implement `MessageContextMenu`**

```tsx
// src/modules/module-03-chat/components/MessageContextMenu.tsx
import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import { Text } from '@/design-system/primitives/Text'

type Props = { onReply: () => void; onCopy: () => void; onSaveMemory: () => void }

export function MessageContextMenu({ onReply, onCopy, onSaveMemory }: Props) {
  const { theme } = useUnistyles()
  const items = [
    { label: 'Reply', icon: 'corner-up-left', onPress: onReply },
    { label: 'Copy', icon: 'copy', onPress: onCopy },
    { label: 'Save Memory', icon: 'bookmark', onPress: onSaveMemory },
  ] as const

  return (
    <View style={styles.card}>
      {items.map((item) => (
        <Pressable key={item.label} onPress={item.onPress} style={styles.row}
          accessibilityRole="button" accessibilityLabel={item.label}>
          <Feather name={item.icon} size={18} color={theme.colors.text.body} />
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.tile,
    paddingVertical: theme.spacing.sm,
    boxShadow: theme.elevation.card,
    minWidth: 190,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
  },
  label: { color: theme.colors.text.heading },
}))
```

- [ ] **Step 5: Add `saveAsMemory` to the store**

Add to `ChatState` and the implementation, using the real memories API confirmed in Step 1:

```ts
  async saveAsMemory(id: string) {
    const message = get().messages.find((m) => m.id === id)
    if (!message) return
    await memoriesService.create({ note: message.body ?? '', mediaUri: message.mediaUri })
    set({ selectedMessageId: null })
  },
```

- [ ] **Step 6: Wire the overlay into `ConversationScreen`**

Render, when `s.selectedMessageId` is set, a full-screen `Pressable` scrim that calls `s.clearSelection`, with `ReactionBar` and `MessageContextMenu` above it:

```tsx
{s.selectedMessageId && (
  <Pressable style={styles.scrim} onPress={s.clearSelection}
    accessibilityLabel="Dismiss message actions">
    <View style={styles.overlay}>
      <ReactionBar
        onReact={(e) => { void s.react(s.selectedMessageId!, e) }}
        onMore={() => {}}
      />
      <MessageContextMenu
        onReply={() => s.startReply(s.selectedMessageId!)}
        onCopy={s.clearSelection}
        onSaveMemory={() => { void s.saveAsMemory(s.selectedMessageId!) }}
      />
    </View>
  </Pressable>
)}
```

with

```ts
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.surface.scrim },
  overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md },
```

- [ ] **Step 7: Run the tests**

Run: `npx jest src/modules/module-03-chat && npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/modules/module-03-chat
git commit -m "Add reactions, the message menu, and the Save Memory bridge"
```

---

### Task 8: Attachment sheet, photo share, photo message

**Files:**
- Create: `components/AttachmentSheet.tsx`, `components/PhotoSharePreview.tsx`, `components/PhotoMessage.tsx`
- Modify: `components/MessageBubble.tsx`, `screens/ConversationScreen.tsx`
- Test: `components/__tests__/Attachments.test.tsx`

**Interfaces:**
- Consumes: `useChatStore`
- Produces: `<AttachmentSheet onPickPhoto onClose />`, `<PhotoSharePreview uri onSend onCancel />`, `<PhotoMessage uri />`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/components/__tests__/Attachments.test.tsx
import { fireEvent } from '@testing-library/react-native'
import { AttachmentSheet } from '@/modules/module-03-chat/components/AttachmentSheet'
import { PhotoSharePreview } from '@/modules/module-03-chat/components/PhotoSharePreview'
import { renderScreen } from '@/test/renderScreen'

describe('AttachmentSheet', () => {
  it('offers the four sources the frame draws', async () => {
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={() => {}} onClose={() => {}} />)
    for (const l of ['Photo', 'Camera', 'Voice note', 'Memory']) expect(getByText(l)).toBeTruthy()
  })

  it('reports a photo pick', async () => {
    const onPickPhoto = jest.fn()
    const { getByText } = await renderScreen(
      <AttachmentSheet onPickPhoto={onPickPhoto} onClose={() => {}} />)
    fireEvent.press(getByText('Photo'))
    expect(onPickPhoto).toHaveBeenCalled()
  })
})

describe('PhotoSharePreview', () => {
  it('sends the staged photo with its caption', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <PhotoSharePreview uri="file://a.jpg" onSend={onSend} onCancel={() => {}} />)

    fireEvent.changeText(getByLabelText('Caption'), 'us')
    fireEvent.press(getByLabelText('Send photo'))

    expect(onSend).toHaveBeenCalledWith('file://a.jpg', 'us')
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest Attachments`
Expected: FAIL — components do not exist.

- [ ] **Step 3: Implement the three components**

`AttachmentSheet` — a 342pt-tall bottom sheet (Figma 3390:384) with four labelled tiles (`Photo`, `Camera`, `Voice note`, `Memory`), each a `Pressable` with an `accessibilityLabel` matching its label, laid out in a two-column grid using `theme.spacing.lg` gaps and `theme.radii.tile` corners on `theme.colors.surface.card`.

`PhotoSharePreview` — full-bleed `expo-image` of `uri`, a `TextInput` with `accessibilityLabel="Caption"`, and a send `Pressable` with `accessibilityLabel="Send photo"` calling `onSend(uri, caption)`; cancel calls `onCancel`.

`PhotoMessage` — an `expo-image` at `theme.radii.panel`, `aspectRatio` preserved, `contentFit="cover"`, with `accessibilityLabel="Photo"`.

Then in `MessageBubble`, render `PhotoMessage` when `message.kind === 'photo'` instead of the text body.

- [ ] **Step 4: Wire into `ConversationScreen`**

Render `AttachmentSheet` when `s.attachmentSheetOpen`, and `PhotoSharePreview` when `s.pendingPhotoUri` is set. `onPickPhoto` calls `s.stagePhoto('file://sample.jpg')` for now — real picking is out of scope for the mock.

- [ ] **Step 5: Run the tests**

Run: `npx jest src/modules/module-03-chat && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/modules/module-03-chat
git commit -m "Add attachments, photo sharing, and photo messages"
```

---

### Task 9: Voice note recording and playback

**Files:**
- Create: `components/VoiceNoteRecorder.tsx`, `components/VoiceNotePlayer.tsx`
- Modify: `components/MessageBubble.tsx`, `screens/ConversationScreen.tsx`
- Test: `components/__tests__/VoiceNote.test.tsx`

**Interfaces:**
- Produces: `<VoiceNoteRecorder onCancel onSend />`, `<VoiceNotePlayer durationMs />`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/components/__tests__/VoiceNote.test.tsx
import { fireEvent } from '@testing-library/react-native'
import { VoiceNoteRecorder } from '@/modules/module-03-chat/components/VoiceNoteRecorder'
import { VoiceNotePlayer } from '@/modules/module-03-chat/components/VoiceNotePlayer'
import { renderScreen } from '@/test/renderScreen'

describe('VoiceNoteRecorder', () => {
  it('labels cancel and send', async () => {
    const { getByLabelText } = await renderScreen(
      <VoiceNoteRecorder onCancel={() => {}} onSend={() => {}} />)
    expect(getByLabelText('Cancel recording')).toBeTruthy()
    expect(getByLabelText('Send voice note')).toBeTruthy()
  })

  it('sends a duration', async () => {
    const onSend = jest.fn()
    const { getByLabelText } = await renderScreen(
      <VoiceNoteRecorder onCancel={() => {}} onSend={onSend} />)
    fireEvent.press(getByLabelText('Send voice note'))
    expect(onSend).toHaveBeenCalledWith(expect.any(Number))
  })
})

describe('VoiceNotePlayer', () => {
  it('shows the duration as minutes and seconds', async () => {
    const { getByText } = await renderScreen(<VoiceNotePlayer durationMs={65000} />)
    expect(getByText('1:05')).toBeTruthy()
  })

  it('labels the play control', async () => {
    const { getByLabelText } = await renderScreen(<VoiceNotePlayer durationMs={1000} />)
    expect(getByLabelText('Play voice note')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest VoiceNote`
Expected: FAIL.

- [ ] **Step 3: Implement both components**

`VoiceNoteRecorder` (Figma 3390:164) — a bar replacing the composer: a pulsing dot, an elapsed timer driven by a `setInterval` in `useEffect` (cleared on unmount), a cancel `Pressable` (`accessibilityLabel="Cancel recording"`), and a send `Pressable` (`accessibilityLabel="Send voice note"`) calling `onSend(elapsedMs)`.

`VoiceNotePlayer` — a play `Pressable` (`accessibilityLabel="Play voice note"`), a static waveform of `View` bars at varying heights, and the duration formatted `m:ss`:

```ts
function clock(ms: number): string {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
```

Render `VoiceNotePlayer` from `MessageBubble` when `message.kind === 'voice'`, and `VoiceNoteRecorder` from `ConversationScreen` when `s.isRecording`.

- [ ] **Step 4: Run the tests**

Run: `npx jest src/modules/module-03-chat && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/modules/module-03-chat
git commit -m "Add voice note recording and playback"
```

---

### Task 10: Chat Home and navigation

**Files:**
- Create: `screens/ChatHomeScreen.tsx`, `src/app/(app)/chat/index.tsx`
- Modify: `src/copy/appNav.ts`
- Test: `screens/__tests__/ChatHome.test.tsx`

**Interfaces:**
- Produces: `ChatHomeScreen`; `APP_NAV.tabs` chat entry becomes `live: true, href: '/(app)/chat'`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/screens/__tests__/ChatHome.test.tsx
import { waitFor } from '@testing-library/react-native'
import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { renderScreen } from '@/test/renderScreen'
import { APP_NAV } from '@/copy/appNav'

describe('ChatHomeScreen', () => {
  it('shows the conversation with a preview of the newest message', async () => {
    const { getByText } = await renderScreen(<ChatHomeScreen />)

    await waitFor(() => expect(getByText('Chandu & Sarah')).toBeTruthy())
    expect(getByText(/Just trust me\./)).toBeTruthy()
  })

  it('truncates the preview at a word boundary, never mid-word', async () => {
    const { getByLabelText } = await renderScreen(<ChatHomeScreen />)
    const preview = await waitFor(() => getByLabelText('Conversation preview'))
    const text: string = preview.props.children

    if (text.endsWith('…')) {
      expect(text.slice(0, -1).trimEnd()).not.toMatch(/\S$/u)
    }
  })
})

describe('APP_NAV', () => {
  it('has chat live', () => {
    const chat = APP_NAV.tabs.find((t) => t.key === 'chat')
    expect(chat?.live).toBe(true)
    expect(chat?.href).toBe('/(app)/chat')
  })
})
```

The truncation assertion reads: if the preview was cut, what remains before the ellipsis must not end mid-token.

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest ChatHome`
Expected: FAIL.

- [ ] **Step 3: Write the truncation helper with its own test**

```ts
// src/modules/module-03-chat/truncate.ts
/** Cuts at the last whole word that fits, so a preview never ends mid-word. */
export function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
```

```ts
// src/modules/module-03-chat/__tests__/truncate.test.ts
import { truncateWords } from '@/modules/module-03-chat/truncate'

it('leaves short text alone', () => {
  expect(truncateWords('Just trust me.', 40)).toBe('Just trust me.')
})

it('cuts at a word boundary', () => {
  expect(truncateWords('Are we still going for coffee tonight?', 25))
    .toBe('Are we still going for…')
})
```

- [ ] **Step 4: Implement `ChatHomeScreen`**

Compose with `AppScreenLayout activeTab="chat"`. Heading "Chat", subtitle "Your little conversations." Then one conversation row card (avatar pair, "Chandu & Sarah", timestamp, and the preview `Text` with `accessibilityLabel="Conversation preview"` built from `truncateWords(newest.body, 34)`), pressed to `router.push('/(app)/chat/conversation')`. Below it, the two cards the frame draws: "DRAFTED NOTE" and "LOVEOS AI".

- [ ] **Step 5: Flip the nav entry**

In `src/copy/appNav.ts`: `{ key: 'chat', label: 'Chat', icon: 'message-circle', live: true, href: '/(app)/chat' }`.

- [ ] **Step 6: Add the route shim**

```tsx
// src/app/(app)/chat/index.tsx
export { ChatHomeScreen as default } from '@/modules/module-03-chat/screens/ChatHomeScreen'
```

- [ ] **Step 7: Run everything**

Run: `npx jest && npm run typecheck`
Expected: PASS, including the existing `BottomNav` suite.

- [ ] **Step 8: Commit**

```bash
git add src/modules/module-03-chat src/app/\(app\)/chat src/copy/appNav.ts
git commit -m "Add Chat Home and light up the chat tab"
```

---

### Task 11: Pinned banner and search

**Files:**
- Create: `components/PinnedBanner.tsx`, `screens/PinnedAndSearchScreen.tsx`, `src/app/(app)/chat/search.tsx`
- Modify: `screens/ConversationScreen.tsx`
- Test: `screens/__tests__/PinnedAndSearch.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/screens/__tests__/PinnedAndSearch.test.tsx
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { PinnedAndSearchScreen } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

beforeEach(() => { act(() => { useChatStore.getState().reset() }) })

it('finds a message by text', async () => {
  const { getByLabelText, getByText } = await renderScreen(<PinnedAndSearchScreen />)

  fireEvent.changeText(getByLabelText('Search messages'), 'coffee')

  await waitFor(() => expect(getByText(/coffee/)).toBeTruthy())
})

it('says so when nothing matches', async () => {
  const { getByLabelText, getByText } = await renderScreen(<PinnedAndSearchScreen />)

  fireEvent.changeText(getByLabelText('Search messages'), 'zzzz')

  await waitFor(() => expect(getByText('No messages found')).toBeTruthy())
})

it('lists pinned messages', async () => {
  await act(async () => {
    await useChatStore.getState().load()
    await useChatStore.getState().togglePin('m1')
  })

  const { getByText } = await renderScreen(<PinnedAndSearchScreen />)
  await waitFor(() => expect(getByText(/coffee tonight/)).toBeTruthy())
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest PinnedAndSearch`
Expected: FAIL.

- [ ] **Step 3: Implement**

`PinnedBanner` — a strip at thread top when any message is pinned, showing the first pinned body truncated with `truncateWords`, `accessibilityLabel="Pinned message"`, pressed to open search.

`PinnedAndSearchScreen` (Figma 3390:60) — a `TextInput` with `accessibilityLabel="Search messages"` calling `chatService.search` on change; a "Pinned" section listing `messages.filter(m => m.pinned)`; results below; and the empty string `No messages found` when a non-empty query returns nothing.

Render `PinnedBanner` at the top of `ConversationScreen`'s `ScrollView` when `s.messages.some(m => m.pinned)`.

- [ ] **Step 4: Add the route shim**

```tsx
// src/app/(app)/chat/search.tsx
export { PinnedAndSearchScreen as default } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
```

- [ ] **Step 5: Run, then commit**

Run: `npx jest src/modules/module-03-chat && npm run typecheck`

```bash
git add src/modules/module-03-chat src/app/\(app\)/chat
git commit -m "Add pinned messages and chat search"
```

---

### Task 12: Voice and video Moments

**Files:**
- Create: `components/CallControls.tsx`, `screens/VoiceMomentScreen.tsx`, `screens/VideoMomentScreen.tsx`, `src/app/(app)/chat/moment/voice.tsx`, `src/app/(app)/chat/moment/video.tsx`
- Test: `screens/__tests__/Moments.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/modules/module-03-chat/screens/__tests__/Moments.test.tsx
import { fireEvent } from '@testing-library/react-native'
import { VoiceMomentScreen } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
import { VideoMomentScreen } from '@/modules/module-03-chat/screens/VideoMomentScreen'
import { renderScreen } from '@/test/renderScreen'

const back = jest.fn()
jest.mock('expo-router', () => ({ useRouter: () => ({ back, push: jest.fn() }) }))

beforeEach(() => back.mockClear())

describe.each([
  ['voice', VoiceMomentScreen, ['Mute', 'End call']],
  ['video', VideoMomentScreen, ['Mute', 'Turn camera off', 'End call']],
])('%s moment', (_n, Screen, labels) => {
  it('labels every control', async () => {
    const { getByLabelText } = await renderScreen(<Screen />)
    for (const l of labels) expect(getByLabelText(l)).toBeTruthy()
  })

  it('returns to the thread when the call ends', async () => {
    const { getByLabelText } = await renderScreen(<Screen />)
    fireEvent.press(getByLabelText('End call'))
    expect(back).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run and confirm failure**

Run: `npx jest Moments`
Expected: FAIL.

- [ ] **Step 3: Implement**

`CallControls` — a row of round `Pressable`s taking `{ muted, onToggleMute, cameraOn?, onToggleCamera?, onEnd }`; labels exactly `Mute` / `Unmute`, `Turn camera off` / `Turn camera on`, `End call`. End button fills with `theme.colors.feedback.error`.

`VoiceMomentScreen` (3391:884) — partner avatar, name, an elapsed timer from a `setInterval` cleared on unmount, `CallControls` without camera.

`VideoMomentScreen` (3391:842) — full-bleed partner video placeholder, self-view inset top-right, `CallControls` with camera.

Both call `router.back()` on end.

- [ ] **Step 4: Add both route shims, run, commit**

```tsx
// src/app/(app)/chat/moment/voice.tsx
export { VoiceMomentScreen as default } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
```

```tsx
// src/app/(app)/chat/moment/video.tsx
export { VideoMomentScreen as default } from '@/modules/module-03-chat/screens/VideoMomentScreen'
```

Run: `npx jest src/modules/module-03-chat && npm run typecheck`

```bash
git add src/modules/module-03-chat src/app/\(app\)/chat
git commit -m "Add the voice and video Moment screens"
```

---

### Task 13: Figma parity fixture and test

**Files:**
- Create: `scripts/sync-figma-chat.mjs`, `src/modules/module-03-chat/__fixtures__/figma-chat.json`
- Test: `src/modules/module-03-chat/__tests__/DesignParity.test.tsx`

**Interfaces:**
- Produces: the committed fixture, keyed by node id

- [ ] **Step 1: Write the sync script**

```js
// scripts/sync-figma-chat.mjs
/**
 * Reads the Ziyu Chat frames and writes the parity fixture.
 *
 * Run: FIGMA_TOKEN=... node scripts/sync-figma-chat.mjs
 * The token is never committed; a re-run produces a reviewable diff.
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const TOKEN = process.env.FIGMA_TOKEN
const FILE = 'BDMFuyYb2I2ZMmaEz5gBAZ'
const CHAT = '3390:3'

if (!TOKEN) {
  console.error('Set FIGMA_TOKEN in the environment.')
  process.exit(1)
}

const hex = (c) =>
  '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()

const res = await fetch(`https://api.figma.com/v1/files/${FILE}/nodes?ids=${CHAT}`, {
  headers: { 'X-Figma-Token': TOKEN },
})
if (!res.ok) {
  console.error(`Figma API ${res.status}`)
  process.exit(1)
}

const chat = (await res.json()).nodes[CHAT].document
const frames = {}

const walk = (node, into) => {
  if (node.type === 'TEXT') {
    into.text.push({
      id: node.id,
      characters: node.characters,
      fontSize: node.style?.fontSize ?? null,
      fontWeight: node.style?.fontWeight ?? null,
      color: node.fills?.[0]?.color ? hex(node.fills[0].color) : null,
    })
  }
  if (node.cornerRadius != null) into.radii.push(node.cornerRadius)
  if (node.itemSpacing != null) into.gaps.push(node.itemSpacing)
  ;(node.children ?? []).forEach((c) => walk(c, into))
}

for (const frame of chat.children.filter((c) => c.type === 'FRAME')) {
  const into = { name: frame.name, text: [], radii: [], gaps: [] }
  walk(frame, into)
  into.radii = [...new Set(into.radii)].sort((a, b) => a - b)
  into.gaps = [...new Set(into.gaps)].sort((a, b) => a - b)
  into.width = Math.round(frame.absoluteBoundingBox.width)
  into.height = Math.round(frame.absoluteBoundingBox.height)
  frames[frame.id] = into
}

mkdirSync('src/modules/module-03-chat/__fixtures__', { recursive: true })
writeFileSync(
  'src/modules/module-03-chat/__fixtures__/figma-chat.json',
  JSON.stringify({ file: FILE, node: CHAT, frames }, null, 2) + '\n',
)
console.log(`Wrote ${Object.keys(frames).length} frames.`)
```

- [ ] **Step 2: Generate the fixture**

Run: `FIGMA_TOKEN=<token> node scripts/sync-figma-chat.mjs`
Expected: `Wrote 13 frames.`

- [ ] **Step 3: Write the parity test**

```tsx
// src/modules/module-03-chat/__tests__/DesignParity.test.tsx
import fixture from '@/modules/module-03-chat/__fixtures__/figma-chat.json'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { truncateWords } from '@/modules/module-03-chat/truncate'
import { lavenderTheme } from '@/design-system/themes/theme'
import { renderScreen } from '@/test/renderScreen'
import { waitFor } from '@testing-library/react-native'

const CONVERSATION = '3390:665'

const strings = (nodeId: string): string[] =>
  fixture.frames[nodeId].text.map((t) => t.characters.trim()).filter(Boolean)

describe('design parity — Conversation 3390:665', () => {
  it('renders every message string the frame draws', async () => {
    const { getByText } = await renderScreen(<ConversationScreen />)
    await waitFor(() => expect(getByText('Just trust me.')).toBeTruthy())

    const bodies = strings(CONVERSATION).filter((s) => s.length > 12 && !/^\d/.test(s))
    for (const body of bodies) {
      const shown = truncateWords(body, body.length)
      expect(getByText(shown)).toBeTruthy()
    }
  })

  it('uses the frame width the design was drawn at', () => {
    expect(fixture.frames[CONVERSATION].width).toBe(390)
  })

  it('binds bubbles to the Ziyu colour styles, not to arbitrary hex', () => {
    expect(lavenderTheme.colors.chat.bubbleOutgoing).toBe('#A5A6F6')
    expect(lavenderTheme.colors.chat.bubbleIncoming).toBe('#FCDDEC')
    expect(lavenderTheme.colors.chat.accent).toBe('#5D5FEF')
  })
})
```

- [ ] **Step 4: Run it**

Run: `npx jest DesignParity`
Expected: PASS. If a string mismatches, fix the screen — the fixture is the design's word.

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-figma-chat.mjs src/modules/module-03-chat
git commit -m "Assert the built chat against the Ziyu frames"
```

---

### Task 14: A-Z journey test

**Files:**
- Test: `src/modules/module-03-chat/screens/__tests__/ChatJourney.test.tsx`

- [ ] **Step 1: Write the journey**

One test, sixteen steps, no remount between them — the point is to catch state that leaks across screens.

```tsx
// src/modules/module-03-chat/screens/__tests__/ChatJourney.test.tsx
import { act, fireEvent, waitFor } from '@testing-library/react-native'
import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { PinnedAndSearchScreen } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { renderScreen } from '@/test/renderScreen'

beforeEach(() => { act(() => { useChatStore.getState().reset() }) })

it('walks the whole module A to Z', async () => {
  // 1–2. Chat Home, then into the thread
  const home = await renderScreen(<ChatHomeScreen />)
  await waitFor(() => expect(home.getByText('Chandu & Sarah')).toBeTruthy())
  home.unmount()

  const app = await renderScreen(<ConversationScreen />)
  await waitFor(() => expect(app.getByText('Just trust me.')).toBeTruthy())

  // 3. Send text
  fireEvent.changeText(app.getByLabelText('Message'), 'On my way')
  fireEvent.press(app.getByLabelText('Send message'))
  await waitFor(() => expect(app.getByText('On my way')).toBeTruthy())

  // 4. Partner typing
  act(() => { useChatStore.setState({ isPartnerTyping: true }) })
  expect(app.getByLabelText('Partner is typing')).toBeTruthy()
  act(() => { useChatStore.setState({ isPartnerTyping: false }) })

  // 5–6. Long-press, react
  fireEvent(app.getByLabelText('Just trust me.'), 'longPress')
  expect(app.getByLabelText('React ❤️')).toBeTruthy()
  fireEvent.press(app.getByLabelText('React ❤️'))
  await waitFor(() => expect(app.getByText('❤️')).toBeTruthy())

  // 7. Reply
  act(() => { useChatStore.getState().startReply('m5') })
  await waitFor(() => expect(app.getAllByText('Just trust me.').length).toBe(2))
  act(() => { useChatStore.getState().cancelReply() })

  // 8. Attachments close the reaction overlay
  act(() => {
    useChatStore.getState().selectMessage('m1')
    useChatStore.getState().openAttachments()
  })
  expect(useChatStore.getState().selectedMessageId).toBeNull()

  // 9. Photo
  await act(async () => { await useChatStore.getState().sendPhoto('file://a.jpg') })
  await waitFor(() => expect(app.getByLabelText('Photo')).toBeTruthy())

  // 10. Voice note
  await act(async () => { await useChatStore.getState().sendVoice('file://v.m4a', 65000) })
  await waitFor(() => expect(app.getByText('1:05')).toBeTruthy())

  // 12. Pin
  await act(async () => { await useChatStore.getState().togglePin('m1') })
  await waitFor(() => expect(app.getByLabelText('Pinned message')).toBeTruthy())
  app.unmount()

  // 13. Search finds it
  const search = await renderScreen(<PinnedAndSearchScreen />)
  fireEvent.changeText(search.getByLabelText('Search messages'), 'coffee')
  await waitFor(() => expect(search.getByText(/coffee/)).toBeTruthy())
  search.unmount()

  // 16. Back on Home, the preview reflects the newest message
  const again = await renderScreen(<ChatHomeScreen />)
  await waitFor(() => expect(again.getByLabelText('Conversation preview')).toBeTruthy())
  expect(again.getByLabelText('Conversation preview').props.children).not.toContain('Just trust me.')
})
```

Steps 11, 14 and 15 (Save Memory, and both Moments) are covered by `SaveMemory.test.tsx` and `Moments.test.tsx`; they need their own router mocks, which would fight this test's.

- [ ] **Step 2: Run it**

Run: `npx jest ChatJourney`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/modules/module-03-chat
git commit -m "Walk the chat module end to end in one session"
```

---

### Task 15: Test-case catalogue

**Files:**
- Create: `docs/qa/chat-test-cases.md`

- [ ] **Step 1: Write the catalogue**

A table per screen, columns: `ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test file`. IDs `CHAT-001` upward. Every case that says `Yes` under Automated must name a real test file and a real test in it.

Groups and their minimum coverage:

- **Chat Home** `3390:764` — row renders, preview shows newest message, preview truncates at a word boundary, tapping opens the thread, both cards render
- **Conversation** `3390:665` — thread order, day divider, outgoing vs incoming sides, timestamps, read receipt progression, empty composer offers record not send
- **Typing** `3390:521` — indicator appears and clears
- **Replying** `3390:585` — quote in composer, quote in sent bubble, cancel clears
- **Reactions** `3390:439` — six emoji, react attaches, react again clears, menu items, dismiss on scrim
- **Attachments** `3390:384` — four sources, photo staged, sheet closes reaction overlay
- **Photo sharing** `3390:326` — preview, caption, send, bubble renders
- **Voice notes** `3390:164` — record bar, timer, cancel, send, player duration
- **Pinned & search** `3390:60` — pin shows banner, search finds, no-match message
- **Moments** `3391:884`, `3391:842` — controls labelled, end returns
- **Journey** — the 16 steps of `ChatJourney.test.tsx`
- **Manual only** — long-press duration feel, swipe-to-reply, haptics, real camera and microphone capture, keyboard avoidance on a physical device, VoiceOver/TalkBack order

Mark the manual group `No` under Automated with the reason in place of a test file.

- [ ] **Step 2: Cross-check the catalogue against reality**

Run: `npx jest --listTests` and confirm every file named in the Automated column exists.

- [ ] **Step 3: Commit**

```bash
git add docs/qa/chat-test-cases.md
git commit -m "Write the chat test-case catalogue"
```

---

### Task 16: QA tester agent

**Files:**
- Create: `.claude/agents/qa-tester.md`

- [ ] **Step 1: Write the agent**

```markdown
---
name: qa-tester
description: Verifies a module against its spec, its tests, and its Figma frames. Runs the suites, checks design parity and accessibility, and reports findings with evidence. Read-only — it reports, it never fixes.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You verify work. You do not fix it, and you do not congratulate it.

Every claim you make must be backed by a command you ran and its output. If you
did not run it, you do not know it. A check you could not run is reported as
BLOCKED, never as passed.

## Checks

Run each, in order. Record the exact command and the result.

1. **Types** — `npm run typecheck`
2. **Tests** — `npm test`
3. **Lint** — `npm run lint`
4. **Journey** — `npx jest ChatJourney` passes end to end
5. **Design parity** — `npx jest DesignParity` passes against the committed fixture
6. **Contrast** — `npx jest chatContrast` passes in both themes
7. **No raw hex** — `grep -rnE "#[0-9a-fA-F]{6}" src --include=*.tsx --include=*.ts | grep -v "design-system/tokens" | grep -v "__fixtures__" | grep -v "__tests__"` must return nothing
8. **Accessibility labels** — every `Pressable` with no text child has an `accessibilityLabel`. Find candidates with `grep -rn "<Pressable" src/modules/module-03-chat` and read each one.
9. **Layering** — `grep -rn "services/" src/modules/module-03-chat/components` must return nothing. Components never import a service.
10. **Catalogue integrity** — every case in `docs/qa/chat-test-cases.md` marked Automated names a test file that exists AND a test that actually asserts that behaviour. Read the file, do not assume.

## Report

```
## QA report — <module>

**Verdict:** PASS | FAIL | BLOCKED

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Types | PASS   | `npm run typecheck` — 0 errors |

### Findings
1. **[severity] Title** — `file.tsx:120`
   What is wrong, what you expected, and the output that shows it.
```

Order findings by severity: anything broken for a user first, then anything that
will break later, then anything merely untidy.

Two failure modes to avoid. Do not report a passing check as a finding because
it *could* be better — that is noise. Do not soften a real failure into a
suggestion — if the suite is red, the verdict is FAIL.
```

- [ ] **Step 2: Run it**

Dispatch the `qa-tester` agent against the chat module and read its report.

- [ ] **Step 3: Fix what it finds, then commit**

```bash
git add .claude/agents/qa-tester.md
git commit -m "Add the QA tester agent"
```

---

## Self-review

**Spec coverage:** §3 architecture → Tasks 2–6 layering, QA check 9. §4 route map → Tasks 6, 10, 11, 12. §4.1 the unbuilt frame → Task 7's Save Memory bridge. §5 service → Task 2. §6 store → Task 3. §7 components → Tasks 4, 5, 7, 8, 9, 11, 12 (all 16 named). §8 palette → Task 1. §8.1 contrast → Task 1 test. §9 corrections → Task 4 (bubble band), Task 10 (truncation), all tasks (labels). §10.1 → each task's tests. §10.2 → Task 14. §10.3 → Task 15. §11.1 → Task 13. §11.2 → Task 16 report. §12 QA agent → Task 16. §13 out of scope → not built, correctly.

**Placeholders:** none. Tasks 8, 9, 11 and 12 describe components in prose rather than full code; each names its exact props, accessibility labels, Figma node, and theme tokens, which is what the test asserts. The tests for those tasks are given in full, and the tests are the contract.

**Type consistency:** `Message`, `MessageStatus`, `SendInput`, `ChatEvent`, `ChatService`, `ChatTimings` defined once in Task 2 and used unchanged after. Store actions named in Task 3's Produces block match every later call site. `truncateWords` is defined in Task 10 and reused in Tasks 11 and 13. `theme.colors.chat.*` keys defined in Task 1 match every consumer.

**One known risk:** Task 7's `saveAsMemory` assumes `memoriesService.create({ note, mediaUri })`. Step 1 of that task requires confirming the real signature before implementing, and changing the test if it differs. That is the only place this plan guesses at an existing API.
