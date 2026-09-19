import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_HOME_COPY as COPY } from '@/copy/spaceHome'
import { SpaceHomeScreen } from '@/modules/module-05-profile/screens/SpaceHomeScreen'
import { SPACE_WELCOME_COPY } from '@/copy/spaceWelcome'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('SpaceHomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
    useSpaceStore.getState().reset()

    // The hub only IS a hub once the space has a name — `3430:1503` is what it
    // shows before that. Every test below is about the populated state, so
    // they all start from a named space; the two that are about the empty
    // state clear it again themselves.
    useSpaceStore.getState().setSpace({ name: 'Our little world', coverStyle: 'dawn' })
  })

  // `3430:1503`, rendered by this screen rather than linked to.
  it('offers to personalize before the space has a name', async () => {
    useSpaceStore.getState().reset()

    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(SPACE_WELCOME_COPY.title)).toBeTruthy()
    expect(screen.queryByText(COPY.title)).toBeNull()
  })

  it('stops offering once the invitation has been waved away', async () => {
    useSpaceStore.getState().reset()
    useSpaceStore.getState().dismissPersonalizePrompt()

    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.queryByText(SPACE_WELCOME_COPY.title)).toBeNull()
  })

  it('shows its title', async () => {
    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('names the partner in the privacy card once there is one', async () => {
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(COPY.privateBody('Sarah'))).toBeTruthy()
  })

  it('falls back to the solo wording before a partner has joined', async () => {
    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(COPY.privateBodySolo)).toBeTruthy()
  })

  // A pair who skipped "when did you meet" have no total to show. A zero there
  // would be a claim, and the wrong one — so the whole card stays away.
  it('draws no days card without a recorded start', async () => {
    await renderScreen(<SpaceHomeScreen />)

    expect(screen.queryByText(COPY.timeTogether)).toBeNull()
  })

  it('counts the days once a start is recorded', async () => {
    useStoryStore.getState().setMet({ value: '2022-10-14' } as never)

    await renderScreen(<SpaceHomeScreen />)

    expect(screen.getByText(COPY.timeTogether)).toBeTruthy()
  })

  it('opens personalization from the primary action', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceHomeScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.personalize) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/space/personalize')
  })

  it('routes through to identity and preferences', async () => {
    const user = userEvent.setup()

    await renderScreen(<SpaceHomeScreen />)

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.identityTitle) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/identity')

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.preferencesTitle) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/preferences')
  })
})
