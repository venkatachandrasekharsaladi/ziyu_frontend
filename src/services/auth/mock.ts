import type {
  AuthErrorCode,
  AuthService,
  Credentials,
  EmailOnly,
  Result,
  Session,
} from '@/services/auth/types'

/**
 * Reserved addresses, so every error path is reachable by hand on a device and
 * deterministically in tests.
 */
const RESERVED: Record<string, AuthErrorCode> = {
  'wrong@example.com': 'INVALID_CREDENTIALS',
  'taken@example.com': 'EMAIL_TAKEN',
  'offline@example.com': 'NETWORK',
  'broken@example.com': 'UNKNOWN',
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
  return {
    async signIn({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]

      if (reserved === 'INVALID_CREDENTIALS' || reserved === 'NETWORK' || reserved === 'UNKNOWN') {
        return fail(reserved)
      }

      // `emailVerified` is returned but unused by the screens today: M00-S02
      // cannot branch on it because `(app)` has no routes yet. See spec §10.
      return { ok: true, value: session(email, false) }
    },

    async signUp({ email }: Credentials) {
      await wait(latencyMs)

      const reserved = RESERVED[email.toLowerCase()]

      if (reserved) {
        // A wrong-credentials code is meaningless on sign up.
        return fail(reserved === 'INVALID_CREDENTIALS' ? 'UNKNOWN' : reserved)
      }

      return { ok: true, value: session(email, false) }
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

    async resendVerification({ email }: EmailOnly) {
      await wait(latencyMs)

      if (RESERVED[email.toLowerCase()] === 'NETWORK') {
        return fail('NETWORK')
      }

      return { ok: true, value: null }
    },
  }
}
