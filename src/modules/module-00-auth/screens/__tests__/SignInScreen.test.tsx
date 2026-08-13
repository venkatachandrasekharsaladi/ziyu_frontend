import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { SIGN_IN_COPY as COPY } from '@/copy/signIn'
import { SignInScreen } from '@/modules/module-00-auth/screens/SignInScreen'
import { authService } from '@/services/auth'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
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

  it('navigates to verify-email on success', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('a@example.com', 'hunter2!')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/(auth)/verify-email')
    })
  })

  it('shows a form-level error on bad credentials and clears only the password', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('wrong@example.com', 'hunter2!')

    expect(await screen.findByText(COPY.errors.INVALID_CREDENTIALS)).toBeTruthy()
    // Retyping a correct email is pure friction.
    expect(screen.getByLabelText(COPY.emailLabel).props.value).toBe('wrong@example.com')
    expect(screen.getByLabelText(COPY.passwordLabel).props.value).toBe('')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows a form-level error on network failure', async () => {
    await renderScreen(<SignInScreen />)

    await fillAndSubmit('offline@example.com', 'hunter2!')

    expect(await screen.findByText(COPY.errors.NETWORK)).toBeTruthy()
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
