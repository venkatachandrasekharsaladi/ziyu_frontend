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
  // No `errors` record. `EMAIL_ALREADY_EXISTS` is a signup-only code per
  // `ERROR_CODES.md`, so its shared default already says what this screen means.
} as const
