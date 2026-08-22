import { render, screen, userEvent } from '@testing-library/react-native'

import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'

/**
 * The four visual states live in `variants` and are stripped by the Unistyles
 * Jest mock, so the fills and borders are checked on device. What is assertable
 * — and what actually protects users — is that the error is reachable, the mask
 * toggles, and the labelling is right.
 */
describe('Input', () => {
  it('renders its label and placeholder', async () => {
    await render(
      <Input
        label="Email address"
        value=""
        onChangeText={() => {}}
        placeholder="you@example.com"
      />,
    )

    expect(screen.getByText('Email address')).toBeTruthy()
    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy()
  })

  it('labels the field for a screen reader using its visible label', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.getByLabelText('Email address')).toBeTruthy()
  })

  it('reports typing', async () => {
    const onChangeText = jest.fn()
    await render(<Input label="Email address" value="" onChangeText={onChangeText} />)

    await userEvent.type(screen.getByLabelText('Email address'), 'a')

    expect(onChangeText).toHaveBeenCalled()
  })

  it('renders the error message, so the state never rests on colour alone', async () => {
    await render(
      <Input
        label="Email address"
        value="nope"
        onChangeText={() => {}}
        error="Enter a valid email address"
      />,
    )

    expect(screen.getByText('Enter a valid email address')).toBeTruthy()
  })

  it('exposes the error to a screen reader without a visual scan', async () => {
    await render(
      <Input
        label="Email address"
        value="nope"
        onChangeText={() => {}}
        error="Enter a valid email address"
      />,
    )

    // React Native has no `aria-invalid` — its supported set is busy, checked,
    // disabled, expanded, hidden, label, labelledby, live, modal, selected and
    // the value* props. Setting one would be a no-op that only looks accessible.
    // The two mechanisms that do work: the hint on the field, and a polite live
    // region on the message so its appearance is announced.
    const field = screen.getByLabelText('Email address')
    expect(field.props.accessibilityHint).toBe('Enter a valid email address')

    expect(screen.getByTestId('input-error').props['aria-live']).toBe('polite')
  })

  it('renders no error region when there is no error', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.queryByTestId('input-error')).toBeNull()
  })

  it('masks a secure field and offers a labelled reveal toggle', async () => {
    await render(<Input label="Password" value="hunter2" onChangeText={() => {}} secure />)

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true)
    expect(screen.getByRole('button', { name: 'Show password' })).toBeTruthy()
  })

  it('unmasks when the toggle is pressed, and relabels it', async () => {
    await render(<Input label="Password" value="hunter2" onChangeText={() => {}} secure />)

    await userEvent.press(screen.getByRole('button', { name: 'Show password' }))

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false)
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy()
  })

  it('renders no toggle on a non-secure field', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders a labelTrailing slot beside the label', async () => {
    await render(
      <Input
        label="Password"
        value=""
        onChangeText={() => {}}
        secure
        labelTrailing={
          <Text variant="caption" tone="brand">
            Forgot password?
          </Text>
        }
      />,
    )

    expect(screen.getByText('Forgot password?')).toBeTruthy()
  })

  it('blocks editing when not editable', async () => {
    await render(
      <Input label="Email address" value="" onChangeText={() => {}} editable={false} />,
    )

    expect(screen.getByLabelText('Email address').props.editable).toBe(false)
  })

  it('is single-line by default', async () => {
    await render(<Input label="Email address" value="" onChangeText={() => {}} />)

    expect(screen.getByLabelText('Email address').props.multiline).toBeFalsy()
  })

  it('grows into a note box when asked', async () => {
    // The same field, taller — it keeps the fill, radius, border and every
    // focus/error state, so a note never reads as a different control.
    await render(
      <Input label="Memory" value="" onChangeText={() => {}} multiline />,
    )

    expect(screen.getByLabelText('Memory').props.multiline).toBe(true)
  })

  it('still reports errors when multiline', async () => {
    await render(
      <Input
        label="Memory"
        value=""
        onChangeText={() => {}}
        multiline
        error="Say something about it"
      />,
    )

    expect(screen.getByText('Say something about it')).toBeTruthy()
  })

  it('calls onBlur when the field loses focus', async () => {
    const onBlur = jest.fn()
    await render(
      <Input label="Email address" value="" onChangeText={() => {}} onBlur={onBlur} />,
    )

    // userEvent.type focuses then blurs the field.
    await userEvent.type(screen.getByLabelText('Email address'), 'a')

    expect(onBlur).toHaveBeenCalled()
  })
})
