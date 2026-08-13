/** Copy for M00-S05 Forgot Password. */
export const FORGOT_PASSWORD_COPY = {
  heading: "Let's get you back in.",
  lede: "Enter your email and we'll send you a secure reset link.",
  emailLabel: 'Email address',
  emailPlaceholder: 'hello@loveos.app',
  submit: 'Send Reset Link',
  backToSignIn: 'Back to Sign In',

  sentHeading: 'Check your email',
  /**
   * Deliberately does NOT confirm whether the address has an account.
   * Confirming it would be account enumeration.
   */
  sentLede: (email: string) => `If ${email} has an account, a reset link is on its way.`,
  resend: 'Resend',

  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
