import { act, screen, userEvent, waitFor } from '@testing-library/react-native'

import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { chatService } from '@/services/chat'
import type { ChatEvent, Message } from '@/services/chat/types'
import { renderScreen } from '@/test/renderScreen'

/**
 * The real `chatService` is a module-level singleton over ONE in-memory
 * thread with simulated latency — a message sent by one test would still be
 * there in the next, so the suite would pass or fail by execution order. It
 * is replaced wholesale, as `chatStore.test.ts` and `MemoriesFlow.test.tsx`
 * both already do, and every test states the answers it needs.
 *
 * The mock's own behaviour is covered by `services/chat/__tests__` — these
 * tests are about what the SCREEN does with an answer, not how it is produced.
 */
jest.mock('@/services/chat', () => ({
  chatService: {
    listMessages: jest.fn(),
    sendMessage: jest.fn(),
    react: jest.fn(),
    togglePin: jest.fn(),
    search: jest.fn(),
    subscribe: jest.fn(),
  },
}))

const service = jest.mocked(chatService)

/**
 * `router.push` for two routes (`chat/moment/video`, `chat/moment/voice`)
 * that do not exist yet — Task 12 creates them. This mock is exactly why
 * that is fine to build against today: the screen's job is to express the
 * navigation INTENT, which a plain jest.fn() can assert on, with no real
 * route needed to resolve it.
 */
const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}))

const message = (id: string, authorId: 'me' | 'partner', body: string): Message => ({
  id,
  authorId,
  kind: 'text',
  body,
  reactions: [],
  pinned: false,
  sentAt: new Date().toISOString(),
  status: 'read',
})

// Mirrors the real mock service's own seed (`services/chat/mock.ts`) closely
// enough that `m5` / `m2` line up with the two bodies the brief's test
// scenarios name — the screen shouldn't care which service produced them.
const SEED: Message[] = [
  message('m1', 'partner', 'Are we still going for coffee tonight?'),
  message('m2', 'me', 'Obviously.'),
  message('m3', 'partner', 'Good. I found a place you might actually like'),
  message('m4', 'me', "That's a bold claim."),
  message('m5', 'partner', 'Just trust me.'),
]

let listeners: ((event: ChatEvent) => void)[] = []

beforeEach(() => {
  jest.clearAllMocks()
  listeners = []
  service.subscribe.mockImplementation((listener) => {
    listeners = [...listeners, listener]
    return () => { listeners = listeners.filter((l) => l !== listener) }
  })
  service.listMessages.mockResolvedValue(SEED)

  // NOT wrapped in `act()`: doing so — with nothing yet mounted — leaves the
  // test renderer's root empty on the very next `render()` call in this file.
  // `MemoriesFlow.test.tsx` resets its store the same bare way for the same
  // reason.
  useChatStore.getState().reset()
})

