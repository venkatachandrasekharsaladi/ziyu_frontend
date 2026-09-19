import type { SpaceMood } from '@/state/spaceStore'

/**
 * Copy for Space → Space Mood. Figma `3430:2036` "(Refined)" and `3430:389`
 * "(Module 05)" — the two frames say the same five things, so one file.
 *
 * `MOODS` is an ORDERED array, not a map, because the screen draws them in a
 * fixed order and a map would leave that order to `Object.keys`. The `key` on
 * each entry is what `spaceStore` persists and what `theme.colors.moods`
 * resolves to a wash — the three are deliberately the same word.
 */
export const MOODS: readonly { key: SpaceMood; name: string; detail: string }[] = [
  { key: 'lavenderCalm', name: 'Lavender Calm', detail: 'Soft, quiet and familiar' },
  { key: 'warmMorning', name: 'Warm Morning', detail: 'Golden, gentle' },
  { key: 'roseGlow', name: 'Rose Glow', detail: 'Playful, romantic' },
  { key: 'goldenHour', name: 'Golden Hour', detail: 'Warm memories' },
  { key: 'midnightQuiet', name: 'Midnight Quiet', detail: 'Private, intimate' },
] as const

export const SPACE_MOOD_COPY = {
  title: 'What should our space feel like?',
  lede: 'Select a mood to set the tone for your shared memories.',
  save: 'Use This Mood',
  saved: 'Your space mood was set.',
  /** Folded into each card's accessible name so the choice is announced. */
  selected: 'Selected',
} as const
