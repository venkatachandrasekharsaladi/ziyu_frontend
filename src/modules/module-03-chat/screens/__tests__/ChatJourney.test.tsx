import { act, fireEvent, waitFor } from '@testing-library/react-native'

import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { PinnedAndSearchScreen } from '@/modules/module-03-chat/screens/PinnedAndSearchScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { truncateWords } from '@/modules/module-03-chat/truncate'
import { chatService } from '@/services/chat'
import { memoriesService } from '@/services/memories'
import { renderScreen } from '@/test/renderScreen'

/**
 * Task 14 — the A-to-Z journey.
 *
 * Every screen in this module already has its own flow test
 * (`ChatHome.test.tsx`, `ConversationFlow.test.tsx`, `PinnedAndSearch.test.tsx`,
 * `SaveMemory.test.tsx`, `Moments.test.tsx`). Every one of those mounts a
 * screen fresh, drives it, and throws the tree away — which means every one
 * of them ALSO starts from a `reset()` store, and none of them can catch a
 * bug that only shows up when the SAME store instance is carried from one
 * screen to the next inside one continuous session, which is what actually
 * happens on the device: the user does not get a fresh `chatStore` every
 * time they navigate.
 *
 * What only a same-session test can catch:
 *  - A screen that quietly re-subscribes to `chatService` on every mount
 *    (chatStore.ts's `unsubscribe` guard exists ONLY because of this test —
 *    see that file's own header comment) would double- or triple-apply
 *    every future event once two screens in one session had both mounted.
 *  - A screen that reads a stale snapshot of `messages` instead of the live
 *    store would look correct in isolation (its own fixture matches its own
 *    assertions) and still show the couple yesterday's conversation once a
 *    second screen had moved the state on.
 *  - Selection/overlay state (`selectedMessageId`, `attachmentSheetOpen`,
 *    `replyTarget`) leaking across a screen boundary — invisible to a test
 *    that resets the store before every single case.
 *
 * So this file deliberately does the opposite of every sibling suite: ONE
 * `chatStore`, reset exactly once (`beforeEach`, before anything is
 * mounted), walked through Chat Home, into the thread, through text, a
 * reaction, a reply, attachments, a photo, a voice note, Save Memory, and a
 * pin, out to Pinned & Search, and back to Chat Home — asserting, on the
 * way back out, that the row now reflects the newest message rather than
 * the thread's original seed. Screens are unmounted only at the three
 * points the brief calls a real navigation (Home -> thread, thread ->
 * search, search -> Home); everything else stays mounted across steps,
 * which is the entire point.
 *
 * `chatService` is mocked wholesale (as every sibling screen suite does),
 * but NOT with static per-call `mockResolvedValue`s — those would have to
 * be sequenced by hand across sixteen steps and would defeat the "one real
 * session" premise the moment two screens' `load()` calls needed different
 * canned answers. Instead this is a small stateful fake that mirrors
 * `services/chat/mock.ts`'s own read/write behaviour (same seed, same
 * search/react/pin semantics) but with NONE of its background `setTimeout`
 * chains (status ticks, simulated typing, the auto-reply) — this test
 * drives typing and delivery itself, explicitly, so nothing here depends on
 * real wall-clock timers firing inside or after the test.
 *
 * Steps 11 (Save Memory) and the two Moment screens (14, 15) — the brief's
 * own numbering: `SaveMemory.test.tsx` and `Moments.test.tsx` cover them.
 * Save Memory is included here anyway (step 11 below) — mocking
 * `@/services/memories` alongside `@/services/chat` costs nothing and
 * introduces no conflict, and it is exactly the kind of cross-service
 * bridge this file exists to exercise mid-session. The two Moment screens
 * are left out: reaching them for real means following `router.push`,
 * which this harness cannot do (a mocked `push` is a spy, not a navigator),
 * so "including" them would mean mounting `VideoMomentScreen`/
 * `VoiceMomentScreen` as bare, unrelated trees — exactly the remount
 * `Moments.test.tsx` already does, with none of this file's continuity to
 * offer, so it would only add router-mock upkeep for zero coverage gain.
 */

/**
 * A stateful stand-in for `createMockChatService()` — same seed (mirrors
 * `services/chat/mock.ts`'s own `seed()` verbatim: Task 13 corrected this
 * text against the real Figma frame — no `☰` on `m1`, `😌` not `😊` on
 * `m3`), same mutation semantics (`react`/`togglePin`/`search` all read and
 * write one shared `messages` array, exactly like the real mock's own
 * closure over its own `messages`), but every method resolves immediately
 * with no `setTimeout` chain behind it. This file drives typing and
 * delivery explicitly (steps 3-4 below), so there is nothing here for a
 * background timer to simulate — and nothing left over to fire after the
 * test has finished.
 *
 * Every piece of this — the seed, the counter, the helpers — has to live
 * INSIDE the factory: `jest.mock`'s factory runs hoisted above every import
 * in this file, and babel-plugin-jest-hoist refuses to compile a factory
 * that closes over an outside variable (an out-of-scope `messages` fails
 * exactly this way), so there is nothing for it to reference but itself.
 */
