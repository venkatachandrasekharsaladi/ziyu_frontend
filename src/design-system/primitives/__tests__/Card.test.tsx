import { render, screen } from '@testing-library/react-native'

import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'

describe('Card', () => {
  it('renders its children', async () => {
    await render(
      <Card>
        <Text>Password security</Text>
      </Card>,
    )

    expect(screen.getByText('Password security')).toBeTruthy()
  })
})
