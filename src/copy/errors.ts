import type { AuthErrorCode } from '@/services/auth/types'

/**
 * One message per error code, for the whole auth module.
 *
 * The contract publishes sixteen codes the client can surface. Screens index
 * their copy by code, so without a shared map every one of those keys would
 * have to appear in every screen's copy file — six near-identical records that
 * drift the moment one is edited. Here the compiler enforces completeness in
 * exactly one place.
 *
 * A screen that needs different wording supplies an override rather than a full
 * record. See `authErrorMessage`.
 *
 * These are the DEFAULTS. Where a code means two different things depending on
 * where it surfaces, the more general meaning lives here and the specific one is
 * an override — see `TOKEN_INVALID` below.
 */
export const AUTH_ERROR_COPY: Record<AuthErrorCode, string> = {
  INVALID_REQUEST: 'Something went wrong. Try again.',
  INVALID_EMAIL: 'Enter a valid email address.',
  INVALID_PROVIDER_TOKEN: "That sign-in didn't work. Try again.",

  /**
   * The contract's primary meaning is an email/password failure, so that is the
   * default. The OAuth screens, which see this code when a provider rejects a
   * token, override it.
   */
  INVALID_CREDENTIALS: 'That email and password do not match. Try again.',

  /**
   * The general case: a session that has ended. Verify-email and reset-password
   * override both of these, because there the token is a link the user followed
   * rather than the session they are holding.
   */
  TOKEN_INVALID: 'Your session has ended. Please sign in again.',
  TOKEN_EXPIRED: 'Your session has ended. Please sign in again.',

  EMAIL_NOT_VERIFIED: 'Verify your email address before signing in.',

  /** Signup only, per `ERROR_CODES.md`. */
  EMAIL_ALREADY_EXISTS: 'That email already has an account. Sign in instead.',

  /** Verification only, per `ERROR_CODES.md`. */
  EMAIL_ALREADY_VERIFIED: "You're already verified. You can sign in.",

  ACCOUNT_CONFLICT: 'That account is already linked to a different sign-in method.',
  WEAK_PASSWORD: 'That password is too easy to guess. Try a longer one.',
  VALIDATION_ERROR: 'Check the details you entered and try again.',

  /**
   * Deliberately does not say how long to wait. The contract sends `Retry-After`
   * only "when possible", and a message promising a number the client may not
   * have is worse than one that does not.
   */
  RATE_LIMITED: 'Too many attempts. Wait a moment and try again.',

  INTERNAL_ERROR: 'Something went wrong on our end. Try again.',
  NETWORK: 'No connection. Check your network and try again.',
  UNKNOWN: 'Something went wrong. Try again.',
}

/**
 * Resolves the message a screen should show for an error code.
 *
 * Pass a screen's own `errors` record to override the defaults for the codes
 * where that screen means something more specific. Everything else falls
 * through, so a screen never carries copy it does not actually differ on.
 */
export function authErrorMessage(
  code: AuthErrorCode,
  overrides?: Partial<Record<AuthErrorCode, string>>,
): string {
  return overrides?.[code] ?? AUTH_ERROR_COPY[code]
}
