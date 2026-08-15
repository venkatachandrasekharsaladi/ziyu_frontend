import { screen, userEvent } from '@testing-library/react-native'

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

  it('opens the story capture flow', async () => {
    const user = userEvent.setup()
    await renderScreen(<OurStoryBeginsScreen />)

    await user.press(screen.getByRole('button', { name: COPY.begin }))

    expect(mockPush).toHaveBeenCalledWith('/(onboarding)/story-cover')
  })

  it('jumps the whole capture flow when skipped', async () => {
    // Every step inside is optional, so skipping goes straight to the summary
    // rather than stepping through five screens the user declined.
    const user = userEvent.setup()
    await renderScreen(<OurStoryBeginsScreen />)

    await user.press(screen.getByRole('button', { name: COPY.skip }))

    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/story-ready')
  })
})
