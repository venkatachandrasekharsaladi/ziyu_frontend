/**
 * THE AUTH BOUNDARY.
 *
 * No provider is chosen in any planning doc and no server exists yet, so the
 * screens talk to this interface and a mock implements it. Swapping in a real
 * provider is a change to `index.ts` and nothing else.
 */
/**
 * The canonical error codes, verbatim from the contract's `ERROR_CODES.md`,
 * plus the two conditions no server can report.
 *
 * An array rather than a bare union so exhaustiveness can be checked at runtime
 * as well as by the compiler — `copy/errors.ts` iterates it.
 *
 * `ERROR_CODES.md` says "do not create new codes ad hoc". `NETWORK` and
 * `UNKNOWN` are not new *server* codes: they describe a request that never got
 * an answer, and an answer nobody anticipated.
 */
export const AUTH_ERROR_CODES = [
  'INVALID_REQUEST',
  'INVALID_EMAIL',
  'INVALID_PROVIDER_TOKEN',
  'INVALID_CREDENTIALS',
  'TOKEN_INVALID',
  'TOKEN_EXPIRED',
  'EMAIL_NOT_VERIFIED',
  'EMAIL_ALREADY_EXISTS',
  'EMAIL_ALREADY_VERIFIED',
  'ACCOUNT_CONFLICT',
  'WEAK_PASSWORD',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'NETWORK',
  'UNKNOWN',
] as const

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]

/**
 * A code, never a raw string. A screen maps a code to its own copy rather than
 * displaying whatever a server happened to say.
 */
export type AuthError = {
  code: AuthErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AuthError }

export type Session = {
  userId: string
  email: string
  emailVerified: boolean
}

export type Credentials = {
  email: string
  password: string
}

export type EmailOnly = {
  email: string
}

export type ResetPassword = {
  /** Opaque, single-use, delivered by email. Never returned by any endpoint. */
  token: string
  newPassword: string
}

export type AuthService = {
  signIn: (input: Credentials) => Promise<Result<Session>>
  signUp: (input: Credentials) => Promise<Result<Session>>
  /** Always resolves ok for a valid address — see the enumeration note in `mock.ts`. */
  requestPasswordReset: (input: EmailOnly) => Promise<Result<null>>
  /**
   * Consumes a reset token and sets a new password. Returns no session: the
   * contract revokes existing refresh sessions on reset, so the user must sign
   * in again afterwards.
   */
  resetPassword: (input: ResetPassword) => Promise<Result<null>>
  resendVerification: (input: EmailOnly) => Promise<Result<null>>
}
