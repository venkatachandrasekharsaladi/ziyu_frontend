import { act, fireEvent } from '@testing-library/react-native'

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

  // Closes the interval's coverage gap in one test: the counter's own advance
  // (and the recorder's own `clock()` render path — only the player's
  // 65000 -> '1:05' was pinned before this), and cleanup on unmount.
  //
  // Fake timers, not a real wait — `jest.useFakeTimers`/`advanceTimersByTime`
  // is the same pattern `VerifyEmailScreen.test.tsx` already uses for its own
  // interval. Scoped to this one test (`useFakeTimers` at the top,
  // `useRealTimers` in `finally`) rather than a file-level `beforeEach`, so a
  // failure here can't leave fake timers bleeding into the tests below —
  // `VoiceNotePlayer`'s tests render synchronously and never expect them.
  //
  // No fight with footgun 1 here: this test does not call `fireEvent` at all,
  // so there is nothing async racing the fake-timer clock.
  it('advances the elapsed timer and clears its interval on unmount', async () => {
    jest.useFakeTimers()
    try {
      const clearSpy = jest.spyOn(globalThis, 'clearInterval')
      const { getByText, unmount } = await renderScreen(
        <VoiceNoteRecorder onCancel={() => {}} onSend={() => {}} />)

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      expect(getByText('0:03')).toBeTruthy()

      await unmount()

      // Discriminating on the mechanism, not a side effect of it: if the
      // effect's cleanup were removed, this interval would never be cleared
      // and this assertion would fail — remove it in `VoiceNoteRecorder.tsx`
      // to see this test go red.
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    } finally {
      jest.useRealTimers()
    }
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
