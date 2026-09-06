import { render, screen, userEvent } from '@testing-library/react-native'
import { Pressable } from 'react-native'

import { Overlay } from '@/design-system/patterns/Overlay'
import { Text } from '@/design-system/primitives/Text'

describe('Overlay', () => {
  it('renders its content over a dismissible backdrop', async () => {
    await render(
      <Overlay onDismiss={() => {}} dismissLabel="Dismiss attachments">
        <Text>Photo</Text>
      </Overlay>,
    )

    expect(screen.getByLabelText('Dismiss attachments')).toBeTruthy()
    expect(screen.getByText('Photo')).toBeTruthy()
  })

  it('dismisses when the backdrop is pressed', async () => {
    const onDismiss = jest.fn()
    await render(
      <Overlay onDismiss={onDismiss} dismissLabel="Dismiss dialog">
        <Text>Sign out?</Text>
      </Overlay>,
    )

    await userEvent.press(screen.getByLabelText('Dismiss dialog'))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  // The reason this component exists. When the backdrop wrapped its content,
  // react-native-web rendered a `<button>` inside a `<button>` — invalid HTML,
  // reported as a hydration error, and a control neither a keyboard nor a
  // screen reader can navigate. The backdrop is a sibling, so a button in the
  // content is never a descendant of it.
  it('keeps the backdrop out of the content, so a nested control is never inside it', async () => {
    const onDismiss = jest.fn()
    const onPress = jest.fn()
    await render(
      <Overlay onDismiss={onDismiss} dismissLabel="Dismiss dialog">
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Sign out">
          <Text>Sign out</Text>
        </Pressable>
      </Overlay>,
    )

    await userEvent.press(screen.getByLabelText('Sign out'))

    expect(onPress).toHaveBeenCalledTimes(1)
    // Pressing the action must not also dismiss: nothing bubbles, because the
    // backdrop is not an ancestor.
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
