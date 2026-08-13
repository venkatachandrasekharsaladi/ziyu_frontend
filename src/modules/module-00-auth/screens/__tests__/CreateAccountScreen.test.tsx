import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { BRAND } from '@/config/brand'
import { CREATE_ACCOUNT_COPY as COPY } from '@/copy/createAccount'
import { CreateAccountScreen } from '@/modules/module-00-auth/screens/CreateAccountScreen'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(COPY.emailLabel), email)
  await userEvent.type(screen.getByLabelText(COPY.passwordLabel), password)
  await userEvent.press(screen.getByRole('button', { name: COPY.submit }))
}

describe('CreateAccountScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders its blocks from copy', async () => {
    await renderScreen(<CreateAccountScreen />)

    expect(screen.getByText(COPY.headingLines[0])).toBeTruthy()
    expect(screen.getByText(COPY.headingLines[1])).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByText(COPY.requirementsTitle)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.submit })).toBeTruthy()
    expect(screen.getByRole('link', { name: COPY.footerLink })).toBeTruthy()
  })

  it('interpolates the brand name into the lede rather than hardcoding it', async () => {
    // Matching /LoveOS/ on screen is ambiguous — the header wordmark carries it
    // too. The claim worth asserting is that the copy module derives it.
    expect(COPY.lede).toContain(BRAND.name)

    await renderScreen(<CreateAccountScreen />)

    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('navigates to verify-email on success', async () => {
    await renderScreen(<CreateAccountScreen />)

    await fillAndSubmit('new@example.com', 'hunter22!')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/(auth)/verify-email')
    })
  })

  it('attaches a taken email to the email field', async () => {
    await renderScreen(<CreateAccountScreen />)

    await fillAndSubmit('taken@example.com', 'hunter22!')

    expect(await screen.findByText(COPY.errors.EMAIL_TAKEN)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('rejects a weak password before calling the service', async () => {
    await renderScreen(<CreateAccountScreen />)

    await fillAndSubmit('new@example.com', 'abc')

    // Asserted on the field's hint rather than by text: the same rule label is
    // also rendered by the checklist, so a text query matches twice.
    await waitFor(() => {
      expect(screen.getByLabelText(COPY.passwordLabel).props.accessibilityHint).toBe(
        '8+ characters long',
      )
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('updates the checklist live as the password is typed', async () => {
    await renderScreen(<CreateAccountScreen />)

    expect(screen.queryAllByTestId('rule-met')).toHaveLength(0)

    await userEvent.type(screen.getByLabelText(COPY.passwordLabel), 'hunter22!')

    await waitFor(() => {
      expect(screen.getAllByTestId('rule-met')).toHaveLength(3)
    })
  })

  it('navigates to sign-in from the footer', async () => {
    await renderScreen(<CreateAccountScreen />)

    await userEvent.press(screen.getByRole('link', { name: COPY.footerLink }))

    expect(mockPush).toHaveBeenCalledWith('/(auth)/sign-in')
  })
})
