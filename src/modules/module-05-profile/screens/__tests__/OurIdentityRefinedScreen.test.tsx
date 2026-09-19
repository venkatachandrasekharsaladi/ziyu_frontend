import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_IDENTITY_COPY as COPY } from '@/copy/spaceIdentity'
import { OurIdentityRefinedScreen } from '@/modules/module-05-profile/screens/OurIdentityRefinedScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('OurIdentityRefinedScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
  })

  it('names the pair once both are known', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Chandu' } as never)
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<OurIdentityRefinedScreen />)

    expect(screen.getByText(COPY.pair('Chandu', 'Sarah'))).toBeTruthy()
  })

  it('falls back to your name alone before a partner joins', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Chandu' } as never)

    await renderScreen(<OurIdentityRefinedScreen />)

    expect(screen.getByText('Chandu')).toBeTruthy()
  })

  // The deviation this screen documents: the frame draws portraits with no way
  // in, which leaves its save with nothing to save. Each portrait is the way in.
  it('opens the edit screens from the portraits', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<OurIdentityRefinedScreen />)

    await user.press(screen.getByLabelText(COPY.editMine))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/edit-profile')

    await user.press(screen.getByLabelText(COPY.editPartner))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/edit-partner')
  })

  it('shows no "together since" line without a recorded date', async () => {
    await renderScreen(<OurIdentityRefinedScreen />)

    expect(screen.queryByText(/Together since/)).toBeNull()
  })
})
