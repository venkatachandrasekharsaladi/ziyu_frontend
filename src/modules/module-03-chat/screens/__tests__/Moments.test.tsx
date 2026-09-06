import { act, fireEvent } from '@testing-library/react-native'

import { CHAT_COPY } from '@/copy/chat'
import { VoiceMomentScreen } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
import { VideoMomentScreen } from '@/modules/module-03-chat/screens/VideoMomentScreen'
import { renderScreen } from '@/test/renderScreen'

// `mockBack`, not `back`: babel-plugin-jest-hoist only allows an
// out-of-scope variable referenced from inside `jest.mock`'s factory when its
// name is prefixed `mock` (case-insensitive) — the brief's own `back` fails
// to even transform. Same fix `ConversationFlow.test.tsx` already applied.
const mockBack = jest.fn()
const mockReplace = jest.fn()
// `canGoBack` is part of the router these screens actually use now (see
// `useBackTo`): they pop the stack when there is one, and go to the thread
// directly when there is not. A mock without it would throw rather than fail.
const mockCanGoBack = jest.fn(() => true)
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
    push: jest.fn(),
  }),
}))

beforeEach(() => {
  mockBack.mockClear()
  mockReplace.mockClear()
  mockCanGoBack.mockReturnValue(true)
})

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
    await fireEvent.press(getByLabelText('End call'))
    expect(mockBack).toHaveBeenCalled()
  })
})

// The captions both frames draw and neither screen rendered until now —
// 3391:842's "Just a little moment together." and 3391:884's "A little
// moment together" / "KEEP MOMENT". Split per-screen rather than folded into
// the `describe.each` above because the two frames draw DIFFERENT captions,
// and the voice frame carries an affordance the video one does not.
describe('moment captions (Figma 3391:842 / 3391:884)', () => {
  it('video: renders the frame caption', async () => {
    const { getByText } = await renderScreen(<VideoMomentScreen />)
    expect(getByText(CHAT_COPY.moments.videoCaption)).toBeTruthy()
  })

  it('voice: renders the frame caption and the Keep Moment affordance', async () => {
    const { getByText, getByLabelText } = await renderScreen(<VoiceMomentScreen />)
    expect(getByText(CHAT_COPY.moments.voiceCaption)).toBeTruthy()

    // Present and named, but deliberately inert — `IconButton` renders
    // `disabled` when no `onPress` is passed, this app's "honestly
    // unavailable" rule. Keeping a moment would have to write a Memory from
    // a call that carries no audio; there is no service behind it yet.
    const keep = getByLabelText(CHAT_COPY.moments.keepMoment)
    expect(keep).toBeTruthy()
    expect(keep.props.accessibilityState?.disabled).toBe(true)
  })
})

// The elapsed-call timer, on both screens. Task 9 shipped this exact pattern
// (interval + cleanup) untested and it came back as a review finding — this
// pins the display AND the cleanup so it can't regress silently again.
//
// Fake timers, scoped per test with try/finally (not a file-level
// beforeEach/afterEach), so a failure in one of these two tests can't leave
// fake timers bleeding into the plain `it`s above or below it — those never
// expect them, same reasoning `VoiceNote.test.tsx` documents for its own
// timer test.
describe.each([
  ['VoiceMomentScreen', VoiceMomentScreen],
  ['VideoMomentScreen', VideoMomentScreen],
] as const)('%s elapsed timer', (_n, Screen) => {
  it('advances the elapsed timer and clears its interval on unmount', async () => {
    jest.useFakeTimers()
    try {
      const clearSpy = jest.spyOn(globalThis, 'clearInterval')
      const { getByText, unmount } = await renderScreen(<Screen />)

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      // Both frames LABEL this readout ("Together for 05:20" / "Together for
      // 08:42"), they never draw a bare clock — so the assertion is on the
      // composed string, built from the same copy constant the screens use.
      // Asserting '0:03' alone would pass against a screen that had silently
      // dropped the label again.
      expect(getByText(`${CHAT_COPY.moments.togetherForPrefix} 0:03`)).toBeTruthy()

      await unmount()

      // Discriminating on the mechanism, not a side effect of it: if the
      // effect's cleanup were removed, this interval would never be cleared
      // and this assertion would fail.
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    } finally {
      jest.useRealTimers()
    }
  })
})