describe('ConversationScreen', () => {
  it('renders the seeded thread in order', async () => {
    await renderScreen(<ConversationScreen />)

    await waitFor(() => expect(screen.getByText('Just trust me.')).toBeTruthy())
    expect(screen.getByText('Obviously.')).toBeTruthy()
  })

  it('sends what was typed, trimmed, and clears the field', async () => {
    const user = userEvent.setup()
    service.sendMessage.mockResolvedValue(message('m-sent', 'me', 'On my way'))
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    // Padded on both sides — `Composer` hands the raw value to `onSend` and
    // the store does not trim, so the screen has to before calling `send()`.
    await user.type(screen.getByLabelText('Message'), '  On my way  ')
    await user.press(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByText('On my way')).toBeTruthy())
    expect(service.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ body: 'On my way' }),
    )
    expect(screen.getByLabelText('Message').props.value).toBe('')
  })

  // The offer, not just the mark (spec §6): `retry()` used to be reachable
  // only by poking the store directly in a test — nothing in the UI called
  // it. This drives it as an actual user gesture: type, send, watch it
  // fail, press the bubble's own retry control.
  it('lets the user retry a failed send from its own bubble', async () => {
    const user = userEvent.setup()
    service.sendMessage.mockRejectedValueOnce(new Error('network down'))
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.type(screen.getByLabelText('Message'), 'Hello')
    await user.press(screen.getByLabelText('Send message'))

    await waitFor(() => expect(screen.getByLabelText('Retry sending')).toBeTruthy())

    service.sendMessage.mockResolvedValueOnce(message('m-sent', 'me', 'Hello'))
    await user.press(screen.getByLabelText('Retry sending'))

    await waitFor(() => expect(screen.queryByLabelText('Retry sending')).toBeNull())
    expect(useChatStore.getState().messages.find((m) => m.body === 'Hello')).toMatchObject({
      status: 'read',
    })
  })

  // Regression guard for the label collision a captionless photo/voice note
  // used to cause: `MessageBubble`'s own fallback accessible name (for a
  // bodyless message) used to be the bare literal `'Message'` — the exact
  // same string `Composer`'s `TextInput` is labelled, and both are mounted
  // here at once.
  it('keeps the composer field the only thing labelled "Message" even with a captionless photo in the thread', async () => {
    service.listMessages.mockResolvedValue([
      ...SEED,
      {
        id: 'm-photo',
        authorId: 'partner',
        kind: 'photo',
        mediaUri: 'file://a.jpg',
        reactions: [],
        pinned: false,
        sentAt: new Date().toISOString(),
        status: 'read',
      },
    ])
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    expect(screen.getAllByLabelText('Message')).toHaveLength(1)
  })

  it('shows the typing indicator while the partner types', async () => {
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')
    expect(screen.queryByLabelText('Partner is typing')).toBeNull()

    await act(async () => { useChatStore.setState({ isPartnerTyping: true }) })
    expect(screen.getByLabelText('Partner is typing')).toBeTruthy()
  })

  it('quotes a message when replying to it', async () => {
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Just trust me.')

    await act(async () => { useChatStore.getState().startReply('m5') })

    await waitFor(() => expect(screen.getAllByText('Just trust me.').length).toBe(2))
  })

  // --- Header (Figma 3390:665) — the plan gap this task fills in. ---

  it('draws the partner identity the frame shows', async () => {
    await renderScreen(<ConversationScreen />)

    expect(await screen.findByText('Sarah')).toBeTruthy()
    expect(screen.getByText('Online')).toBeTruthy()
    expect(screen.getByLabelText('Sarah')).toBeTruthy() // the avatar
  })

  it('returns to Chat Home from the back control', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('Back'))

    expect(mockBack).toHaveBeenCalled()
  })

  it('opens the video Moment from its call control', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('Start video call'))

    expect(mockPush).toHaveBeenCalledWith('/(app)/chat/moment/video')
  })

  it('opens the voice Moment from its call control', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('Start voice call'))

    expect(mockPush).toHaveBeenCalledWith('/(app)/chat/moment/voice')
  })

  it('offers the overflow control without it doing anything yet', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('More options'))

    expect(mockPush).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
  })

  // --- The long-press overlay's scrim (Task 7 review drive-by fix) ---

  it('lets a reaction through the overlay instead of the scrim only dismissing it', async () => {
    const user = userEvent.setup()
    service.react.mockImplementation(async (id, emoji) => {
      const target = SEED.find((m) => m.id === id)!
      return { ...target, reactions: [...target.reactions, { emoji, authorId: 'me' }] }
    })
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Just trust me.')

    // Harness footgun: a bare synchronous `act` stops re-rendering once a
    // `userEvent` interaction has run earlier in this file — `userEvent.setup()`
    // above already counts. Wrapped `await act(async () => ...)` instead.
    await act(async () => { useChatStore.getState().selectMessage('m5') })

    await user.press(screen.getByLabelText('React ❤️'))

    // The real assertion: the tap reached `ReactionBar`'s own control and
    // ran `react()`, not merely the scrim beneath it clearing the selection.
    // A scrim-swallowed tap would leave `service.react` uncalled even though
    // `selectedMessageId` ends up null either way (both paths clear it) — so
    // the emoji actually landing on the message is the only way to tell them
    // apart.
    await waitFor(() => expect(service.react).toHaveBeenCalledWith('m5', '❤️'))
    expect(await screen.findByText('❤️')).toBeTruthy()
  })

  // --- Attachments, photo share, photo message (Task 8) ---

  it('opens the attachment sheet from the composer', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))

    expect(await screen.findByText('Photo')).toBeTruthy()
    expect(screen.getByText('Camera')).toBeTruthy()
  })

  it('stages the mock photo pick and hands it to the share preview', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))

    expect(await screen.findByLabelText('Send photo')).toBeTruthy()
    // The two overlays are mutually exclusive, not merely one drawn over
    // the other — the sheet itself is gone, not just hidden behind the
    // preview.
    expect(screen.queryByLabelText('Choose photo')).toBeNull()
  })

  it('sends the staged photo through the real send path', async () => {
    const user = userEvent.setup()
    service.sendMessage.mockResolvedValue({
      id: 'm-photo',
      authorId: 'me',
      kind: 'photo',
      mediaUri: 'file://sample.jpg',
      reactions: [],
      pinned: false,
      sentAt: new Date().toISOString(),
      status: 'sent',
    })
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))
    await user.press(await screen.findByLabelText('Send photo'))

    await waitFor(() =>
      expect(service.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'photo', mediaUri: 'file://sample.jpg' }),
      ),
    )
    // The preview is gone once the send has gone through — `sendPhoto`
    // clears `pendingPhotoUri` itself (chatStore), this just confirms the
    // screen doesn't hold its own stale copy of it.
    expect(screen.queryByLabelText('Send photo')).toBeNull()
  })

  // Boundary 1 of the caption fix: `PhotoSharePreview` hands the screen
  // `(uri, caption)`, and this is the exact spot a caption used to be
  // silently discarded (`onSend={(uri) => { void s.sendPhoto(uri) }}`).
  it('carries a typed caption from the photo preview through to the service', async () => {
    const user = userEvent.setup()
    service.sendMessage.mockResolvedValue({
      id: 'm-photo',
      authorId: 'me',
      kind: 'photo',
      mediaUri: 'file://sample.jpg',
      body: 'us',
      reactions: [],
      pinned: false,
      sentAt: new Date().toISOString(),
      status: 'sent',
    })
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))
    await user.type(await screen.findByLabelText('Caption'), 'us')
    await user.press(screen.getByLabelText('Send photo'))

    await waitFor(() =>
      expect(service.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'photo', mediaUri: 'file://sample.jpg', body: 'us' }),
      ),
    )
  })
})
