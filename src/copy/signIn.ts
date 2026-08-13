import { BRAND } from '@/config/brand'

/**
 * Copy for M00-S02 Sign In.
 *
 * `BRAND.name` is interpolated, never typed — the rule in `config/brand.ts`.
 */
export const SIGN_IN_COPY = {
  heading: 'Welcome back',
  lede: 'Your memories are waiting.',
  emailLabel: 'Email address',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  forgotLink: 'Forgot password?',
  submit: 'Sign In',
  dividerLabel: 'Or continue with',
  footerText: `New to ${BRAND.name}?`,
  footerLink: 'Create an account',
  errors: {
    INVALID_CREDENTIALS: 'That email and password do not match. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
