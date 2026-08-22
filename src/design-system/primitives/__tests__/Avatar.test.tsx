import { render, screen } from '@testing-library/react-native'

import { Avatar } from '@/design-system/primitives/Avatar'

describe('Avatar', () => {
  it('shows initials when there is no photo', async () => {
    await render(<Avatar name="Chandu Reddy" />)

    expect(screen.getByText('CR')).toBeTruthy()
  })

  it('takes a single initial from a single name', async () => {
    await render(<Avatar name="Chandu" />)

    expect(screen.getByText('C')).toBeTruthy()
  })

  it('shows the photo when given one, and no initials', async () => {
    await render(<Avatar name="Chandu" uri="https://example.com/a.jpg" />)

    expect(screen.getByTestId('avatar-image')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
  })

  it('names the person for a screen reader', async () => {
    await render(<Avatar name="Sarah" />)

    expect(screen.getByLabelText('Sarah')).toBeTruthy()
  })

  it('ignores empty and whitespace names without crashing', async () => {
    await render(<Avatar name="   " />)

    expect(screen.getByLabelText('Avatar')).toBeTruthy()
  })
})
