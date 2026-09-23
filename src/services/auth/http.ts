/**
 * AUTH OVER HTTP.
 *
 * Implements `AuthService` exactly — same signatures, same `Result` shape, same
 * error codes — so the swap in `index.ts` is one line and no screen changes.
 *
 * WHY EVERY METHOD IS A `try/catch` RETURNING A `Result`: the transport throws,
 * the interface promises `Result<T>`. This file is the seam where one becomes
 * the other. There is no `throw` reachable from any method below, which is what
 * the screens were written against — an auth screen has no error boundary.
 *
 * TOKENS ARE STORED HERE, NOT ABOVE. `signIn` and `signUp` receive the token
 * pair alongside the user and hand it to the token store before returning. The
 * caller gets a `Session` — exactly what the mock returned — and never learns
 * that tokens exist. That is why swapping the mock for this file does not
 * change a single screen: the extra state is real, but it is invisible.
 */
import { requireApiUrl } from '@/config/env'
import { get, post } from '@/services/http/client'
import { toAuthErrorCode } from '@/services/http/errors'
import { clearTokens, getRefreshToken, setTokens } from '@/services/http/tokens'
import { setCachedSession } from '@/services/auth/session'
import type {
  AuthService,
  Credentials,
  EmailOnly,
  ResetPassword,
  Result,
  Session,
} from '@/services/auth/types'

/** The server's session payload. Wider than `Session` — the rest stays here. */
type SessionResponse = {
  user: { userId: string; email: string; emailVerified: boolean }
  accessToken: string
  refreshToken: string
  expiresIn: number
}

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: toAuthErrorCode(error) },
})

export function createHttpAuthService(): AuthService {
  /**
   * Fails loudly at construction if no server is configured, rather than on the
   * first sign-in attempt three screens later. `requireApiUrl` names the exact
   * variable and the exact file to set it in.
   */
  requireApiUrl()

  async function authenticate(
    path: '/auth/login' | '/auth/signup',
    input: Credentials,
  ): Promise<Result<Session>> {
    try {
      const response = await post<SessionResponse>(path, input)

      await setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
      })

      setCachedSession(response.user)
      return ok(response.user)
    } catch (error) {
      return fail(error)
    }
  }

  return {
    async getCurrentSession(): Promise<Result<Session>> {
      try {
        const response = await get<{ user: Session }>('/auth/me')
        setCachedSession(response.user)
        return ok(response.user)
      } catch (error) {
        return fail(error)
      }
    },

    signIn: (input) => authenticate('/auth/login', input),

    signUp: (input) => authenticate('/auth/signup', input),

    /**
     * The server answers 202 for any well-formed address whether or not an
     * account exists — deliberately, so the endpoint cannot be used to
     * enumerate users. That is exactly what the mock did, and the screen after
     * it says "if that address is registered, check your email".
     */
    async requestPasswordReset(input: EmailOnly): Promise<Result<null>> {
      try {
        await post('/auth/password/forgot', input)
        return ok(null)
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * Returns no session on purpose: a reset revokes every refresh token, so
     * anything we handed back would already be dead. The user signs in again —
     * which is also the only way to prove the new password works.
     */
    async resetPassword(input: ResetPassword): Promise<Result<null>> {
      try {
        await post('/auth/password/reset', input)
        // Whatever was on this device is revoked server-side; do not keep it.
        await clearTokens()
        setCachedSession(null)
        return ok(null)
      } catch (error) {
        return fail(error)
      }
    },

    async resendVerification(input: EmailOnly): Promise<Result<null>> {
      try {
        await post('/auth/verify-email/resend', input)
        return ok(null)
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * Local state is cleared whatever the server says.
     *
     * A revocation that fails must never leave someone apparently signed in on
     * the device in front of them — that is the one outcome a sign-out button
     * may not produce. The server call is best effort, so its failure is
     * swallowed rather than surfaced, and the interface returns `void` because
     * there is nothing left for a screen to branch on.
     */
    async signOut(): Promise<void> {
      const refreshToken = getRefreshToken()
      try {
        if (refreshToken) await post('/auth/logout', { refreshToken })
      } catch {
        // Intentionally ignored — see above.
      } finally {
        await clearTokens()
        setCachedSession(null)
      }
    },
  }
}
