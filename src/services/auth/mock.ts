import type {
  AuthErrorCode,
  AuthService,
  Credentials,
  EmailOnly,
  ResetPassword,
  Result,
  Session,
} from '@/services/auth/types'
import { setCachedSession } from '@/services/auth/session'

/**
 * Reserved addresses, so every error path is reachable by hand on a device and
 * deterministically in tests.
 */
const RESERVED: Record<string, AuthErrorCode> = {
  'wrong@example.com': 'INVALID_CREDENTIALS',
  'taken@example.com': 'EMAIL_ALREADY_EXISTS',
  'offline@example.com': 'NETWORK',
  'broken@example.com': 'UNKNOWN',
}

/**
 * Reserved reset tokens, so every documented failure of
 * `POST /auth/password/reset` is reachable by hand on a device.
 *
 * Real tokens are opaque and arrive by email; these stand in for them until a
 * server issues any.
 */
export const RESERVED_RESET_TOKENS = {
  valid: 'valid-reset-token',
  expired: 'expired-reset-token',
  used: 'used-reset-token',
  offline: 'offline-reset-token',
} as const

/**
 * The contract's password policy, from `schemas/VALIDATION.md`.
 *
 * Deliberately duplicated rather than imported from `module-00-auth`: this
 * stands in for the server, and a server that reused the client's validation
 * would not be validating anything. The client checking first is a courtesy;
 * this is the check that counts.
 */
function isPasswordAcceptable(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  )
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function fail(code: AuthErrorCode): Result<never> {
  return { ok: false, error: { code } }
}

function session(email: string, emailVerified: boolean): Session {
  return { userId: `mock-${email}`, email, emailVerified }
}

type MockOptions = {
  /** Default is deliberately slow enough that loading states are visible. */
  latencyMs?: number
}

/**
 * In-memory `AuthService`.
 *
 * Nothing persists: there is no real token to store until a provider exists,
 * which is why `expo-secure-store` is not installed yet either.
 */
export function createMockAuthService({ latencyMs = 600 }: MockOptions = {}): AuthService {
  let current: Session | null = null
  return {
    async getCurrentSession() {
      await wait(latencyMs)
      return current ? { ok: true, value: current } : fail('TOKEN_INVALID')
    },

    async signIn({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]

      if (reserved === 'INVALID_CREDENTIALS' || reserved === 'NETWORK' || reserved === 'UNKNOWN') {
        return fail(reserved)
      }

      // `emailVerified` is returned but unused by the screens today: M00-S02
      // cannot branch on it because `(app)` has no routes yet. See spec §10.
      current = session(email, false)
      setCachedSession(current)
      return { ok: true, value: current }
    },

    async signUp({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]

      if (reserved) {
        // A wrong-credentials code is meaningless on sign up.
        return fail(reserved === 'INVALID_CREDENTIALS' ? 'UNKNOWN' : reserved)
      }

      current = session(email, false)
      setCachedSession(current)
      return { ok: true, value: current }
    },

    async requestPasswordReset({ email }: EmailOnly) {
      await wait(latencyMs)

      if (RESERVED[email.toLowerCase()] === 'NETWORK') {
        return fail('NETWORK')
      }

      // Deliberately ok for unknown addresses. Confirming which addresses have
      // accounts is account enumeration. Recorded so it is not later "fixed"
      // into a leak.
      return { ok: true, value: null }
    },

    async resetPassword({ token, newPassword }: ResetPassword) {
      await wait(latencyMs)

      // A missing token is a malformed request, not a rejected credential. The
      // contract separates 400 from 401 and so does the copy the user sees.
      if (!token.trim()) return fail('INVALID_REQUEST')

      if (token === RESERVED_RESET_TOKENS.offline) return fail('NETWORK')
      if (token === RESERVED_RESET_TOKENS.expired) return fail('TOKEN_EXPIRED')
      // A consumed token is reported as invalid, not expired — the contract
      // test cases are explicit, and telling an attacker which tokens once
      // existed is a small leak worth not having.
      if (token === RESERVED_RESET_TOKENS.used) return fail('TOKEN_INVALID')
      if (token !== RESERVED_RESET_TOKENS.valid) return fail('TOKEN_INVALID')

      // Checked after the token so a bad password cannot be used to probe which
      // tokens are live.
      if (!isPasswordAcceptable(newPassword)) return fail('WEAK_PASSWORD')

      current = null
      setCachedSession(null)
      return { ok: true, value: null }
    },

    async signOut() {
      await wait(latencyMs)
      current = null
      setCachedSession(null)

      // Nothing to tear down yet: there is no token storage and no session
      // store until the HTTP client lands. When it does, this clears the
      // keychain and calls `POST /auth/logout`, in that order, and still
      // resolves if the call fails.
    },

    async resendVerification({ email }: EmailOnly) {
      await wait(latencyMs)

      if (RESERVED[email.toLowerCase()] === 'NETWORK') {
        return fail('NETWORK')
      }

      return { ok: true, value: null }
    },
  }
}
