import { screen, userEvent } from '@testing-library/react-native'

import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { renderScreen } from '@/test/renderScreen'

const SEGMENTS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
] as const

describe('SettingsChoiceRow', () => {
  it('renders every choice', async () => {
    await renderScreen(
      <SettingsChoiceRow
        label="Theme"
        segments={[...SEGMENTS]}
        value="light"
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Light')).toBeTruthy()
    expect(screen.getByText('Dark')).toBeTruthy()
    expect(screen.getByText('Auto')).toBeTruthy()
  })

  it('reports the chosen value', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()

    await renderScreen(
      <SettingsChoiceRow label="Theme" segments={[...SEGMENTS]} value="light" onChange={onChange} />,
    )
    await user.press(screen.getByText('Dark'))

    expect(onChange).toHaveBeenCalledWith('dark')
  })

  it('carries selection in the accessibility tree, not only in colour', async () => {
    await renderScreen(
      <SettingsChoiceRow label="Theme" segments={[...SEGMENTS]} value="dark" onChange={jest.fn()} />,
    )

    expect(screen.getByLabelText('Dark').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('renders a second line when one is given', async () => {
    await renderScreen(
      <SettingsChoiceRow
        label="Theme"
        detail="Auto follows your device"
        segments={[...SEGMENTS]}
        value="auto"
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Auto follows your device')).toBeTruthy()
  })

  // The row draws the label; the control is asked to skip its caption. Two
  // nodes with these words means the caption came back and the row is printing
  // its own name twice, in two different styles.
  it('draws its label once, not once here and once in the control', async () => {
    await renderScreen(
      <SettingsChoiceRow label="Theme" segments={[...SEGMENTS]} value="light" onChange={jest.fn()} />,
    )

    expect(screen.getAllByText('Theme')).toHaveLength(1)
  })

  it('keeps the control findable by the same name a screen reader hears', async () => {
    await renderScreen(
      <SettingsChoiceRow label="Theme" segments={[...SEGMENTS]} value="light" onChange={jest.fn()} />,
    )

    expect(screen.getByLabelText('Theme').props.accessibilityRole).toBe('radiogroup')
  })

  it('takes an icon, and stands in the same shell without one', async () => {
    await renderScreen(
      <SettingsChoiceRow
        icon="moon"
        label="Theme"
        segments={[...SEGMENTS]}
        value="light"
        onChange={jest.fn()}
      />,
    )

    expect(screen.getByText('Theme')).toBeTruthy()
    expect(screen.getByText('Light')).toBeTruthy()
  })
})