jest.mock('@/services/chat', () => {
  // The fake's own message shape is an inline structural annotation, not a
  // named `type`/`interface` — babel-plugin-jest-hoist's out-of-scope check
  // does not understand a TS type alias (or a type-only import) referenced
  // from inside this factory, and flags the bare identifier as an illegal
  // outer-scope access even though it erases to nothing at runtime. Only a
  // literal type, with no identifier for the check to trip over, works here.
  const seedMessage = (
    id: string,
    authorId: 'me' | 'partner',
    body: string,
    min: number,
  ) => ({
    id,
    authorId,
    kind: 'text' as const,
    body,
    reactions: [] as { emoji: string; authorId: string }[],
    pinned: false,
    sentAt: new Date(Date.UTC(2026, 7, 30, 12, min)).toISOString(),
    status: 'read' as const,
  })

  let messages = [
    seedMessage('m1', 'partner', 'Are we still going for coffee tonight? ❤️', 42),
    seedMessage('m2', 'me', 'Obviously.', 43),
    seedMessage('m3', 'partner', 'Good. I found a place you might actually like \u{1F60C}', 44),
    seedMessage('m4', 'me', "That's a bold claim.", 45),
    seedMessage('m5', 'partner', 'Just trust me.', 45),
  ] as {
    id: string
    authorId: 'me' | 'partner'
    kind: 'text' | 'photo' | 'voice' | 'video'
    body?: string
    mediaUri?: string
    durationMs?: number
    replyToId?: string
    reactions: { emoji: string; authorId: string }[]
    pinned: boolean
    sentAt: string
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  }[]
  let sendCounter = 0

  const cloneMessage = (m: (typeof messages)[number]) => ({ ...m, reactions: [...m.reactions] })
  const findMessage = (id: string) => {
    const found = messages.find((m) => m.id === id)
    if (!found) throw new Error(`No message ${id}`)
    return found
  }
  const replaceMessage = (next: (typeof messages)[number]) => {
    messages = messages.map((m) => (m.id === next.id ? next : m))
    return next
  }

  return {
    chatService: {
      listMessages: jest.fn(async () => messages.map(cloneMessage)),

      sendMessage: jest.fn(async (input: {
        kind: 'text' | 'photo' | 'voice' | 'video'
        body?: string
        mediaUri?: string
        durationMs?: number
        replyToId?: string
      }) => {
        sendCounter += 1
        const message = {
          id: `sent-${sendCounter}`,
          authorId: 'me' as const,
          kind: input.kind,
          body: input.body,
          mediaUri: input.mediaUri,
          durationMs: input.durationMs,
          replyToId: input.replyToId,
          reactions: [] as { emoji: string; authorId: string }[],
          pinned: false,
          sentAt: new Date().toISOString(),
          status: 'sent' as const,
        }
        messages = [...messages, message]
        return message
      }),

      react: jest.fn(async (messageId: string, emoji: string) => {
        const current = findMessage(messageId)
        const has = current.reactions.some((r) => r.emoji === emoji && r.authorId === 'me')
        return replaceMessage({
          ...current,
          reactions: has
            ? current.reactions.filter((r) => !(r.emoji === emoji && r.authorId === 'me'))
            : [...current.reactions, { emoji, authorId: 'me' }],
        })
      }),

      togglePin: jest.fn(async (messageId: string) => {
        const current = findMessage(messageId)
        return replaceMessage({ ...current, pinned: !current.pinned })
      }),

      search: jest.fn(async (query: string) => {
        const q = query.trim().toLowerCase()
        if (!q) return []
        return messages.filter((m) => (m.body ?? '').toLowerCase().includes(q)).map(cloneMessage)
      }),

      subscribe: jest.fn(() => () => {}),
    },
  }
})

jest.mock('@/services/memories', () => ({
  memoriesService: { create: jest.fn() },
}))

const service = jest.mocked(chatService)
const memories = jest.mocked(memoriesService)

beforeEach(() => {
  memories.create.mockResolvedValue({
    ok: true,
    value: {
      id: 'memory-from-chat',
      title: 'Are we still going for coffee tonight? ❤️',
      date: '2026-08-30',
      tags: ['Little Things'],
      favorite: false,
    },
  })

  // Bare, not inside `act()` — the footgun every sibling suite in this
  // module documents: wrapping `reset()` in `act()` before anything is
  // mounted leaves the very next `render()` call's tree empty.
  useChatStore.getState().reset()
})

