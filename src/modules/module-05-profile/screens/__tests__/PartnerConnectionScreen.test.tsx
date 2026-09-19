import { screen, userEvent } from '@testing-library/react-native'

import { SPACE_PARTNER_COPY as COPY } from '@/copy/spacePartner'
import { PartnerConnectionScreen } from '@/modules/module-05-profile/screens/PartnerConnectionScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('PartnerConnectionScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    useStoryStore.getState().reset()
  })

  // The frame only draws a connected partner, but the hub links here either
  // way. Claiming a connection that does not exist is the worse failure.
  it('says so plainly when nobody has joined yet', async () => {
    await renderScreen(<PartnerConnectionScreen />)

    expect(screen.getByText(COPY.waitingTitle)).toBeTruthy()
    expect(screen.queryByText(COPY.connected)).toBeNull()
  })

  it('offers the invite from the unpaired state', async () => {
    const user = userEvent.setup()

    await renderScreen(<PartnerConnectionScreen />)
    await user.press(screen.getByRole('button', { name: new RegExp(COPY.invite) }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/partner')
  })

  it('reports the connection once there is a partner', async () => {
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<PartnerConnectionScreen />)

    expect(screen.getByText(COPY.connected)).toBeTruthy()
    expect(screen.getByText(COPY.accessBody('Sarah'))).toBeTruthy()
  })

  it('does not invent a pairing date it was never given', async () => {
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<PartnerConnectionScreen />)

    expect(screen.getByText(COPY.connectedSinceUnknown)).toBeTruthy()
  })

  it('routes to the two actions', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ name: 'Sarah' } as never)

    await renderScreen(<PartnerConnectionScreen />)

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.editPartner) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/space/edit-partner')

    await user.press(screen.getByRole('button', { name: new RegExp(COPY.manage) }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/settings/partner')
  })
})
