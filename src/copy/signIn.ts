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
  // No `errors` record: every message this screen shows is the shared default in
  // `copy/errors.ts`. A screen only carries copy it actually differs on.
} as const
