import { fireEvent, screen, userEvent, within } from '@testing-library/react-native'

import {
  ASSISTANT_SUGGESTIONS,
  ASSISTANT_TONES,
  FREQUENCY_PROMISE,
  SPACE_ASSISTANT_PREFERENCES_COPY as COPY,
} from '@/copy/spaceAssistantPreferences'
import { AssistantPreferencesScreen } from '@/modules/module-05-profile/screens/AssistantPreferencesScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('AssistantPreferencesScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('draws all three sections', async () => {
    await renderScreen(<AssistantPreferencesScreen />)

    expect(screen.getByText(COPY.suggestTitle)).toBeTruthy()
    expect(screen.getByText(COPY.toneTitle)).toBeTruthy()
    expect(screen.getByText(COPY.frequencyTitle)).toBeTruthy()
  })

  it('offers every suggestion and every tone', async () => {
    await renderScreen(<AssistantPreferencesScreen />)

    expect(ASSISTANT_SUGGESTIONS).toHaveLength(3)
    expect(ASSISTANT_TONES).toHaveLength(4)
    for (const tone of ASSISTANT_TONES) {
      expect(screen.getByText(tone.label)).toBeTruthy()
    }
  })

  it('opens on the states the frame draws', async () => {
    await renderScreen(<AssistantPreferencesScreen />)

    expect(screen.getByLabelText('Date Night Ideas').props.accessibilityState.checked).toBe(true)
    expect(
      screen.getByLabelText('Conversation Starters').props.accessibilityState.checked,
    ).toBe(false)
    expect(screen.getByLabelText(`Warm & Affectionate, ${COPY.selected}`)).toBeTruthy()
  })

  // Nothing here is granted, so nothing waits for a save.
  it('lands a suggestion immediately', async () => {
    await renderScreen(<AssistantPreferencesScreen />)

    fireEvent(screen.getByLabelText('Conversation Starters'), 'valueChange', true)

    expect(usePreferencesStore.getState().assistantConversationStarters).toBe(true)
  })

  it('changes the tone on tap', async () => {
    const user = userEvent.setup()

    await renderScreen(<AssistantPreferencesScreen />)
    await user.press(screen.getByLabelText('Playful & Fun'))

    expect(usePreferencesStore.getState().assistantTone).toBe('playful')
  })

  // The frame draws a slider; three labelled stops are a choice of three, so
  // this ships as a segmented control. The stops and their order are unchanged.
  it('changes how often the assistant chimes in', async () => {
    const user = userEvent.setup()

    await renderScreen(<AssistantPreferencesScreen />)
    const control = screen.getByLabelText(COPY.frequencyTitle)
    await user.press(within(control).getByText('Often'))

    expect(usePreferencesStore.getState().assistantFrequency).toBe('often')
  })

  // The promise under the control has to follow the control, or it is true for
  // one stop out of three.
  it('rewrites its promise when the frequency moves', async () => {
    const user = userEvent.setup()

    await renderScreen(<AssistantPreferencesScreen />)
    expect(screen.getByText(FREQUENCY_PROMISE.balanced)).toBeTruthy()

    const control = screen.getByLabelText(COPY.frequencyTitle)
    await user.press(within(control).getByText('Rarely'))

    expect(screen.getByText(FREQUENCY_PROMISE.rarely)).toBeTruthy()
    expect(screen.queryByText(FREQUENCY_PROMISE.balanced)).toBeNull()
  })
})
