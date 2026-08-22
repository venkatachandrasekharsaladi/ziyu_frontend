import { render, screen } from '@testing-library/react-native'

import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Text } from '@/design-system/primitives/Text'

describe('StatusScreen', () => {
  it('renders heading, lede and actions', async () => {
    await render(
      <StatusScreen
        heading="Creating your shared space..."
        lede="just a moment"
        actions={<Text>Continue</Text>}
      />,
    )

    expect(screen.getByText('Creating your shared space...')).toBeTruthy()
    expect(screen.getByText('just a moment')).toBeTruthy()
    expect(screen.getByText('Continue')).toBeTruthy()
  })

  it('works with a heading alone', async () => {
    await render(<StatusScreen heading="Connecting" />)

    expect(screen.getByText('Connecting')).toBeTruthy()
  })

  it('renders an illustration when given one', async () => {
    await render(
      <StatusScreen heading="Connecting" illustration={<Text>art</Text>} />,
    )

    expect(screen.getByText('art')).toBeTruthy()
  })
})
