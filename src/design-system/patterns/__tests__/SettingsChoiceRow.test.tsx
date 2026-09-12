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
})
