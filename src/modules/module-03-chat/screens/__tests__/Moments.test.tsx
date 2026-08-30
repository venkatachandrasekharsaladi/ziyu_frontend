import { act, fireEvent } from '@testing-library/react-native'

import { VoiceMomentScreen } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
import { VideoMomentScreen } from '@/modules/module-03-chat/screens/VideoMomentScreen'
import { renderScreen } from '@/test/renderScreen'

// `mockBack`, not `back`: babel-plugin-jest-hoist only allows an
// out-of-scope variable referenced from inside `jest.mock`'s factory when its
// name is prefixed `mock` (case-insensitive) — the brief's own `back` fails
// to even transform. Same fix `ConversationFlow.test.tsx` already applied.
const mockBack = jest.fn()
jest.mock('expo-router', () => ({ useRouter: () => ({ back: mockBack, push: jest.fn() }) }))

beforeEach(() => mockBack.mockClear())

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
      expect(getByText('0:03')).toBeTruthy()

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
