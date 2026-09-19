import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_IDENTITY_COPY as COPY } from '@/copy/spaceIdentity'
import { OurIdentityScreen } from '@/modules/module-05-profile/screens/OurIdentityScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('OurIdentityScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
  })

  it('asks who the pair are', async () => {
    await renderScreen(<OurIdentityScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  // A partner who has not joined has no card. An empty second card would read
  // as a missing photo rather than a missing person.
  it('draws only your card before a partner joins', async () => {
    await renderScreen(<OurIdentityScreen />)

    expect(screen.queryByText(COPY.partnerEpithet)).toBeNull()
    expect(screen.getByText(COPY.youEpithet)).toBeTruthy()
  })

  it('draws both cards once a partner has joined', async () => {
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<OurIdentityScreen />)

    expect(screen.getByText(COPY.partnerEpithet)).toBeTruthy()
  })

  it('says the journey date is unrecorded until one is set', async () => {
    await renderScreen(<OurIdentityScreen />)

    expect(screen.getByText(COPY.journeyUnknown)).toBeTruthy()
  })

  it('opens the two edit screens from their cards', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<OurIdentityScreen />)

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.editMine) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/edit-profile')

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.editPartner) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/edit-partner')
  })

  // Relationship Details has no link anywhere on the board. The journey card
  // names the same date it opens, so the link belongs there.
  it('opens relationship details from the journey card', async () => {
    const user = userEvent.setup()

    await renderScreen(<OurIdentityScreen />)
    await user.press(screen.getByLabelText(COPY.journeyBegan))

    expect(mockPush).toHaveBeenCalledWith('/(app)/space/relationship')
  })

  it('confirms once the identity is saved', async () => {
    const user = userEvent.setup()

    await renderScreen(<OurIdentityScreen />)
    expect(screen.queryByText(COPY.saved)).toBeNull()

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.save) }))
    expect(screen.getByText(COPY.saved)).toBeTruthy()
  })
})
