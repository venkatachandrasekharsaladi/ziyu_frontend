import { screen, userEvent } from '@testing-library/react-native'
import { Text } from 'react-native'

import { APP_NAV } from '@/copy/appNav'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { lavenderTheme } from '@/design-system/themes/theme'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, replace: mockReplace, push: mockPush, back: jest.fn() }),
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

  // Profile is no longer one of the four tabs — it is the header's top-right
  // control, and it has to be on every `(app)` screen or it is unreachable.
  it('carries the profile control in the header', async () => {
    await renderScreen(<AppScreenLayout activeTab="home" />)

    expect(screen.getByLabelText('Profile and settings')).toBeTruthy()
  })

  // A push, not a replace: you back out of settings to the screen you were on,
  // not to whichever tab happened to be selected.
  it('pushes to profile rather than replacing the tab', async () => {
    const user = userEvent.setup()

    await renderScreen(<AppScreenLayout activeTab="home" />)
    await user.press(screen.getByLabelText('Profile and settings'))

    expect(mockPush).toHaveBeenCalledWith('/(app)/profile')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('keeps Profile out of the bottom bar', async () => {
    await renderScreen(<AppScreenLayout activeTab="home" />)

    expect(APP_NAV.tabs).toHaveLength(4)
    expect(APP_NAV.tabs.map((t) => t.key)).toEqual(['home', 'memories', 'chat', 'space'])
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

  // The single lever, proven: `column` never carries a raw pixel `width` that
  // could outrun a phone's frame. `width: '100%'` is what a 320pt device
  // actually leans on — `maxWidth` only ever engages once the frame is wider
  // than `theme.layout.column`, which is what "fluid, then capped" means.
  it.each([320, 430])('keeps the content column fluid at a %dpt frame', async (width) => {
    await renderScreen(
      <AppScreenLayout activeTab="home">
        <Text>Days Together</Text>
      </AppScreenLayout>,
      { width },
    )

    const column = screen.getByTestId('app-screen-column')

    expect(column.props.style.width).toBe('100%')
    expect(column.props.style.maxWidth).toBe(lavenderTheme.layout.column)
    // A raw pixel width here — rather than '100%' — is exactly the kind of
    // regression this guards against: it would hold at 430pt and overflow at
    // 320pt, and nothing about rendering only at one width would catch it.
    expect(typeof column.props.style.width).not.toBe('number')
  })
})
