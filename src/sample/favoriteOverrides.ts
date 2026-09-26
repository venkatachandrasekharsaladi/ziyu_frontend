import { create } from 'zustand'

/**
 * UI-ONLY OVERRIDE LAYER for a SAMPLE memory's `favorite` flag.
 *
 * `SAMPLE_MEMORIES` never gets a real record in `memoriesService` — that mock
 * store seeds empty on purpose (see its own header) — so `toggleFavorite`
 * always answers `NOT_FOUND` for a sample id. Every screen that shows or
 * flips a sample memory's favourite status reads and writes through here
 * instead of keeping its own private copy of the flag, the way
 * `MemoryDetailScreen` and `HomeDashboardScreen` used to: favouriting a memory
 * on Home's featured card never showed up on the Favourites screen, the
 * Favourites album or "On this day", because each screen's override lived
 * only in that screen's own component state.
 *
 * Deleted together with the rest of `src/sample/` when a real backend lands —
 * every caller already prefers the real `favorite` flag `memoriesService`
 * returns and only falls back to this map on a `NOT_FOUND` for a sample id.
 */
type FavoriteOverridesState = {
  overrides: Record<string, boolean>
  setOverride: (id: string, favorite: boolean) => void
}

export const useSampleFavoriteOverrides = create<FavoriteOverridesState>((set) => ({
  overrides: {},
  setOverride: (id, favorite) =>
    set((state) => ({ overrides: { ...state.overrides, [id]: favorite } })),
}))

/** Applies any override on top of a list's own `favorite` flags. */
export function applyFavoriteOverrides<T extends { id: string; favorite: boolean }>(
  memories: T[],
  overrides: Record<string, boolean>,
): T[] {
  return memories.map((m) => (m.id in overrides ? { ...m, favorite: overrides[m.id] } : m))
}
