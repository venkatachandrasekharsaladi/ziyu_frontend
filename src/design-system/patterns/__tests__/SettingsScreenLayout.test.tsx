import { screen, userEvent } from '@testing-library/react-native'

import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
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
})
