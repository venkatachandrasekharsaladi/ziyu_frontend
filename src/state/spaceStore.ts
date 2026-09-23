import { create } from 'zustand'

import type { SpaceStatus } from '@/services/pairing/types'

export type CoverStyle = 'dawn' | 'dusk' | 'night'

export type SpaceState = {
  /** How the couple's shared space is named. */
  name: string | null
  shortName: string | null
  coverStyle: CoverStyle
  setSpace: (input: { name: string; shortName?: string; coverStyle: CoverStyle }) => void
  syncWithServer: (space: SpaceStatus) => void
  reset: () => void
}

const DEFAULTS = { name: null, shortName: null, coverStyle: 'dawn' as CoverStyle }

/**
 * The shared space's own identity — its name and cover.
 *
 * Kept apart from `relationshipStore`, which holds who the couple ARE. This
 * holds what they called the thing they share, which is a different question
 * and is edited from a different screen.
 */
export const useSpaceStore = create<SpaceState>((set) => ({
  ...DEFAULTS,

  setSpace: ({ name, shortName, coverStyle }) =>
    set({ name, shortName: shortName?.trim() || null, coverStyle }),

  syncWithServer: ({ name, shortName, coverStyle }) =>
    set({ name: name ?? null, shortName: shortName ?? null, coverStyle }),

  reset: () => set({ ...DEFAULTS }),
}))
