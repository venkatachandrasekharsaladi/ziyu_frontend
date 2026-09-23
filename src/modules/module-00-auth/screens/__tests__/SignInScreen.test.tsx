import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { AUTH_ERROR_COPY } from '@/copy/errors'
import { SIGN_IN_COPY as COPY } from '@/copy/signIn'
import { SignInScreen } from '@/modules/module-00-auth/screens/SignInScreen'
import { authService } from '@/services/auth'
import { RESERVED_VERIFIED_EMAIL } from '@/services/auth/mock'
import { useSessionStore } from '@/state/sessionStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    canGoBack: () => true,
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
}))

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(COPY.emailLabel), email)
  await userEvent.type(screen.getByLabelText(COPY.passwordLabel), password)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('SignInScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockBack.mockClear()
  })

  it('renders every block from copy', async () => {
    await renderScreen(<SignInScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByLabelText(COPY.emailLabel)).toBeTruthy()
    expect(screen.getByLabelText(COPY.passwordLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
    expect(screen.getByText(COPY.dividerLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeTruthy()
    expect(screen.getByRole('link', { name: COPY.footerLink })).toBeTruthy()
  })

  it('shows a field error for a malformed email and does not call the service', async () => {
    const signIn = jest.spyOn(authService, 'signIn')
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('nope', 'hunter2!')

    expect(await screen.findByText('Enter a valid email address')).toBeTruthy()
    expect(signIn).not.toHaveBeenCalled()

    signIn.mockRestore()
  })

  it('sends an UNVERIFIED account to the mail step, and keeps the session', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('a@example.com', 'hunter2!')

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/verify-email')
    })

    /*
     * `replace`, not `push`: there is nothing useful behind a successful sign
     * in, and leaving it on the stack let a back gesture return to a filled-in
     * form for an account already signed into.
     *
     * The session is asserted through the real store rather than a spy —
     * `(app)` and `(onboarding)` are guarded on exactly this, so a sign-in that
     * navigated correctly but stored nothing would bounce the user straight
     * back to Welcome.
     */
    expect(useSessionStore.getState().session).toMatchObject({
      email: 'a@example.com',
      emailVerified: false,
    })
  })

  it('sends a VERIFIED account onward into onboarding instead', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit(RESERVED_VERIFIED_EMAIL, 'hunter2!')

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/setup')
    })

    expect(useSessionStore.getState().session?.emailVerified).toBe(true)
  })

  it('shows a form-level error on bad credentials and clears only the password', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('wrong@example.com', 'hunter2!')

    expect(await screen.findByText(AUTH_ERROR_COPY.INVALID_CREDENTIALS)).toBeTruthy()
    // Retyping a correct email is pure friction.
    expect(screen.getByLabelText(COPY.emailLabel).props.value).toBe('wrong@example.com')
    expect(screen.getByLabelText(COPY.passwordLabel).props.value).toBe('')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows a form-level error on network failure', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('offline@example.com', 'hunter2!')

    expect(await screen.findByText(AUTH_ERROR_COPY.NETWORK)).toBeTruthy()
  })

  it('navigates to forgot-password', async () => {
    await renderScreen(<SignInScreen />)

    await userEvent.press(screen.getByRole('link', { name: COPY.forgotLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password')
  })

  it('navigates to sign-up from the footer', async () => {
    await renderScreen(<SignInScreen />)

    await userEvent.press(screen.getByRole('link', { name: COPY.footerLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-up')
  })

  it('offers a back action in the header', async () => {
    await renderScreen(<SignInScreen />)

    await userEvent.press(screen.getByRole('button', { name: 'Go back' }))

    expect(mockBack).toHaveBeenCalledTimes(1)
  })
})
