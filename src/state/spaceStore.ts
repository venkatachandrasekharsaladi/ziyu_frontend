import { create } from 'zustand'

import type { SpaceStatus } from '@/services/pairing/types'

export type CoverStyle = 'dawn' | 'dusk' | 'night'

/**
 * The five atmospheres from the Space Mood frame (`3430:2036`). The keys match
 * `theme.colors.moods` exactly — that is what makes a stored mood resolve to a
 * wash, and a rename on one side fails to compile on the other.
 */
export type SpaceMood =
  | 'lavenderCalm'
  | 'warmMorning'
  | 'roseGlow'
  | 'goldenHour'
  | 'midnightQuiet'

/** How a memory is framed. Figma `3430:1746`, "Memory Style". */
export type MemoryStyle = 'polaroid' | 'filmstrip' | 'clean'

/** The texture of a note card. Figma `3430:1764`, "Card Style". */
export type CardStyle = 'paper' | 'glass' | 'flat'

export type SpaceState = {
  /** How the couple's shared space is named. */
  name: string | null
  shortName: string | null
  coverStyle: CoverStyle

  /** How it FEELS — the three answers Personalize Our Space asks for. */
  mood: SpaceMood
  memoryStyle: MemoryStyle
  cardStyle: CardStyle

  /**
   * True once the pair have dismissed the "your little world is waiting"
   * prompt. Figma `3430:1503` draws that screen with a "Maybe Later", and
   * without somewhere to record the tap the prompt would return on the next
   * visit and the button would be decoration.
   */
  personalizePromptDismissed: boolean

  setSpace: (input: { name: string; shortName?: string; coverStyle: CoverStyle }) => void
    syncWithServer: (space: SpaceStatus) => void
  dismissPersonalizePrompt: () => void
  setMood: (mood: SpaceMood) => void
  setRoom: (input: { mood: SpaceMood; memoryStyle: MemoryStyle; cardStyle: CardStyle }) => void
  reset: () => void
}

const DEFAULTS = {
  name: null,
  shortName: null,
  coverStyle: 'dawn' as CoverStyle,
  mood: 'lavenderCalm' as SpaceMood,
  memoryStyle: 'polaroid' as MemoryStyle,
  cardStyle: 'paper' as CardStyle,
  personalizePromptDismissed: false,
}

/**
 * The shared space's own identity — what it is called and how it feels.
 *
 * Kept apart from `relationshipStore`, which holds who the couple ARE. This
 * holds what they called the thing they share, which is a different question
 * and is edited from a different screen.
 *
 * `setMood` exists BESIDE `setRoom` rather than being folded into it. Space
 * Mood (`3430:2036`) is a whole screen that changes exactly one of these three
 * and then leaves; making it call `setRoom` would mean handing back the other
 * two unchanged, which is how a screen quietly overwrites a value it never
 * showed the user.
 */
export const useSpaceStore = create<SpaceState>((set) => ({
  ...DEFAULTS,

  setSpace: ({ name, shortName, coverStyle }) =>
    set({ name, shortName: shortName?.trim() || null, coverStyle }),

  syncWithServer: ({ name, shortName, coverStyle }) =>
    set({ name: name ?? null, shortName: shortName ?? null, coverStyle }),

  dismissPersonalizePrompt: () => set({ personalizePromptDismissed: true }),

  setMood: (mood) => set({ mood }),

  setRoom: ({ mood, memoryStyle, cardStyle }) => set({ mood, memoryStyle, cardStyle }),

  reset: () => set({ ...DEFAULTS }),
}))
