/**
 * PERSISTENT KEY–VALUE STORAGE — a seam, not an implementation.
 *
 * WHY NOT `expo-secure-store` DIRECTLY: it is not a dependency of this repo,
 * and adding one is a decision for whoever ships the build, not for the
 * transport layer. Hard-coding it would also break the test suite and the web
 * target, neither of which has a keychain.
 *
 * So this file defines the *contract* and ships an in-memory default. The app
 * calls `setStorageAdapter` once at startup with the real thing; everything
 * else — including the token store — depends only on the interface and is
 * unaware of which backend it got.
 *
 * SECURITY, PLAINLY. The in-memory default is not persistence: a refresh token
 * held here dies with the process, so a user is signed out on every cold start.
 * That is the correct failure mode for a default. It is *not* acceptable in
 * production, where the adapter must be backed by the platform keychain
 * (`expo-secure-store`), never `AsyncStorage` — that is unencrypted, world-
 * readable on a rooted device, and a refresh token is a 30-day credential.
 *
 * See `ziyu_backend/docs/INTEGRATION.md` for the four-line wiring.
 */

export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

function createMemoryAdapter(): StorageAdapter {
  const map = new Map<string, string>()
  return {
    async getItem(key) {
      return map.get(key) ?? null
    },
    async setItem(key, value) {
      map.set(key, value)
    },
    async removeItem(key) {
      map.delete(key)
    },
  }
}

let adapter: StorageAdapter = createMemoryAdapter()

/**
 * Swap the backend. Call once, before the first authenticated request.
 *
 * Deliberately synchronous and global rather than injected through every
 * constructor: there is exactly one keychain per app, and threading it through
 * five service factories would be ceremony with no extra safety.
 */
export function setStorageAdapter(next: StorageAdapter): void {
  adapter = next
}

export const storage: StorageAdapter = {
  getItem: (key) => adapter.getItem(key),
  setItem: (key, value) => adapter.setItem(key, value),
  removeItem: (key) => adapter.removeItem(key),
}
