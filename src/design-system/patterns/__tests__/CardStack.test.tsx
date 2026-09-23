import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { CardStack } from '@/design-system/patterns/CardStack'

const ITEMS = ['first', 'second', 'third']

describe('CardStack', () => {
  it('renders nothing for an empty deck', async () => {
    const { toJSON } = await render(
      <CardStack items={[]} keyExtractor={(i) => i} renderItem={(i) => <Text>{i}</Text>} />,
    )

    expect(toJSON()).toBeNull()
  })

  it('renders a single card with no peek layers and no dots', async () => {
    await render(
      <CardStack
        items={['only']}
        keyExtractor={(i) => i}
        renderItem={(i) => <Text>{i}</Text>}
        testID="stack"
      />,
    )

    expect(screen.getByText('only')).toBeTruthy()
    expect(screen.queryByTestId('stack-peek-1')).toBeNull()
    expect(screen.queryByTestId('stack-dot-0')).toBeNull()
  })

  it('shows a peek layer per card behind the front one, capped at two', async () => {
    await render(
      <CardStack
        items={ITEMS}
        keyExtractor={(i) => i}
        renderItem={(i) => <Text>{i}</Text>}
        testID="stack"
      />,
    )

    expect(screen.getByTestId('stack-peek-1')).toBeTruthy()
    expect(screen.getByTestId('stack-peek-2')).toBeTruthy()
    // Every page renders — a plain ScrollView, not a virtualised list.
    expect(screen.getByText('first')).toBeTruthy()
    expect(screen.getByText('second')).toBeTruthy()
    expect(screen.getByText('third')).toBeTruthy()
  })

  it('marks the first dot as on and renders one dot per card', async () => {
    await render(
      <CardStack
        items={ITEMS}
        keyExtractor={(i) => i}
        renderItem={(i) => <Text>{i}</Text>}
        testID="stack"
      />,
    )

    expect(screen.getByTestId('stack-dot-0-on')).toBeTruthy()
    expect(screen.getByTestId('stack-dot-1')).toBeTruthy()
    expect(screen.getByTestId('stack-dot-2')).toBeTruthy()
  })
})
