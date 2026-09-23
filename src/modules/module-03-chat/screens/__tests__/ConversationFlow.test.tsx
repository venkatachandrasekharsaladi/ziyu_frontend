import { act, screen, userEvent, waitFor } from '@testing-library/react-native'
import * as Clipboard from 'expo-clipboard'

import { CHAT_COPY } from '@/copy/chat'
import { PHOTO_PICK_COPY } from '@/copy/photoPick'
import { ConversationScreen } from '@/modules/module-03-chat/screens/ConversationScreen'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { chatService } from '@/services/chat'
import type { ChatEvent, Message } from '@/services/chat/types'
import { mediaService } from '@/services/media'
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
 * `@/services/media` is the boundary `expo-image-picker` sits behind, and the
 * picker is a native module with no Jest implementation — left real, the first
 * press of the Photo tile would reach for a permissions prompt and a system
 * sheet that do not exist in this environment.
 *
 * Mocked per-suite rather than in `jest.setup.js`: that file holds only what
 * EVERY test in the repo needs (the worklets/Reanimated mocks), and a screen
 * that never opens a picker should not have one silently installed underneath
 * it.
 *
 * The boundary is mocked, NOT `expo-image-picker` itself, for the reason
 * `services/media/types.ts` gives for the boundary existing at all: it turns
 * three permission outcomes into one union a screen can switch on. Mocking at
 * that seam is what lets these tests state an ANSWER (a photo, a cancellation,
 * a refusal) instead of assembling the picker payload that produces one — the
 * translation from `ImagePickerResult` to this union is `expoMedia.ts`'s job,
 * not this screen's, and asserting on it here would test the wrong module.
 */
jest.mock('@/services/media', () => ({
  mediaService: { pickPhoto: jest.fn(), takePhoto: jest.fn() },
}))

const media = jest.mocked(mediaService)

/**
 * `expo-clipboard` likewise — a native module, and what is under test is that
 * the screen ASKS the clipboard for the right string, not that a simulator's
 * pasteboard changed (nothing here can read one back). Mocked exactly as
 * `module-01-onboarding/screens/__tests__/InvitationSentScreen.test.tsx`
 * already does, for the same reason.
 */
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }))

const clipboard = jest.mocked(Clipboard)

/**
 * The two uris the mocked picker hands back.
 *
 * Deliberately NOT `file://sample.jpg` — that was the hardcoded placeholder
 * the screen used to stage while `expo-image-picker` was uninstalled, and a
 * test written against it would pass whether the screen forwarded the picker's
 * answer or ignored it and re-staged the old constant. Distinct strings per
 * entry point for the same reason: they are what tells "the Camera tile opened
 * the camera" apart from "the Camera tile opened the library".
 */
const PICKED = { uri: 'file://picked-from-library.jpg', width: 1200, height: 900 }
const CAPTURED = { uri: 'file://captured-by-camera.jpg', width: 3024, height: 4032 }

