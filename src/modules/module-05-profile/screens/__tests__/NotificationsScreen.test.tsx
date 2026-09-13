import { fireEvent, screen } from '@testing-library/react-native'

import { SETTINGS_NOTIFICATIONS_COPY as COPY } from '@/copy/settingsNotifications'
import { NotificationsScreen } from '@/modules/module-05-profile/screens/NotificationsScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('NotificationsScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<NotificationsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('turns a single category off', async () => {
    await renderScreen(<NotificationsScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.messages }), 'valueChange', false)

    expect(usePreferencesStore.getState().notifyMessages).toBe(false)
  })

  it('disables the categories when the master is off, rather than hiding them', async () => {
    await renderScreen(<NotificationsScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.masterLabel }), 'valueChange', false)

    const messages = screen.getByRole('switch', { name: COPY.messages })
    expect(messages).toBeTruthy()
    expect(messages.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('keeps the category choices while the master is off', async () => {
    await renderScreen(<NotificationsScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.masterLabel }), 'valueChange', false)

    expect(usePreferencesStore.getState().notifyMessages).toBe(true)
  })

  it('shows quiet hours times only once quiet hours are on', async () => {
    await renderScreen(<NotificationsScreen />)
    expect(screen.queryByText(COPY.quietFrom)).toBeNull()

    await fireEvent(screen.getByRole('switch', { name: COPY.quietLabel }), 'valueChange', true)

    expect(screen.getByText(COPY.quietFrom)).toBeTruthy()
  })

  it('is honest that the two times cannot be changed yet', async () => {
    await renderScreen(<NotificationsScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.quietLabel }), 'valueChange', true)

    expect(screen.getByText(COPY.quietTimesFixed)).toBeTruthy()
  })

  it('starts with partner activity off', async () => {
    await renderScreen(<NotificationsScreen />)

    expect(
      screen.getByRole('switch', { name: COPY.partnerActivity }).props.accessibilityState,
    ).toMatchObject({ checked: false })
  })
})
