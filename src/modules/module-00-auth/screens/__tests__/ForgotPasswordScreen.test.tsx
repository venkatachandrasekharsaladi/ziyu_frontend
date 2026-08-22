import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { AUTH_ERROR_COPY } from '@/copy/errors'
import { FORGOT_PASSWORD_COPY as COPY } from '@/copy/forgotPassword'
import { ForgotPasswordScreen } from '@/modules/module-00-auth/screens/ForgotPasswordScreen'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function submit(email: string) {
  await userEvent.type(screen.getByLabelText(COPY.emailLabel), email)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders the form state from copy', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.backToSignIn })).toBeTruthy()
  })

  it('rejects a malformed email without entering the sent state', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await submit('nope')

    expect(await screen.findByText('Enter a valid email address')).toBeTruthy()
    expect(screen.queryByText(COPY.sentHeading)).toBeNull()
  })

  it('swaps to the sent state in place, naming the address', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await submit('a@example.com')

    expect(await screen.findByText(COPY.sentHeading)).toBeTruthy()
    expect(screen.getByText(COPY.sentLede('a@example.com'))).toBeTruthy()
    // An in-place swap, not a sixth screen: Figma names its only frame
    // "(Default)", implying a second state that was never drawn.
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('drops the email field once sent', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await submit('a@example.com')

    await waitFor(() => {
      expect(screen.queryByLabelText(COPY.emailLabel)).toBeNull()
    })
  })

  it('reports success for an unknown address too', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    // Confirming which addresses have accounts is account enumeration.
    await submit('nobody@example.com')

    expect(await screen.findByText(COPY.sentHeading)).toBeTruthy()
  })

  it('offers a resend in the sent state', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await submit('a@example.com')

    expect(await screen.findByRole('button', { name: COPY.resend })).toBeTruthy()
    expect(screen.queryByRole('button', { name: COPY.submit })).toBeNull()
  })

  it('shows a form-level error on network failure and stays on the form', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await submit('offline@example.com')

    expect(await screen.findByText(AUTH_ERROR_COPY.NETWORK)).toBeTruthy()
    expect(screen.queryByText(COPY.sentHeading)).toBeNull()
  })

  it('navigates back to sign in', async () => {
    await renderScreen(<ForgotPasswordScreen />)

    await userEvent.press(screen.getByRole('button', { name: COPY.backToSignIn }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in')
  })
})
