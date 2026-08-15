import { screen } from '@testing-library/react-native'

import { OUR_STORY_BEGINS_COPY as COPY } from '@/copy/ourStoryBegins'
import { OurStoryBeginsScreen } from '@/modules/module-01-onboarding/screens/OurStoryBeginsScreen'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

describe('OurStoryBeginsScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<OurStoryBeginsScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('offers both exits', async () => {
    await renderScreen(<OurStoryBeginsScreen />)

    expect(screen.getByRole('button', { name: COPY.begin })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.skip })).toBeTruthy()
  })

  it('says plainly that there is nowhere to go yet', async () => {
    // Cluster 3 does not exist. Rather than wire the buttons to a route that
    // would throw, the screen states the end of the built flow. Spec section 8
    // records this; the note goes when Cluster 3 lands.
    await renderScreen(<OurStoryBeginsScreen />)

    expect(screen.getByText(COPY.endOfFlowNote)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
