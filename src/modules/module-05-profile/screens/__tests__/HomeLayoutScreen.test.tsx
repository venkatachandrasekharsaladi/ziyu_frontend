import { fireEvent, screen, userEvent, within } from '@testing-library/react-native'

import { SETTINGS_HOME_LAYOUT_COPY as COPY } from '@/copy/settingsHomeLayout'
import { HomeLayoutScreen } from '@/modules/module-05-profile/screens/HomeLayoutScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('HomeLayoutScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<HomeLayoutScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('hides a card', async () => {
    await renderScreen(<HomeLayoutScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.featured }), 'valueChange', false)

    expect(usePreferencesStore.getState().homeCards).toEqual(['comingUp', 'littleThings'])
  })

  it('brings a hidden card back in its original position', async () => {
    await renderScreen(<HomeLayoutScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.featured }), 'valueChange', false)
    await fireEvent(screen.getByRole('switch', { name: COPY.featured }), 'valueChange', true)

    expect(usePreferencesStore.getState().homeCards).toEqual([
      'featured',
      'comingUp',
      'littleThings',
    ])
  })

  it('moves a card down', async () => {
    const user = userEvent.setup()

    await renderScreen(<HomeLayoutScreen />)
    const row = screen.getByTestId('card-featured')
    await user.press(within(row).getByLabelText(COPY.moveDown))

    expect(usePreferencesStore.getState().homeCards).toEqual([
      'comingUp',
      'featured',
      'littleThings',
    ])
  })

  it('cannot move the first card up', async () => {
    await renderScreen(<HomeLayoutScreen />)

    const row = screen.getByTestId('card-featured')
    expect(within(row).getByLabelText(COPY.moveUp).props.accessibilityState).toMatchObject({
      disabled: true,
    })
  })

  it('says so when everything is hidden', async () => {
    await renderScreen(<HomeLayoutScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.featured }), 'valueChange', false)
    await fireEvent(screen.getByRole('switch', { name: COPY.comingUp }), 'valueChange', false)
    await fireEvent(screen.getByRole('switch', { name: COPY.littleThings }), 'valueChange', false)

    expect(screen.getByText(COPY.allHidden)).toBeTruthy()
  })
})