it('walks the whole module A to Z in one continuous session', async () => {
  // 1. Chat Home shows the couple's one conversation.
  const home = await renderScreen(<ChatHomeScreen />)
  await waitFor(() => expect(home.getByText('Chandu & Sarah')).toBeTruthy())
  await home.unmount()

  // 2. Into the thread.
  const app = await renderScreen(<ConversationScreen />)
  await waitFor(() => expect(app.getByText('Just trust me.')).toBeTruthy())

  // 3. Send text.
  await fireEvent.changeText(app.getByLabelText('Message'), 'On my way')
  await fireEvent.press(app.getByLabelText('Send message'))
  await waitFor(() => expect(app.getByText('On my way')).toBeTruthy())
  expect(service.sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'text', body: 'On my way' }),
  )

  // 4. Partner typing.
  await act(async () => { useChatStore.setState({ isPartnerTyping: true }) })
  expect(app.getByLabelText('Partner is typing')).toBeTruthy()
  await act(async () => { useChatStore.setState({ isPartnerTyping: false }) })
  expect(app.queryByLabelText('Partner is typing')).toBeNull()

  // 5-6. Long-press a bubble, then react to it.
  await fireEvent(app.getByLabelText('Just trust me.'), 'longPress')
  expect(app.getByLabelText('React ❤️')).toBeTruthy()
  await fireEvent.press(app.getByLabelText('React ❤️'))
  await waitFor(() => expect(app.getByText('❤️')).toBeTruthy())
  expect(service.react).toHaveBeenCalledWith('m5', '❤️')

  // 7. Reply — the composer quotes the target, so the same body renders
  // twice: once as the live bubble, once as the reply preview above it.
  await act(async () => { useChatStore.getState().startReply('m5') })
  await waitFor(() => expect(app.getAllByText('Just trust me.').length).toBe(2))
  await act(async () => { useChatStore.getState().cancelReply() })
  expect(useChatStore.getState().replyTarget).toBeNull()

  // 8. Opening attachments closes the reaction/selection overlay — the two
  // are mutually exclusive in `chatStore`, not merely two panels that
  // happen not to collide visually.
  await act(async () => {
    useChatStore.getState().selectMessage('m1')
    useChatStore.getState().openAttachments()
  })
  expect(useChatStore.getState().selectedMessageId).toBeNull()
  expect(useChatStore.getState().attachmentSheetOpen).toBe(true)

  // 9. Photo.
  await act(async () => { await useChatStore.getState().sendPhoto('file://a.jpg') })
  await waitFor(() => expect(app.getByLabelText('Photo')).toBeTruthy())
  expect(useChatStore.getState().attachmentSheetOpen).toBe(false)

  // 10. Voice note.
  await act(async () => { await useChatStore.getState().sendVoice('file://v.m4a', 65000) })
  await waitFor(() => expect(app.getByText('1:05')).toBeTruthy())

  // 11. Save Memory — the cross-service bridge (`chatStore.saveAsMemory` ->
  // `memoriesService.create`), exercised mid-session rather than against a
  // freshly reset store. Covered in isolation by `SaveMemory.test.tsx`;
  // included here too since mocking `@/services/memories` costs nothing and
  // conflicts with neither the router nor the chat-service fake above.
  await act(async () => {
    useChatStore.getState().selectMessage('m1')
    await useChatStore.getState().saveAsMemory('m1')
  })
  expect(memories.create).toHaveBeenCalledWith(
    expect.objectContaining({
      title: expect.stringContaining('coffee'),
      note: 'Are we still going for coffee tonight? ❤️',
      tags: ['Little Things'],
    }),
  )
  expect(useChatStore.getState().selectedMessageId).toBeNull()

  // 12. Pin `m1` — the pinned banner surfaces it at the top of the thread.
  await act(async () => { await useChatStore.getState().togglePin('m1') })
  await waitFor(() => expect(app.getByLabelText('Pinned message')).toBeTruthy())
  expect(service.togglePin).toHaveBeenCalledWith('m1')
  await app.unmount()

  // 13. Pinned & Search — `m1` is both pinned AND a "coffee" hit. Task 11
  // excludes a pinned message from the Results list, which is the only
  // reason this singular query doesn't throw on two matches (regression
  // guard: `PinnedAndSearch.test.tsx` pins this same case in isolation).
  const search = await renderScreen(<PinnedAndSearchScreen />)
  await fireEvent.changeText(search.getByLabelText('Search messages'), 'coffee')
  await waitFor(() => expect(search.getByText(/coffee/)).toBeTruthy())
  expect(search.queryByText('No messages found')).toBeNull()
  await search.unmount()

  // 16. Back on Chat Home — the row must reflect the newest message in the
  // SAME store the thread just wrote to, not a stale snapshot from this
  // screen's own first load. Computed from the live store rather than
  // hardcoded, so this fails on either a stale read (wrong string) or a
  // preview that silently stops tracking the newest message (wrong shape)
  // — not merely on one guessed string happening to still be absent.
  const again = await renderScreen(<ChatHomeScreen />)
  const preview = await waitFor(() => again.getByLabelText('Conversation preview'))
  const newest = useChatStore.getState().messages.at(-1)
  expect(newest).toBeDefined()
  expect(preview.props.children).toBe(truncateWords(newest?.body ?? '', 34))
  expect(preview.props.children).not.toContain('Just trust me.')
})
