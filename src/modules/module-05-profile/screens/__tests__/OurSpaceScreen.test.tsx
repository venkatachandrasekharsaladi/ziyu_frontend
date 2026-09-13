import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { OUR_SPACE_COPY as COPY } from '@/copy/ourSpace'
import { OurSpaceScreen } from '@/modules/module-05-profile/screens/OurSpaceScreen'
import { authService } from '@/services/auth'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

describe('OurSpaceScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    jest.restoreAllMocks()
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
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))

    // The confirm dialog is up (its title and both choices are on screen)...
    expect(screen.getByText(COPY.confirmTitle)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.confirmSignOut })).toBeTruthy()
    // ...and nothing has actually happened yet.
    expect(signOut).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('signs out and leaves for welcome once confirmed', async () => {
    const signOut = jest.spyOn(authService, 'signOut')
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())

    // replace, not push: a back gesture must not return into a signed-out app.
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'))
  })

  it('forgets the relationship, so the next account does not inherit it', async () => {
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => expect(useRelationshipStore.getState().partner).toBeNull())
    expect(useRelationshipStore.getState().status).toBe('none')
  })

  it('leaves anyway when the server refuses to revoke the session', async () => {
    // A failed revocation must never strand someone apparently signed in.
    jest.spyOn(authService, 'signOut').mockRejectedValue(new Error('500'))
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/welcome'))
  })

  it('stays put when the confirmation is declined', async () => {
    const signOut = jest.spyOn(authService, 'signOut')
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmKeep }))

    expect(screen.queryByText(COPY.confirmTitle)).toBeNull()
    expect(signOut).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  // Mutation-guarded: `isSigningOut` used to be set `true` and never cleared.
  // `mockReplace` here is a jest.fn(), not real navigation, so — unlike the
  // device, where `router.replace` unmounts this screen — the component stays
  // mounted after signing out, which is exactly what makes a stuck spinner
  // observable. If the screen's own `finally` block were removed, this fails:
  // the button stays `busy: true` forever.
  it('clears the signing-out spinner once the call settles, even though navigation usually unmounts first', async () => {
    const user = userEvent.setup()

    await renderScreen(<OurSpaceScreen />)
    await user.press(screen.getByRole('button', { name: COPY.signOut }))
    await user.press(screen.getByRole('button', { name: COPY.confirmSignOut }))

    await waitFor(() => expect(mockReplace).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('button', { name: COPY.signOut }).props.accessibilityState).toMatchObject({
        busy: false,
      }),
    )
  })
})
