import { act } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'

import { FeedbackBanner } from '@/components/feedback/FeedbackBanner'
import { renderScreen } from '@/test/renderScreen'

describe('FeedbackBanner', () => {
  it('renders the message it was given', async () => {
    const { getByText } = await renderScreen(
      <FeedbackBanner tone="success" message="Saved to Memories." onDismiss={() => {}} />,
    )

    expect(getByText('Saved to Memories.')).toBeTruthy()
  })

  it('announces the message to screen readers on mount, not just draws it', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')

    await renderScreen(
      <FeedbackBanner tone="error" message="Could not save to Memories. Try again." onDismiss={() => {}} />,
    )

    expect(announceSpy).toHaveBeenCalledWith('Could not save to Memories. Try again.')
    announceSpy.mockRestore()
  })

  it('is marked as an alert, with a live region matched to how urgent the tone is', async () => {
    const success = await renderScreen(
      <FeedbackBanner tone="success" message="Saved to Memories." onDismiss={() => {}} />,
    )
    expect(success.getByRole('alert').props.accessibilityLiveRegion).toBe('polite')

    const error = await renderScreen(
      <FeedbackBanner tone="error" message="Could not save to Memories. Try again." onDismiss={() => {}} />,
    )
    expect(error.getByRole('alert').props.accessibilityLiveRegion).toBe('assertive')
  })

  it('dismisses itself once its timer elapses, and clears the timer on unmount', async () => {
    jest.useFakeTimers()
    try {
      const clearSpy = jest.spyOn(globalThis, 'clearTimeout')
      const onDismiss = jest.fn()
      const { unmount } = await renderScreen(
        <FeedbackBanner tone="success" message="Saved to Memories." onDismiss={onDismiss} durationMs={3000} />,
      )

      expect(onDismiss).not.toHaveBeenCalled()

      await act(async () => { jest.advanceTimersByTime(2999) })
      expect(onDismiss).not.toHaveBeenCalled()

      await act(async () => { jest.advanceTimersByTime(1) })
      expect(onDismiss).toHaveBeenCalledTimes(1)

      await unmount()
      // Discriminating on the mechanism, not a side effect of it — same
      // pattern `VoiceNote.test.tsx` already uses for `VoiceNoteRecorder`'s
      // own interval: remove the effect's cleanup to see this go red.
      expect(clearSpy).toHaveBeenCalled()
      clearSpy.mockRestore()
    } finally {
      jest.useRealTimers()
    }
  })
})
