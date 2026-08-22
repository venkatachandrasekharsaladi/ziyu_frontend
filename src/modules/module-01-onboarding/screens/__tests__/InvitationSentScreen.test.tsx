import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Alert, Share } from 'react-native'

import { INVITATION_SENT_COPY as COPY } from '@/copy/invitationSent'
import { InvitationSentScreen } from '@/modules/module-01-onboarding/screens/InvitationSentScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

/** Presses the destructive button in the confirmation Alert. */
function confirmAlert() {
  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
    text: string
    style?: string
    onPress?: () => void
  }[]

  buttons.find((b) => b.style === 'destructive')?.onPress?.()
}

describe('InvitationSentScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    useRelationshipStore.getState().reset()
    useRelationshipStore.getState().setInvite('L8V7QK')
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders its blocks and the already-issued code', async () => {
    await renderScreen(<InvitationSentScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByText('L8V · 7QK')).toBeTruthy()
  })

  it('can share the same code again', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.shareAgain }))

    await waitFor(() => expect(Share.share).toHaveBeenCalled())
  })

  it('asks before cancelling, because the partner may already hold the code', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))

    expect(Alert.alert).toHaveBeenCalled()
    // Nothing is destroyed until the user confirms.
    expect(useRelationshipStore.getState().code).toBe('L8V7QK')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('destroys the invitation only once confirmed', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))
    confirmAlert()

    await waitFor(() => expect(useRelationshipStore.getState().code).toBeNull())
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/setup'))
  })
})
