import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { SETTINGS_ACCESSIBILITY_COPY as COPY } from '@/copy/settingsAccessibility'
import { AccessibilityScreen } from '@/modules/module-05-profile/screens/AccessibilityScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('AccessibilityScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<AccessibilityScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('turns reduce motion on', async () => {
    await renderScreen(<AccessibilityScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.reduceMotionLabel }), 'valueChange', true)

    expect(usePreferencesStore.getState().reduceMotion).toBe(true)
  })

  it('turns haptics off', async () => {
    await renderScreen(<AccessibilityScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.hapticsLabel }), 'valueChange', false)

    expect(usePreferencesStore.getState().haptics).toBe(false)
  })

  it('records a text size', async () => {
    const user = userEvent.setup()

    await renderScreen(<AccessibilityScreen />)
    await user.press(screen.getByText(COPY.textLarge))

    expect(usePreferencesStore.getState().textScale).toBe('large')
  })

  it('turns higher contrast on', async () => {
    await renderScreen(<AccessibilityScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.highContrastLabel }), 'valueChange', true)

    expect(usePreferencesStore.getState().highContrast).toBe(true)
  })
})
