import { render, screen, userEvent } from '@testing-library/react-native'

import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'

describe('FooterPrompt', () => {
  it('renders the prompt and the link', async () => {
    await render(
      <FooterPrompt text="New to LoveOS?" linkLabel="Create an account" onPress={() => {}} />,
    )

    expect(screen.getByText(/New to LoveOS\?/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Create an account' })).toBeTruthy()
  })

  it('calls onPress when the link is pressed', async () => {
    const onPress = jest.fn()
    await render(
      <FooterPrompt text="New to LoveOS?" linkLabel="Create an account" onPress={onPress} />,
    )

    await userEvent.press(screen.getByRole('link'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
