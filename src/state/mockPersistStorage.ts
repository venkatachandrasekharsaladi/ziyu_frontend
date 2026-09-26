import { createJSONStorage, type StateStorage } from 'zustand/middleware'

import { isMockMode } from '@/config/env'

/**
 * Backs zustand's `persist` for MOCK-MODE-ONLY dev/testing convenience.
 *
 * Without this, `useSessionStore` and `useRelationshipStore` reset to
 * signed-out on every reload — correct for a client with a real backend and
 * no token yet, but it means testing any signed-in screen means re-typing
 * credentials, and re-entering a partner code, on every single reload.
 *
 * GATED ON `isMockMode`, not just "is this the web build": a real backend's
 * session belongs in `services/http/tokens.ts`, behind `services/storage`
 * (keychain-backed) — see that file's own header for why `localStorage` is
 * wrong for a refresh token. This adapter refuses to read or write anything
 * the moment a real `EXPO_PUBLIC_API_URL` is configured, so persisting the
 * mock session can never be mistaken for that.
 *
 * `localStorage` is web-only. Native falls back to `undefined` here, so a
 * native dev build keeps today's behaviour — signed out on every relaunch —
 * until a real persistence story exists for it.
 */
const mockStorage: StateStorage = {
  getItem: (name) => {
    if (!isMockMode || typeof localStorage === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name, value) => {
    if (!isMockMode || typeof localStorage === 'undefined') return
    localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    if (!isMockMode || typeof localStorage === 'undefined') return
    localStorage.removeItem(name)
  },
}

/** One JSON-backed storage per store, typed to that store's own persisted shape. */
export function createMockPersistStorage<T>() {
  return createJSONStorage<T>(() => mockStorage)
}
