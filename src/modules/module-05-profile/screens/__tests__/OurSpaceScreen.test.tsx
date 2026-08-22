import { act, screen, userEvent, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'

import { OUR_SPACE_COPY as COPY } from '@/copy/ourSpace'
import { OurSpaceScreen } from '@/modules/module-05-profile/screens/OurSpaceScreen'
import { authService } from '@/services/auth'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

/**
 * Presses the destructive choice in the confirmation Alert.
 *
 * Wrapped in `act` because it drives a real state update from outside the
 * renderer — `Alert` is mocked, so nothing else is holding that boundary.
 */
async function confirmSignOut() {
  const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0]!
  const destroy = buttons.find(
    (button: { text: string }) => button.text === COPY.confirmSignOut,
  )

  await act(async () => {
    destroy.onPress()
  })
}

describe('OurSpaceScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    jest.restoreAllMocks()
    jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    // Stubbed rather than spied through: the live service waits 600ms so its
    // loading states are visible on a device, and letting that timer run leaves
    // it pending after the test ends. What the mock service does on sign out is
    // its own suite's business.
    jest.spyOn(authService, 'signOut').mockResolvedValue(undefined)
    useRelationshipStore.getState().reset()
  })

  it('renders the heading and lede from the design', async () => {
    await renderScreen(<OurSpaceScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('sits on the profile tab, so the bar knows where you are', async () => {
    await renderScreen(<OurSpaceScreen />)

    expect(screen.getByLabelText('Profile').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })

  it('offers a sign out', async () => {
    await renderScreen(<OurSpaceScreen />)

    expect(screen.getByRole('button', { name: COPY.signOut })).toBeTruthy()
  })

  it('asks before signing out rather than doing it on the first tap', async () => {
    const signOut = jest.spyOn(authService, 'signOut')

    await renderScreen(<OurSpaceScreen />)
    await userEvent.press(screen.getByRole('button', { name: COPY.signOut }))

    expect(Alert.alert).toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('signs out and leaves for welcome once confirmed', async () => {
    const signOut = jest.spyOn(authService, 'signOut')

    await renderScreen(<OurSpaceScreen />)
    await userEvent.press(screen.getByRole('button', { name: COPY.signOut }))
    await confirmSignOut()

    await waitFor(() => expect(signOut).toHaveBeenCalled())

    // replace, not push: a back gesture must not return into a signed-out app.
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'))
  })

  it('forgets the relationship, so the next account does not inherit it', async () => {
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })

    await renderScreen(<OurSpaceScreen />)
    await userEvent.press(screen.getByRole('button', { name: COPY.signOut }))
    await confirmSignOut()

    await waitFor(() => expect(useRelationshipStore.getState().partner).toBeNull())
    expect(useRelationshipStore.getState().status).toBe('none')
  })

  it('leaves anyway when the server refuses to revoke the session', async () => {
    // A failed revocation must never strand someone apparently signed in.
    jest.spyOn(authService, 'signOut').mockRejectedValue(new Error('500'))

    await renderScreen(<OurSpaceScreen />)
    await userEvent.press(screen.getByRole('button', { name: COPY.signOut }))
    await confirmSignOut()

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'))
  })

  it('stays put when the confirmation is declined', async () => {
    const signOut = jest.spyOn(authService, 'signOut')

    await renderScreen(<OurSpaceScreen />)
    await userEvent.press(screen.getByRole('button', { name: COPY.signOut }))

    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0]!
    const keep = buttons.find((button: { text: string }) => button.text === COPY.confirmKeep)

    expect(keep.style).toBe('cancel')
    expect(signOut).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
