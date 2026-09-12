import { fireEvent, screen, userEvent } from '@testing-library/react-native'

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

  // Scoped by accessible name, not by a testID wrapper, the way
  // DatesSettingsScreen scopes its three identical segment sets: each button
  // names the card it moves, so the query that finds it is the same string a
  // screen reader announces. A testID would have hidden the defect it was
  // introduced to work around.
  it('moves a card down', async () => {
    const user = userEvent.setup()

    await renderScreen(<HomeLayoutScreen />)
    await user.press(screen.getByLabelText(COPY.moveDown(COPY.featured)))

    expect(usePreferencesStore.getState().homeCards).toEqual([
      'comingUp',
      'featured',
      'littleThings',
    ])
  })

  it('tells the three pairs of move buttons apart by name', async () => {
    await renderScreen(<HomeLayoutScreen />)

    expect(screen.getByLabelText(COPY.moveDown(COPY.featured))).toBeTruthy()
    expect(screen.getByLabelText(COPY.moveDown(COPY.comingUp))).toBeTruthy()
    expect(screen.getByLabelText(COPY.moveUp(COPY.littleThings))).toBeTruthy()
  })

  it('cannot move the first card up', async () => {
    await renderScreen(<HomeLayoutScreen />)

    expect(
      screen.getByLabelText(COPY.moveUp(COPY.featured)).props.accessibilityState,
    ).toMatchObject({ disabled: true })
  })

  it('says so when everything is hidden', async () => {
    await renderScreen(<HomeLayoutScreen />)
    await fireEvent(screen.getByRole('switch', { name: COPY.featured }), 'valueChange', false)
    await fireEvent(screen.getByRole('switch', { name: COPY.comingUp }), 'valueChange', false)
    await fireEvent(screen.getByRole('switch', { name: COPY.littleThings }), 'valueChange', false)

    expect(screen.getByText(COPY.allHidden)).toBeTruthy()
  })
})
