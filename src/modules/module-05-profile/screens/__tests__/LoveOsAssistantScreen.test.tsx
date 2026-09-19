import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { ASSISTANT_TOGGLES, SPACE_ASSISTANT_COPY as COPY } from '@/copy/spaceAssistant'
import { LoveOsAssistantScreen } from '@/modules/module-05-profile/screens/LoveOsAssistantScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('LoveOsAssistantScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    usePreferencesStore.getState().reset()
  })

  // Assistant Preferences is unreachable without this row; no frame draws it.
  it('opens voice and frequency', async () => {
    const user = userEvent.setup()

    await renderScreen(<LoveOsAssistantScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.moreTitle) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/space/assistant-preferences')
  })

  it('names the assistant and what it is for', async () => {
    await renderScreen(<LoveOsAssistantScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('offers all three permissions, in the frame states', async () => {
    await renderScreen(<LoveOsAssistantScreen />)

    expect(ASSISTANT_TOGGLES).toHaveLength(3)
    expect(screen.getByLabelText('Date Night Ideas').props.accessibilityState.checked).toBe(true)
    expect(screen.getByLabelText('Anniversary Ideas').props.accessibilityState.checked).toBe(false)
  })

  // A standing permission for something that acts on its own should not land
  // the instant a finger brushes it. The frame draws a save; this honours it.
  it('grants nothing until the save', async () => {
    await renderScreen(<LoveOsAssistantScreen />)

    fireEvent(screen.getByLabelText('Anniversary Ideas'), 'valueChange', true)

    expect(usePreferencesStore.getState().assistantAnniversaryIdeas).toBe(false)
  })

  it('writes every permission on save', async () => {
    const user = userEvent.setup()

    await renderScreen(<LoveOsAssistantScreen />)
    fireEvent(screen.getByLabelText('Anniversary Ideas'), 'valueChange', true)
    fireEvent(screen.getByLabelText('Date Night Ideas'), 'valueChange', false)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))

    expect(usePreferencesStore.getState().assistantAnniversaryIdeas).toBe(true)
    expect(usePreferencesStore.getState().assistantDateNightIdeas).toBe(false)
    expect(screen.getByText(COPY.saved)).toBeTruthy()
  })

  // NOT COVERED, deliberately: the screen also clears its "saved" confirmation
  // the moment a switch moves again, and there is no way to drive that here.
  // `userEvent.setup()` installs fake timers, so a `fireEvent` dispatched after
  // a `user.press` never flushes; `fireEvent.press` does not reach `Button`,
  // which guards double taps behind a ref; and `userEvent` cannot toggle a
  // `Switch` at all. All three were tried. The behaviour is real and lives in
  // `LoveOsAssistantScreen`; this comment is here so the gap is a known one
  // rather than an oversight someone finds later.
})
