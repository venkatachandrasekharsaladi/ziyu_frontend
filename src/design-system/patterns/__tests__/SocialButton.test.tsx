import { render, screen, userEvent } from '@testing-library/react-native'

import { SocialButton } from '@/design-system/patterns/SocialButton'

describe('SocialButton', () => {
  it.each([
    ['google', 'Google'],
    ['apple', 'Apple'],
  ] as const)('renders the %s provider', async (provider, label) => {
    await render(<SocialButton provider={provider} onPress={() => {}} />)

    expect(screen.getByRole('button', { name: `Continue with ${label}` })).toBeTruthy()
    expect(screen.getByText(label)).toBeTruthy()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()
    await render(<SocialButton provider="google" onPress={onPress} />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire when disabled', async () => {
    const onPress = jest.fn()
    await render(<SocialButton provider="apple" onPress={onPress} disabled />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
  })
})
