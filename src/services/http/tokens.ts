/**
 * THE TOKEN STORE.
 *
 * TWO TOKENS, TWO LIFETIMES, TWO STORAGE RULES.
 *
 *   accessToken  — 15 minutes, sent on every request, kept in memory only.
 *   refreshToken — 30 days, sent to exactly one endpoint, persisted.
 *
 * The access token is deliberately NOT written to disk. It expires faster than
 * a cold start matters, so persisting it buys nothing and widens the window in
 * which a stolen device yields a live credential. The refresh token has to
 * survive a restart or the user signs in every morning, so it is persisted —
 * which is precisely why `services/storage` must be backed by the keychain in
 * production.
 *
 * WHY AN IN-MEMORY MIRROR AT ALL: `storage` is async, and the request path is
 * hot. Reading the keychain before every fetch would put an IO round-trip in
 * front of every screen. The mirror is loaded once by `hydrate()` and is the
 * source of truth thereafter; disk is only ever written to.
 *
 * The subscriber list exists so a sign-out triggered deep inside the transport
 * — a refresh token that the server has revoked — can reach the app without the
 * transport importing a store and creating a cycle.
 */
import { storage } from '@/services/storage'

const REFRESH_KEY = 'loveos.auth.refreshToken'

export type Tokens = {
  accessToken: string
  refreshToken: string
  /** Absolute epoch ms. Derived from the server's `expiresIn` on receipt. */
  accessExpiresAt: number
}

let tokens: Tokens | null = null
let hydrated = false

type Listener = (tokens: Tokens | null) => void
const listeners = new Set<Listener>()

function notify(): void {
  for (const listener of listeners) listener(tokens)
}

/**
 * Loads the persisted refresh token. Safe to call repeatedly — it runs once.
 *
 * There is no access token afterwards, only a refresh token, so the first
 * request will 401 and the transport will exchange it. That is the intended
 * cold-start path: one extra round trip, no stale credential on disk.
 */
export async function hydrate(): Promise<void> {
  if (hydrated) return
  hydrated = true

  const refreshToken = await storage.getItem(REFRESH_KEY)
  if (!refreshToken) return

  tokens = { accessToken: '', refreshToken, accessExpiresAt: 0 }
  notify()
}

export function getTokens(): Tokens | null {
  return tokens
}

export function getAccessToken(): string | null {
  if (!tokens || !tokens.accessToken) return null
  return tokens.accessToken
}

export function getRefreshToken(): string | null {
  return tokens?.refreshToken ?? null
}

/**
 * True a little *before* the real expiry.
 *
 * The 30-second skew covers clock drift and the flight time of the request
 * itself: a token with two seconds left will be valid when the check runs and
 * expired when it lands, producing an avoidable 401 and retry.
 */
export function isAccessTokenExpired(skewMs = 30_000): boolean {
  if (!tokens || !tokens.accessToken) return true
  return Date.now() + skewMs >= tokens.accessExpiresAt
}

export async function setTokens(input: {
  accessToken: string
  refreshToken: string
  /** Seconds, as the server reports it. */
  expiresIn: number
}): Promise<void> {
  tokens = {
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    accessExpiresAt: Date.now() + input.expiresIn * 1000,
  }
  hydrated = true

  await storage.setItem(REFRESH_KEY, input.refreshToken)
  notify()
}

export async function clearTokens(): Promise<void> {
  tokens = null
  hydrated = true

  await storage.removeItem(REFRESH_KEY)
  notify()
}

/** Returns an unsubscribe function, matching the convention in `chat.subscribe`. */
export function subscribeToTokens(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Test hook. Resets module state so suites do not leak a session into each other. */
export function __resetTokensForTests(): void {
  tokens = null
  hydrated = false
  listeners.clear()
}
