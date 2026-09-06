/**
 * ENVIRONMENT CONFIG — the one place the app reads `process.env`.
 *
 * WHY THIS EXISTS: before this file there was no `process.env` or
 * `EXPO_PUBLIC_*` read anywhere in `src/` — verified, not assumed. Every
 * service was an in-memory mock, so nothing needed a server address, and a
 * backend integration had no supported way to say where the API lives. Two
 * people wiring that up independently would have invented two conventions.
 *
 * EXPO_PUBLIC_ PREFIX IS MANDATORY. Expo's bundler only inlines variables
 * carrying it; without the prefix the value is `undefined` at runtime and
 * nothing warns you at build time. That also means everything here is PUBLIC —
 * it ships in the app bundle. No secrets, ever. Server-side credentials belong
 * to the API, not to this repo.
 *
 * READ AT MODULE LOAD, deliberately. `process.env.X` must be written out in
 * full for the bundler's static replacement to see it — `process.env[name]`
 * with a computed key is NOT inlined and silently yields `undefined`. That is
 * why the lookups below are literal rather than looped.
 */

/** No trailing slash, so callers can always write `${API_URL}/path`. */
const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? ''
const rawWsUrl = process.env.EXPO_PUBLIC_WS_URL ?? ''

/**
 * True while the app is running entirely on the in-memory mocks — which is the
 * current state of `main`, and the state every test runs in.
 *
 * Checked rather than assumed so a service can decide for itself: a real
 * provider that finds no API URL should say so loudly at its own boundary,
 * not fail with an opaque fetch error three layers up.
 */
export const isMockMode = rawApiUrl.length === 0

/**
 * The API base URL.
 *
 * Empty string when unset — NOT a thrown error. Throwing here would run at
 * module load and take down the whole app (and the test suite) the moment
 * anything imported this file, which is exactly the wrong failure for a repo
 * whose default, committed state is mock-only. A service that genuinely needs
 * a URL should guard on `isMockMode` and fail with a message naming
 * `EXPO_PUBLIC_API_URL`.
 */
export const API_URL = stripTrailingSlash(rawApiUrl)

/** Realtime endpoint. Empty until the server exposes one. */
export const WS_URL = stripTrailingSlash(rawWsUrl)

/**
 * Throws a message that names the missing variable and the file to set it in.
 *
 * Call this from a REAL service implementation's factory, not at module scope
 * — see the note on `API_URL` for why load-time throwing is wrong here.
 */
export function requireApiUrl(): string {
  if (isMockMode) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set it, '
        + 'then restart the dev server — Expo only reads .env at startup.',
    )
  }

  return API_URL
}
