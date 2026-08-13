import { render, screen, userEvent } from '@testing-library/react-native'

import { BRAND } from '@/config/brand'
import { AppHeader } from '@/design-system/patterns/AppHeader'

describe('AppHeader', () => {
  it('shows the wordmark from BRAND, never a literal', async () => {
    await render(<AppHeader />)

    expect(screen.getByText(BRAND.name)).toBeTruthy()
  })

  it('renders no back button when onBack is absent', async () => {
    await render(<AppHeader />)

    expect(screen.queryByRole('button', { name: 'Go back' })).toBeNull()
  })

  it('renders a back button when onBack is given, and calls it', async () => {
    const onBack = jest.fn()
    await render(<AppHeader onBack={onBack} />)

    await userEvent.press(screen.getByRole('button', { name: 'Go back' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('always renders both edge slots, so the wordmark is centred by symmetry', async () => {
    // M00-S05 centred its wordmark with padding-right: 158.7px, which only looks
    // centred at exactly 390pt. A matching spacer centres it at any width.
    await render(<AppHeader />)
    expect(screen.getAllByTestId('header-edge')).toHaveLength(2)
  })

  it('still renders both edge slots when a back button is present', async () => {
    await render(<AppHeader onBack={() => {}} />)

    expect(screen.getAllByTestId('header-edge')).toHaveLength(2)
  })
})
