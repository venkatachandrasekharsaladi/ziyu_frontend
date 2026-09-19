import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_WELCOME_COPY as COPY } from '@/copy/spaceWelcome'
import { SpaceWelcomeScreen } from '@/modules/module-05-profile/screens/SpaceWelcomeScreen'
import { useSpaceStore } from '@/state/spaceStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('SpaceWelcomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useSpaceStore.getState().reset()
  })

  it('invites the pair to make the space theirs', async () => {
    await renderScreen(<SpaceWelcomeScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('opens personalization from the primary action', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceWelcomeScreen />)
    await user.press(await screen.findByRole('button', { name: new RegExp(COPY.personalize) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/space/personalize')
  })

  // A dismissal that did not persist would put this screen back on the next
  // visit, which is how a polite offer turns into nagging.
  it('remembers a "maybe later"', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceWelcomeScreen />)
    expect(useSpaceStore.getState().personalizePromptDismissed).toBe(false)

    await user.press(await screen.findByRole('button', { name: new RegExp(COPY.later) }))

    expect(useSpaceStore.getState().personalizePromptDismissed).toBe(true)
  })
})
