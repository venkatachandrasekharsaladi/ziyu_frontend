import { render, screen, userEvent } from '@testing-library/react-native'

import { SegmentedControl } from '@/design-system/primitives/SegmentedControl'

const SEGMENTS = [
  { value: 'exact' as const, label: 'Exact date' },
  { value: 'monthYear' as const, label: 'Month + Year' },
  { value: 'yearOnly' as const, label: 'Year only' },
]

describe('SegmentedControl', () => {
  it('renders every segment', async () => {
    await render(
      <SegmentedControl label="How well do you remember?" segments={SEGMENTS} value="exact" onChange={() => {}} />,
    )

    expect(screen.getByLabelText('Exact date')).toBeTruthy()
    expect(screen.getByLabelText('Month + Year')).toBeTruthy()
    expect(screen.getByLabelText('Year only')).toBeTruthy()
  })

  it('reports the selection to a screen reader, not by colour alone', async () => {
    await render(
      <SegmentedControl label="Precision" segments={SEGMENTS} value="monthYear" onChange={() => {}} />,
    )

    expect(screen.getByLabelText('Month + Year').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByLabelText('Exact date').props.accessibilityState).toMatchObject({
      selected: false,
    })
  })

  it('emits the chosen value', async () => {
    const onChange = jest.fn()
    await render(
      <SegmentedControl label="Precision" segments={SEGMENTS} value="exact" onChange={onChange} />,
    )

    await userEvent.press(screen.getByLabelText('Year only'))

    expect(onChange).toHaveBeenCalledWith('yearOnly')
  })

  it('renders its own label', async () => {
    await render(
      <SegmentedControl label="Precision" segments={SEGMENTS} value="exact" onChange={() => {}} />,
    )

    expect(screen.getByText('Precision')).toBeTruthy()
  })
})