/**
 * `router.push` for two routes (`chat/moment/video`, `chat/moment/voice`)
 * that do not exist yet — Task 12 creates them. This mock is exactly why
 * that is fine to build against today: the screen's job is to express the
 * navigation INTENT, which a plain jest.fn() can assert on, with no real
 * route needed to resolve it.
 */
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()
// `canGoBack` is part of the router this screen actually uses now (see
// `useBackTo`): it pops the stack when there is one, and goes to Chat Home
// directly when there is not. A mock without it would throw rather than fail.
const mockCanGoBack = jest.fn(() => true)

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  }),
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
  // `clearAllMocks` strips the implementation too, so the router's default
  // answer has to be restored: the ordinary case is a stack with something
  // in it. The deep-link case sets this to false for itself.
  mockCanGoBack.mockReturnValue(true)
  listeners = []
  service.subscribe.mockImplementation((listener) => {
    listeners = [...listeners, listener]
    return () => { listeners = listeners.filter((l) => l !== listener) }
  })
  service.listMessages.mockResolvedValue(SEED)

  // Same restore-after-`clearAllMocks` reason as `mockCanGoBack` above: the
  // ordinary case is a photo that WAS chosen, so every test gets that answer
  // by default and the two unhappy paths (cancelled, refused) each override it
  // for themselves. Without this, a cleared `pickPhoto` resolves `undefined`
  // and the screen's `result.ok` read throws inside a floating promise, which
  // surfaces as an unrelated test timing out rather than as a failed pick.
  media.pickPhoto.mockResolvedValue({ ok: true, value: PICKED })
  media.takePhoto.mockResolvedValue({ ok: true, value: CAPTURED })

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

    expect(await screen.findByText('Sweatcha')).toBeTruthy()
    expect(screen.getByText('Online')).toBeTruthy()
    expect(screen.getByLabelText('Sweatcha')).toBeTruthy() // the avatar
  })

  it('returns to Chat Home from the back control', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('Back'))

    expect(mockBack).toHaveBeenCalled()
  })

  // Opening this route directly — a shared link, a browser reload on
  // `/chat/conversation`, a notification — leaves the stack with exactly one
  // entry, and `back()` then goes nowhere: expo-router logs "The action
  // 'GO_BACK' was not handled by any navigator" and the control is dead.
  // `replace`, not `push`, so Chat Home takes this screen's place rather than
  // stacking on top of it and offering a Back that returns here.
  it('goes to Chat Home when it was opened directly and has no stack to pop', async () => {
    mockCanGoBack.mockReturnValue(false)
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)

    await user.press(await screen.findByLabelText('Back'))

    expect(mockBack).not.toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith('/(app)/chat')
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

  it('stages the uri the picker actually returned and hands it to the share preview', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))

    expect(await screen.findByLabelText('Send photo')).toBeTruthy()
    expect(media.pickPhoto).toHaveBeenCalled()
    // THE assertion this test exists for. The preview draws whatever uri it
    // was handed, so reading it back off the image is how we know the screen
    // forwarded the picker's answer rather than re-staging a constant of its
    // own — which is exactly what it used to do (`stagePhoto('file://
    // sample.jpg')`), and what a test that only asserted "a preview appeared"
    // would never have caught.
    // expo-image normalises a single `{ uri }` source into a one-element
    // array before it reaches the native prop — see `resolveSources`.
    expect(screen.getByTestId('photo-preview-image').props.source).toMatchObject([
      { uri: PICKED.uri },
    ])
    // The library, not the camera: pressing Photo must not open the wrong one.
    expect(media.takePhoto).not.toHaveBeenCalled()
    // The two overlays are mutually exclusive, not merely one drawn over
    // the other — the sheet itself is gone, not just hidden behind the
    // preview.
    expect(screen.queryByLabelText('Choose photo')).toBeNull()
  })

  // The Camera tile went from `disabled` to live in the same change that
  // installed `expo-image-picker`. It is a SEPARATE service call, not a second
  // button onto the same one, so it gets its own test rather than being
  // assumed to work because the Photo tile does.
  it('opens the camera from the Camera tile and stages what was captured', async () => {
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Camera'))

    expect(await screen.findByLabelText('Send photo')).toBeTruthy()
    expect(media.takePhoto).toHaveBeenCalled()
    expect(media.pickPhoto).not.toHaveBeenCalled()
    expect(screen.getByTestId('photo-preview-image').props.source).toMatchObject([
      { uri: CAPTURED.uri },
    ])
  })

  /*
   * Closing the picker is a decision, not a failure — the single sentence
   * `copy/photoPick.ts` opens with, and the reason `CANCELLED` has no entry in
   * its error table at all.
   *
   * Both halves matter and neither implies the other: a screen could stage
   * nothing and still shout, or say nothing and still stage `undefined`. The
   * sheet closing regardless is the third thing worth pinning down — the user
   * asked for a picker and got one, so the sheet has done its job either way.
   */
  it('stages nothing and says nothing when the picker is cancelled', async () => {
    media.pickPhoto.mockResolvedValue({ ok: false, error: { code: 'CANCELLED' } })
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))

    // The sheet closes, which is the observable "the picker ran and came
    // back" — waiting on it is what makes the three negative assertions below
    // meaningful rather than merely early.
    await waitFor(() => expect(screen.queryByLabelText('Choose photo')).toBeNull())

    expect(screen.queryByLabelText('Send photo')).toBeNull()
    expect(useChatStore.getState().pendingPhotoUri).toBeNull()
    // No banner of any tone. Asserting on the one string a cancellation could
    // plausibly borrow (`UNKNOWN`) would pass while some other copy was shown,
    // so this asserts nothing from the table reached the screen at all.
    for (const message of Object.values(PHOTO_PICK_COPY.errors)) {
      expect(screen.queryByText(message)).toBeNull()
    }
  })

  // A refusal IS worth a sentence, and it is the SHARED one — four screens
  // offer a photo pick and `copy/photoPick.ts` exists so all four explain a
  // denied permission identically. Asserting against the constant (not a
  // copy-pasted string) is what keeps this screen from quietly drifting into
  // its own chat-specific wording.
  it('explains a refused photo permission with the shared picker copy', async () => {
    media.pickPhoto.mockResolvedValue({ ok: false, error: { code: 'PERMISSION_DENIED' } })
    const user = userEvent.setup()
    await renderScreen(<ConversationScreen />)
    await screen.findByText('Obviously.')

    await user.press(screen.getByLabelText('Add attachment'))
    await user.press(screen.getByLabelText('Choose photo'))

    expect(await screen.findByText(PHOTO_PICK_COPY.errors.PERMISSION_DENIED)).toBeTruthy()
    // Explained, not half-staged: a refusal must not leave the share preview
    // sitting there over an image the user was never allowed to choose.
    expect(screen.queryByLabelText('Send photo')).toBeNull()
    expect(useChatStore.getState().pendingPhotoUri).toBeNull()
  })

  it('sends the staged photo through the real send path', async () => {
    const user = userEvent.setup()
    service.sendMessage.mockResolvedValue({
      id: 'm-photo',
      authorId: 'me',
      kind: 'photo',
      mediaUri: PICKED.uri,
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

    // End to end, and the whole point of naming the constant: the uri the
    // PICKER returned is the one that reaches the service. Nothing between the
    // two — staging, the preview, `sendPhoto` — is allowed to substitute its
    // own, which is precisely what the old placeholder made impossible to see.
    await waitFor(() =>
      expect(service.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'photo', mediaUri: PICKED.uri }),
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
      mediaUri: PICKED.uri,
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
        expect.objectContaining({ kind: 'photo', mediaUri: PICKED.uri, body: 'us' }),
      ),
    )
  })
})
