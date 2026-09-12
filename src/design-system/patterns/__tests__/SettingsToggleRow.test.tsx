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

  // TWO assertions, because they cover two different things. The forwarding is
  // what actually stops a disabled row on a device — a switch the platform will
  // not let you touch. The no-fire is what stops it in this file, where
  // `fireEvent` reaches the handler directly and delivers an event no platform
  // ever would; on its own it would pass even if `disabled` were never
  // forwarded at all, which is the hollow version of this test.
  it('does not fire while disabled, and is disabled where it counts', async () => {
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

    const control = screen.getByRole('switch', { name: 'Messages' })

    expect(control.props.disabled).toBe(true)
    fireEvent(control, 'valueChange', false)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('is not disabled by default', async () => {
    await renderScreen(
      <SettingsToggleRow icon="eye" label="Read receipts" value onValueChange={jest.fn()} />,
    )

    expect(screen.getByRole('switch', { name: 'Read receipts' }).props.disabled).toBe(false)
  })
})
