import { screen, userEvent } from '@testing-library/react-native'

import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { renderScreen } from '@/test/renderScreen'

describe('SettingsToggleRow', () => {
  it('is found by its label, not by a separate switch name', async () => {
    await renderScreen(
      <SettingsToggleRow icon="eye" label="Read receipts" value onValueChange={jest.fn()} />,
    )

    expect(screen.getByRole('switch', { name: 'Read receipts' })).toBeTruthy()
  })

  it('reports its state to a screen reader rather than only colouring itself', async () => {
    await renderScreen(
      <SettingsToggleRow icon="eye" label="Read receipts" value onValueChange={jest.fn()} />,
    )

    expect(
      screen.getByRole('switch', { name: 'Read receipts' }).props.accessibilityState,
    ).toMatchObject({ checked: true })
  })

  it('reports the next value when flipped', async () => {
    const onValueChange = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <SettingsToggleRow icon="eye" label="Read receipts" value onValueChange={onValueChange} />,
    )
    await user.press(screen.getByRole('switch', { name: 'Read receipts' }))

    expect(onValueChange).toHaveBeenCalledWith(false)
  })

  it('does not fire while disabled', async () => {
    const onValueChange = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <SettingsToggleRow
        icon="bell"
        label="Messages"
        value
        onValueChange={onValueChange}
        disabled
      />,
    )
    await user.press(screen.getByRole('switch', { name: 'Messages' }))

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
