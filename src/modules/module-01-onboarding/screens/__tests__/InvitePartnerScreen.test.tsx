import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Share } from 'react-native'

import { INVITE_PARTNER_COPY as COPY } from '@/copy/invitePartner'
import { InvitePartnerScreen } from '@/modules/module-01-onboarding/screens/InvitePartnerScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('InvitePartnerScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<InvitePartnerScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
  })

  it('issues a code on mount and shows it in its display form', async () => {
    await renderScreen(<InvitePartnerScreen />)

    expect(await screen.findByText('L8V · 7QK')).toBeTruthy()
  })

  it('keeps the issued code so Invitation Sent can show the same one', async () => {
    await renderScreen(<InvitePartnerScreen />)

    await waitFor(() => expect(useRelationshipStore.getState().code).toBe('L8V7QK'))
  })

  it('shares the code through the system sheet, then advances', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitePartnerScreen />)
    await screen.findByText('L8V · 7QK')

    await user.press(screen.getByRole('button', { name: COPY.share }))

    await waitFor(() => expect(Share.share).toHaveBeenCalled())
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(onboarding)/invitation-sent'))
  })

  it('advances when the code is copied', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitePartnerScreen />)
    await screen.findByText('L8V · 7QK')

    await user.press(screen.getByRole('button', { name: COPY.copy }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(onboarding)/invitation-sent'))
  })
})
