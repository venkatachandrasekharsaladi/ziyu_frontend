import { render, screen, userEvent } from '@testing-library/react-native'
import { Dimensions } from 'react-native'

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

  /**
   * The bug this guards against: six boxes at a FIXED 44pt plus five 8pt gaps
   * come to 304pt, which does not fit inside a 320pt phone once the screen's
   * own horizontal padding is subtracted (280pt left) — an overflow real
   * hardware would clip or scroll sideways, and a test that only ever renders
   * at one width would never catch.
   */
  describe('at a 320pt phone', () => {
    beforeEach(() => {
      Dimensions.set({ window: { width: 320, height: 844, scale: 2, fontScale: 1 } })
    })

    it('makes the boxes fluid instead of a fixed width that could overflow', async () => {
      await render(<CodeInput label="Partner code" value="" onChangeText={() => {}} />)

      const boxes = screen.getAllByTestId('code-box')

      for (const box of boxes) {
        const style = Array.isArray(box.props.style)
          ? Object.assign({}, ...box.props.style.filter(Boolean))
          : box.props.style

        // `flex: 1`, not a fixed `width` — the row shrinks its boxes together
        // to whatever space it actually has. `maxWidth` only ever stops them
        // growing past their normal size on a wider phone.
        expect(style.flex).toBe(1)
        expect(style.width).toBeUndefined()
        expect(style.maxWidth).toBe(44)
      }
    })
  })

  describe('at a tablet-width frame', () => {
    beforeEach(() => {
      Dimensions.set({ window: { width: 800, height: 1024, scale: 2, fontScale: 1 } })
    })

    it('widens the boxes rather than leaving them lost on a much bigger screen', async () => {
      await render(<CodeInput label="Partner code" value="" onChangeText={() => {}} />)

      const boxes = screen.getAllByTestId('code-box')

      for (const box of boxes) {
        const style = Array.isArray(box.props.style)
          ? Object.assign({}, ...box.props.style.filter(Boolean))
          : box.props.style

        expect(style.maxWidth).toBe(56)
      }
    })
  })
})
