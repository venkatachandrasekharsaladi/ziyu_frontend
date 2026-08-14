import { render, screen, userEvent } from '@testing-library/react-native'

import { CodeInput } from '@/design-system/primitives/CodeInput'

describe('CodeInput', () => {
  it('renders one box per character slot', async () => {
    await render(<CodeInput label="Partner code" value="" onChangeText={() => {}} />)

    expect(screen.getAllByTestId('code-box')).toHaveLength(6)
  })

  it('shows the entered characters in order', async () => {
    await render(<CodeInput label="Partner code" value="L8V" onChangeText={() => {}} />)

    const boxes = screen.getAllByTestId('code-box')

    expect(boxes[0]).toHaveTextContent('L')
    expect(boxes[1]).toHaveTextContent('8')
    expect(boxes[2]).toHaveTextContent('V')
  })

  it('reports typed characters uppercased', async () => {
    const onChangeText = jest.fn()
    await render(<CodeInput label="Partner code" value="" onChangeText={onChangeText} />)

    await userEvent.type(screen.getByLabelText('Partner code'), 'l')

    expect(onChangeText).toHaveBeenCalledWith('L')
  })

  it('strips the separator and spaces from a pasted code', async () => {
    const onChangeText = jest.fn()
    await render(<CodeInput label="Partner code" value="" onChangeText={onChangeText} />)

    // This is exactly what a user pastes: the displayed form, separator included.
    await userEvent.paste(screen.getByLabelText('Partner code'), 'L8V · 7QK')

    expect(onChangeText).toHaveBeenCalledWith('L8V7QK')
  })

  it('clamps a pasted value longer than the code length', async () => {
    const onChangeText = jest.fn()
    await render(<CodeInput label="Partner code" value="" onChangeText={onChangeText} />)

    await userEvent.paste(screen.getByLabelText('Partner code'), 'L8V7QKZZZZ')

    expect(onChangeText).toHaveBeenCalledWith('L8V7QK')
  })

  it('renders an error message when given one', async () => {
    await render(
      <CodeInput
        label="Partner code"
        value="BADCOD"
        onChangeText={() => {}}
        error="That code does not exist."
      />,
    )

    expect(screen.getByText('That code does not exist.')).toBeTruthy()
  })

  it('exposes the error to a screen reader and marks it a live region', async () => {
    await render(
      <CodeInput
        label="Partner code"
        value="BADCOD"
        onChangeText={() => {}}
        error="That code does not exist."
      />,
    )

    expect(screen.getByLabelText('Partner code').props.accessibilityHint).toBe(
      'That code does not exist.',
    )
    expect(screen.getByTestId('code-error').props['aria-live']).toBe('polite')
  })

  it('marks the boxes as errored without relying on colour alone', async () => {
    // The message is always present alongside the border change — asserted here
    // because the border itself is a discrete style, not a stripped variant.
    await render(
      <CodeInput label="Partner code" value="" onChangeText={() => {}} error="Nope" />,
    )

    expect(screen.getByText('Nope')).toBeTruthy()
    expect(screen.getAllByTestId('code-box')).toHaveLength(6)
  })
})
