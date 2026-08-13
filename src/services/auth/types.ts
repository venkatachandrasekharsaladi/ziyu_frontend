/**
 * THE AUTH BOUNDARY.
 *
 * No provider is chosen in any planning doc and no server exists yet, so the
 * screens talk to this interface and a mock implements it. Swapping in a real
 * provider is a change to `index.ts` and nothing else.
 */
export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_TAKEN' | 'NETWORK' | 'UNKNOWN'

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

export type AuthService = {
  signIn: (input: Credentials) => Promise<Result<Session>>
  signUp: (input: Credentials) => Promise<Result<Session>>
  /** Always resolves ok for a valid address — see the enumeration note in `mock.ts`. */
  requestPasswordReset: (input: EmailOnly) => Promise<Result<null>>
  resendVerification: (input: EmailOnly) => Promise<Result<null>>
}
