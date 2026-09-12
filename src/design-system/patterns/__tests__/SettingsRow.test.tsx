import { screen, userEvent } from '@testing-library/react-native'

import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { renderScreen } from '@/test/renderScreen'

describe('SettingsRow', () => {
  it('renders its label and its value', async () => {
    await renderScreen(<SettingsRow icon="user" label="Personal Details" value="Ana" />)

    expect(screen.getByText('Personal Details')).toBeTruthy()
    expect(screen.getByText('Ana')).toBeTruthy()
  })

  it('renders a second line when one is given', async () => {
    await renderScreen(<SettingsRow icon="bell" label="Notifications" detail="6 of 6 on" />)

    expect(screen.getByText('6 of 6 on')).toBeTruthy()
  })

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()

    await renderScreen(<SettingsRow icon="user" label="Personal Details" onPress={onPress} />)
    await user.press(screen.getByRole('button', { name: 'Personal Details' }))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('is not a button when it has nowhere to go', async () => {
    await renderScreen(<SettingsRow icon="info" label="Version" value="1.0.0" />)

    expect(screen.queryByRole('button', { name: 'Version' })).toBeNull()
    expect(screen.getByText('Version')).toBeTruthy()
  })

  it('announces its value as part of its name, so the row reads as one thing', async () => {
    const onPress = jest.fn()

    await renderScreen(
      <SettingsRow icon="globe" label="Language" value="English" onPress={onPress} />,
    )

    expect(screen.getByRole('button', { name: 'Language, English' })).toBeTruthy()
  })

  // The static row is the one where the value IS the row, so it is the last
  // place the fold should be missing — and it was. Both branches now agree, and
  // agree with the component's own header comment.
  it('folds the value into its name when it is not a button either', async () => {
    await renderScreen(<SettingsRow icon="info" label="Version" value="1.0.0" />)

    expect(screen.getByLabelText('Version, 1.0.0')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Version, 1.0.0' })).toBeNull()
  })

  it('names a static row with no value by its label alone', async () => {
    await renderScreen(<SettingsRow icon="info" label="Version" />)

    expect(screen.getByLabelText('Version')).toBeTruthy()
  })
})
