import { screen, userEvent } from '@testing-library/react-native'
import { Text } from 'react-native'

import { APP_NAV } from '@/copy/appNav'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: jest.fn() }),
}))

beforeEach(() => {
  mockReplace.mockClear()
  mockPush.mockClear()
})

describe('AppScreenLayout', () => {
  it('renders its children between the header and the bar', async () => {
    await renderScreen(
      <AppScreenLayout activeTab="home">
        <Text>Days Together</Text>
      </AppScreenLayout>,
    )

    expect(screen.getByText('Days Together')).toBeTruthy()
    expect(screen.getByLabelText('Home')).toBeTruthy()
  })

  it('renders the chrome alone when a screen has nothing to show yet', async () => {
    await renderScreen(<AppScreenLayout activeTab="memories" />)

    // No spinner, no blank page — the bar is steady while the data loads.
    expect(screen.getByLabelText('Memories')).toBeTruthy()
  })

  it('marks the tab you are on as the selected one', async () => {
    await renderScreen(<AppScreenLayout activeTab="memories" />)

    expect(screen.getByLabelText('Memories').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    })
    expect(screen.getByLabelText('Home').props.accessibilityState).toMatchObject({
      selected: false,
      disabled: false,
    })
  })

  it('disables the tabs whose screens do not exist yet, rather than hiding them', async () => {
    await renderScreen(<AppScreenLayout activeTab="home" />)

    for (const tab of APP_NAV.tabs.filter((t) => !t.live)) {
      expect(screen.getByLabelText(tab.label).props.accessibilityState).toMatchObject({
        disabled: true,
      })
    }

    // Every destination is still in the bar, so it never changes shape.
    expect(screen.getAllByRole('tab')).toHaveLength(APP_NAV.tabs.length)
  })

  it('moves between sections by replacing, so the bar is not a stack', async () => {
    const user = userEvent.setup()
    await renderScreen(<AppScreenLayout activeTab="memories" />)

    await user.press(screen.getByLabelText('Home'))

    expect(mockReplace).toHaveBeenCalledWith('/(app)/home')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ignores a press on the tab already showing', async () => {
    const user = userEvent.setup()
    await renderScreen(<AppScreenLayout activeTab="home" />)

    await user.press(screen.getByLabelText('Home'))

    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('goes nowhere for a tab that has nowhere to go', async () => {
    await renderScreen(<AppScreenLayout activeTab="home" />)

    // Disabled, so a press never reaches the handler — and if the disabled
    // state ever regressed, `href: ''` would still stop the navigation.
    // `Timeline`, not `Chat`: Task 10 flipped chat's tab live, so timeline is
    // the one destination still without a screen behind it.
    expect(screen.getByLabelText('Timeline').props.accessibilityState).toMatchObject({
      disabled: true,
    })
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('has no back button on a screen that is a destination', async () => {
    await renderScreen(<AppScreenLayout activeTab="home" />)

    expect(screen.queryByRole('button', { name: 'Go back' })).toBeNull()
  })

  it('hands the back button to the screen that supplied it', async () => {
    const onBack = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<AppScreenLayout activeTab="memories" onBack={onBack} />)

    await user.press(screen.getByRole('button', { name: 'Go back' }))

    expect(onBack).toHaveBeenCalled()
  })
})
