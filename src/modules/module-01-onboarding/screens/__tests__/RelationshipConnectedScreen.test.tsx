import { screen, userEvent } from '@testing-library/react-native'

import { BRAND } from '@/config/brand'
import { RELATIONSHIP_CONNECTED_COPY as COPY } from '@/copy/relationshipConnected'
import { RelationshipConnectedScreen } from '@/modules/module-01-onboarding/screens/RelationshipConnectedScreen'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

describe('RelationshipConnectedScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<RelationshipConnectedScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('names the product from BRAND rather than a typed literal', async () => {
    expect(COPY.heading).toContain(BRAND.name)
  })

  it('moves on to the story', async () => {
    const user = userEvent.setup()
    await renderScreen(<RelationshipConnectedScreen />)

    await user.press(screen.getByRole('button', { name: COPY.confirm }))

    // replace: pairing is finished, so the flow behind this screen is spent.
    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/story-begins')
  })
})
