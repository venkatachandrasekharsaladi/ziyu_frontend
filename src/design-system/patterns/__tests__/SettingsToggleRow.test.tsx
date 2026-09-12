import { fireEvent, screen, userEvent } from '@testing-library/react-native'

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

    await renderScreen(
      <SettingsToggleRow icon="eye" label="Read receipts" value onValueChange={onValueChange} />,
    )
    fireEvent(screen.getByRole('switch', { name: 'Read receipts' }), 'valueChange', false)

    expect(onValueChange).toHaveBeenCalledWith(false)
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('does not fire while disabled', async () => {
    const onValueChange = jest.fn()

    await renderScreen(
      <SettingsToggleRow
        icon="bell"
        label="Messages"
        value
        onValueChange={onValueChange}
        disabled
      />,
    )
    fireEvent(screen.getByRole('switch', { name: 'Messages' }), 'valueChange', false)

    expect(onValueChange).not.toHaveBeenCalled()
  })
})
