import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { AUTH_ERROR_COPY } from '@/copy/errors'
import { RESET_PASSWORD_COPY as COPY } from '@/copy/resetPassword'
import { ResetPasswordScreen } from '@/modules/module-00-auth/screens/ResetPasswordScreen'
import { authService } from '@/services/auth'
import { RESERVED_RESET_TOKENS } from '@/services/auth/mock'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()
const mockBack = jest.fn()
let mockParams: Record<string, string> = {}

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}))

async function fillAndSubmit(password: string, confirmation = password) {
  await userEvent.type(screen.getByLabelText(COPY.newPasswordLabel), password)
  await userEvent.type(screen.getByLabelText(COPY.confirmLabel), confirmation)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockBack.mockClear()
    mockParams = { token: RESERVED_RESET_TOKENS.valid }
    jest.restoreAllMocks()
  })

  it('renders the form state from copy', async () => {
    await renderScreen(<ResetPasswordScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByLabelText(COPY.newPasswordLabel)).toBeTruthy()
    expect(screen.getByLabelText(COPY.confirmLabel)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
  })

  it('shows the strength meter beside the password field', async () => {
    await renderScreen(<ResetPasswordScreen />)

    expect(screen.getByText(COPY.strengthLabel)).toBeTruthy()
  })

  it('sends the token from the route together with the new password', async () => {
    const reset = jest.spyOn(authService, 'resetPassword')

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    await waitFor(() => {
      expect(reset).toHaveBeenCalledWith({
        token: RESERVED_RESET_TOKENS.valid,
        newPassword: 'NewLoveOS@123',
      })
    })
  })

  it('never sends the confirmation, which is not in the contract', async () => {
    const reset = jest.spyOn(authService, 'resetPassword')

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    await waitFor(() => expect(reset).toHaveBeenCalled())
    expect(Object.keys(reset.mock.calls[0]![0]).sort()).toEqual(['newPassword', 'token'])
  })

  it('rejects a weak password before calling the service', async () => {
    const reset = jest.spyOn(authService, 'resetPassword')

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('short1')

    await waitFor(() => {
      expect(screen.getByLabelText(COPY.newPasswordLabel).props.accessibilityHint).toBe(
        '8–128 characters',
      )
    })
    expect(reset).not.toHaveBeenCalled()
  })

  it('rejects a mismatched confirmation before calling the service', async () => {
    const reset = jest.spyOn(authService, 'resetPassword')

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123', 'NewLoveOS@124')

    await waitFor(() => {
      expect(screen.getByLabelText(COPY.confirmLabel).props.accessibilityHint).toBe(
        'Both passwords need to match.',
      )
    })
    expect(reset).not.toHaveBeenCalled()
  })

  it('swaps to the success state once the password is changed', async () => {
    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    expect(await screen.findByText(COPY.successHeading)).toBeTruthy()
    expect(screen.getByText(COPY.successLede)).toBeTruthy()
    expect(screen.queryByLabelText(COPY.newPasswordLabel)).toBeNull()
  })

  it('continues to sign in, because the reset revoked every session', async () => {
    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    await userEvent.press(await screen.findByRole('button', { name: COPY.successAction }))

    // replace, not push: there is nothing to come back to, and the reset form
    // cannot be resubmitted with a token the server has now consumed.
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in')
  })

  it('reports an expired link in the words of this screen, not the session default', async () => {
    mockParams = { token: RESERVED_RESET_TOKENS.expired }

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    expect(await screen.findByText(COPY.errors.TOKEN_EXPIRED)).toBeTruthy()
    expect(screen.queryByText(AUTH_ERROR_COPY.TOKEN_EXPIRED)).toBeNull()
  })

  it('reports a consumed link as invalid', async () => {
    mockParams = { token: RESERVED_RESET_TOKENS.used }

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    expect(await screen.findByText(COPY.errors.TOKEN_INVALID)).toBeTruthy()
  })

  it('falls back to the shared copy for codes it has no opinion on', async () => {
    mockParams = { token: RESERVED_RESET_TOKENS.offline }

    await renderScreen(<ResetPasswordScreen />)
    await fillAndSubmit('NewLoveOS@123')

    expect(await screen.findByText(AUTH_ERROR_COPY.NETWORK)).toBeTruthy()
  })

  describe('without a token', () => {
    beforeEach(() => {
      mockParams = {}
    })

    it('does not offer a form it could never submit', async () => {
      await renderScreen(<ResetPasswordScreen />)

      expect(screen.queryByLabelText(COPY.newPasswordLabel)).toBeNull()
      expect(screen.queryByRole('button', { name: COPY.submit })).toBeNull()
    })

    it('explains why and offers a way out', async () => {
      await renderScreen(<ResetPasswordScreen />)

      expect(screen.getByText(COPY.errors.TOKEN_INVALID)).toBeTruthy()

      await userEvent.press(screen.getByRole('button', { name: COPY.missingTokenAction }))

      expect(mockReplace).toHaveBeenCalledWith('/(auth)/forgot-password')
    })
  })
})
