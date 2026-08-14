import { render, screen, userEvent } from '@testing-library/react-native'

import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'

describe('PhotoPicker', () => {
  it('exposes the add affordance as a labelled button', async () => {
    await render(<PhotoPicker label="Add Photo" name="Chandu" onPick={() => {}} />)

    expect(screen.getByRole('button', { name: 'Add Photo' })).toBeTruthy()
  })

  it('calls onPick when pressed', async () => {
    const onPick = jest.fn()
    await render(<PhotoPicker label="Add Photo" name="Chandu" onPick={onPick} />)

    await userEvent.press(screen.getByRole('button', { name: 'Add Photo' }))

    expect(onPick).toHaveBeenCalledTimes(1)
  })

  it('falls back to initials with no photo', async () => {
    await render(<PhotoPicker label="Add Photo" name="Chandu Reddy" onPick={() => {}} />)

    expect(screen.getByText('CR')).toBeTruthy()
  })

  it('shows the chosen photo instead of initials', async () => {
    await render(
      <PhotoPicker
        label="Add Photo"
        name="Chandu"
        uri="https://example.com/a.jpg"
        onPick={() => {}}
      />,
    )

    expect(screen.getByTestId('avatar-image')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
  })
})
