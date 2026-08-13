import { BRAND } from '@/config/brand'

/**
 * Copy for M00-S03 Create Account.
 *
 * `BRAND.name` is interpolated, never typed — the rule in `config/brand.ts`.
 */
export const CREATE_ACCOUNT_COPY = {
  /** Figma typesets the heading across two lines. */
  headingLines: ["Let's make this", 'official.'],
  lede: `Create your private ${BRAND.name} account.`,
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Create a password',
  requirementsTitle: 'Password security',
  submit: 'Create Account',
  dividerLabel: 'Or continue with',
  footerText: 'Already have an account?',
  footerLink: 'Sign In',
  errors: {
    EMAIL_TAKEN: 'That email already has an account. Sign in instead.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
