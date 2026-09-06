import { render, screen, userEvent } from '@testing-library/react-native'

import { IconButton } from '@/design-system/patterns/IconButton'

describe('IconButton', () => {
  it('announces itself by its label, not its icon', async () => {
    await render(<IconButton icon="mic" label="Record voice note" onPress={() => {}} />)

    expect(screen.getByRole('button', { name: 'Record voice note' })).toBeTruthy()
  })

  it('calls onPress', async () => {
    const onPress = jest.fn()
    await render(<IconButton icon="plus" label="Add attachment" onPress={onPress} />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  // The "honestly unavailable" rule, owned here now rather than re-implemented
  // per control: a button with nowhere to go still renders, still announces
  // itself, and reports that it is disabled — it does not silently no-op.
  it('renders disabled when it has no handler', async () => {
    await render(<IconButton icon="more-vertical" label="More options" />)

    const button = screen.getByRole('button', { name: 'More options' })
    expect(button.props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('does not fire when it has no handler', async () => {
    const onPress = jest.fn()
    await render(<IconButton icon="more-vertical" label="More options" />)

    await userEvent.press(screen.getByRole('button'))

    expect(onPress).not.toHaveBeenCalled()
  })
})
