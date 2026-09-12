import { screen, userEvent } from '@testing-library/react-native'

import { SETTINGS_APPEARANCE_COPY as COPY } from '@/copy/settingsAppearance'
import { useThemeChoiceStore } from '@/design-system/themes/themeChoiceStore'
import { AppearanceScreen } from '@/modules/module-05-profile/screens/AppearanceScreen'
import { renderScreen } from '@/test/renderScreen'

const mockBack = jest.fn()
const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: jest.fn() }),
}))

describe('AppearanceScreen', () => {
  beforeEach(() => {
    mockBack.mockClear()
    mockPush.mockClear()
    useThemeChoiceStore.getState().reset()
  })

  it('shows its title and lede', async () => {
    await renderScreen(<AppearanceScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('offers all three theme choices', async () => {
    await renderScreen(<AppearanceScreen />)

    expect(screen.getByText(COPY.light)).toBeTruthy()
    expect(screen.getByText(COPY.dark)).toBeTruthy()
    expect(screen.getByText(COPY.auto)).toBeTruthy()
  })

  it('records the chosen theme', async () => {
    const user = userEvent.setup()

    await renderScreen(<AppearanceScreen />)
    await user.press(screen.getByText(COPY.dark))

    expect(useThemeChoiceStore.getState().choice).toBe('dark')
  })

  it('has no bottom bar', async () => {
    await renderScreen(<AppearanceScreen />)

    expect(screen.queryByLabelText('Home')).toBeNull()
  })

  it('goes back', async () => {
    const user = userEvent.setup()

    await renderScreen(<AppearanceScreen />)
    await user.press(screen.getByLabelText('Go back'))

    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  it('routes through to Our Space for the cover', async () => {
    const user = userEvent.setup()

    await renderScreen(<AppearanceScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.coverAction) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/our-space')
  })
})
