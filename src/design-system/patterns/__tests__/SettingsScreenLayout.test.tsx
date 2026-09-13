import { screen, userEvent } from '@testing-library/react-native'

import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { lavenderTheme } from '@/design-system/themes/theme'
import { renderScreen } from '@/test/renderScreen'

describe('SettingsScreenLayout', () => {
  it('shows the screen title', async () => {
    await renderScreen(
      <SettingsScreenLayout title="Appearance">
        <Text variant="body">body</Text>
      </SettingsScreenLayout>,
    )

    expect(screen.getByText('Appearance')).toBeTruthy()
  })

  it('has no bottom bar — a pushed settings page is a full screen', async () => {
    await renderScreen(
      <SettingsScreenLayout title="Appearance">
        <Text variant="body">body</Text>
      </SettingsScreenLayout>,
    )

    expect(screen.queryByLabelText('Profile')).toBeNull()
    expect(screen.queryByLabelText('Home')).toBeNull()
  })

  it('goes back when the back control is used', async () => {
    const onBack = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <SettingsScreenLayout title="Appearance" onBack={onBack}>
        <Text variant="body">body</Text>
      </SettingsScreenLayout>,
    )
    await user.press(screen.getByLabelText('Go back'))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('renders its children', async () => {
    await renderScreen(
      <SettingsScreenLayout title="Appearance">
        <Text variant="body">the content</Text>
      </SettingsScreenLayout>,
    )

    expect(screen.getByText('the content')).toBeTruthy()
  })

  // The single lever, proven — the same guard `AppScreenLayout` carries, and
  // for the same reason twice over: a pushed settings page and a tab page have
  // to measure identically, so a raw number here would go unnoticed until two
  // screens in the same flow stopped lining up. `width: '100%'` is what a 320pt
  // device leans on; `maxWidth` only engages once the frame is wider than
  // `theme.layout.column`.
  it.each([320, 430])('keeps the content column fluid at a %dpt frame', async (width) => {
    await renderScreen(
      <SettingsScreenLayout title="Appearance">
        <Text variant="body">the content</Text>
      </SettingsScreenLayout>,
      { width },
    )

    const column = screen.getByTestId('settings-screen-column')

    expect(column.props.style.width).toBe('100%')
    expect(column.props.style.maxWidth).toBe(lavenderTheme.layout.column)
    expect(typeof column.props.style.width).not.toBe('number')
  })
})
