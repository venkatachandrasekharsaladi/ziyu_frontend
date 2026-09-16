import { render, screen, userEvent } from '@testing-library/react-native'

import { Button, type ButtonVariant } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'

const VARIANTS: ButtonVariant[] = ['primary', 'soft', 'outline', 'link']

/**
 * Height, fill and shadow live in `variants` and are stripped by the Unistyles
 * Jest mock, so they are NOT asserted here — they are checked on device. What is
 * assertable is behaviour and accessibility, which is what these cover.
 */
describe('Button', () => {
  it.each(VARIANTS)('renders the %s variant as a button with its label', async (variant) => {
    await render(<Button label="Sign In" onPress={() => {}} variant={variant} />)

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeTruthy()
  })

  it('calls onPress once when tapped', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('ignores a second tap inside the double-fire guard window', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} />)
    const button = screen.getByRole('button')

    await userEvent.press(button)
    await userEvent.press(button)

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled, and reports it', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} disabled />)

    const button = screen.getByRole('button')
    await userEvent.press(button)

    expect(onPress).not.toHaveBeenCalled()
    expect(button.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('renders the trailing slot', async () => {
    await render(
      <Button
        label="Resend Email"
        onPress={() => {}}
        trailing={
          <Text variant="countdown" tone="onPrimary">
            00:59
          </Text>
        }
      />,
    )

    expect(screen.getByText('00:59')).toBeTruthy()
  })

  it('when loading, keeps its label, reports busy, and ignores presses', async () => {
    const onPress = jest.fn()
    await render(<Button label="Sign In" onPress={onPress} loading />)

    const button = screen.getByRole('button')
    await userEvent.press(button)

    // The label is deliberately kept rather than swapped for a bare spinner:
    // replacing it loses what is happening.
    expect(screen.getByText('Sign In')).toBeTruthy()
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true })
    expect(onPress).not.toHaveBeenCalled()
  })

  it('replaces the trailing slot with the spinner while loading', async () => {
    await render(
      <Button
        label="Resend Email"
        onPress={() => {}}
        trailing={
          <Text variant="countdown" tone="onPrimary">
            00:59
          </Text>
        }
        loading
      />,
    )

    expect(screen.queryByText('00:59')).toBeNull()
  })

  it('lets a caller override the screen-reader label', async () => {
    await render(
      <Button label="Sign In" onPress={() => {}} accessibilityLabel="Sign in to Tales of Two" />,
    )

    expect(screen.getByRole('button', { name: 'Sign in to Tales of Two' })).toBeTruthy()
  })
})
