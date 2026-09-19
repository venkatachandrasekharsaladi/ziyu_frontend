import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { SETTINGS_HOME_COPY as COPY } from '@/copy/settingsHome'
import { useThemeChoiceStore } from '@/design-system/themes/themeChoiceStore'
import { SettingsHomeScreen } from '@/modules/module-05-profile/screens/SettingsHomeScreen'
import { authService } from '@/services/auth'
import { usePreferencesStore } from '@/state/preferencesStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

describe('SettingsHomeScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockPush.mockClear()
    jest.restoreAllMocks()
    // Stubbed rather than spied through: the live mock service waits 600ms so
    // its loading states are visible on a device, and letting that timer run
    // leaves it pending after the test ends.
    jest.spyOn(authService, 'signOut').mockResolvedValue(undefined)
    useRelationshipStore.getState().reset()
    usePreferencesStore.getState().reset()
    useThemeChoiceStore.getState().reset()
  })

  it('keeps the heading and lede the design drew', async () => {
    await renderScreen(<SettingsHomeScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  // The last tab is Space, not Profile — the About Page board renamed it and
  // moved its destination to the Space hub. This list is still what the cog in
  // that hub's header opens, so it still reports itself as the tab you are on.
  it('sits on the space tab, so the bar knows where you are', async () => {
    await renderScreen(<SettingsHomeScreen />)

    expect(screen.getByLabelText('Space').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('routes to Appearance', async () => {
    const user = userEvent.setup()

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.appearance) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/appearance')
  })

  it('routes to Accessibility', async () => {
    const user = userEvent.setup()

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.accessibility) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/accessibility')
  })

  it('asks before signing out rather than doing it on the first tap', async () => {
    const user = userEvent.setup()

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))

    expect(screen.getByText(COPY.confirmTitle)).toBeTruthy()
    expect(authService.signOut).not.toHaveBeenCalled()
  })

  it('clears the relationship BEFORE navigating, so welcome cannot read a stale partner', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Pedro' })

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome')
    })
    expect(useRelationshipStore.getState().partner).toBeNull()
  })

  // Every store a signed-in account writes to, not only the relationship: a
  // preference and the theme choice are here because leaving either behind
  // hands the next person to sign in on this device the last person's app
  // lock, quiet hours and dark mode. The rejection path is the one to assert
  // it on, because that is where "runs whichever way the service settled"
  // either holds or quietly stops holding.
  it('still signs out locally — and clears every store — when the service rejects', async () => {
    jest.spyOn(authService, 'signOut').mockRejectedValue(new Error('offline'))
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'p1', name: 'Pedro' })
    useRelationshipStore.getState().setProfile({ name: 'Alex' })
    usePreferencesStore.getState().setPreference('appLock', true)
    useThemeChoiceStore.getState().setChoice('dark')

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome')
    })
    expect(useRelationshipStore.getState().partner).toBeNull()
    expect(useRelationshipStore.getState().profile).toBeNull()
    expect(usePreferencesStore.getState().appLock).toBe(false)
    expect(useThemeChoiceStore.getState().choice).toBe('light')
  })

  it('offers delete account, and does not act on the first tap', async () => {
    const user = userEvent.setup()

    await renderScreen(<SettingsHomeScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.deleteAccount) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/delete-account')
  })
})
