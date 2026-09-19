import type { CardStyle, MemoryStyle } from '@/state/spaceStore'

/**
 * Copy for Space → Personalize Our Space. Figma `3430:1714` "(Refined)" and
 * `3430:684` "(Module 05)".
 *
 * INVENTED, and flagged: the frame draws the Memory Style card as a SINGLE
 * polaroid preview labelled "Classic Polaroid" — one sample, no picker, and no
 * second option anywhere on the board. A card headed "Frame your moments" that
 * offers one frame is not a choice, so two siblings were added to make it one.
 * Their names are ours, not the designer's. If the real set differs, this array
 * is the only place to change.
 *
 * The card styles ARE the designer's: the frame draws all three, stacked, with
 * "Textured Paper" selected.
 */
export const MEMORY_STYLES: readonly { key: MemoryStyle; name: string }[] = [
  { key: 'polaroid', name: 'Classic Polaroid' },
  { key: 'filmstrip', name: 'Filmstrip' },
  { key: 'clean', name: 'Clean Frame' },
] as const

export const CARD_STYLES: readonly { key: CardStyle; name: string }[] = [
  { key: 'paper', name: 'Textured Paper' },
  { key: 'glass', name: 'Frosted Glass' },
  { key: 'flat', name: 'Clean & Flat' },
] as const

export const SPACE_PERSONALIZE_COPY = {
  title: 'Make it feel like you.',
  lede: 'Design the private room that makes LoveOS yours.',

  moodTitle: 'Space Mood',
  moodDetail: 'Set the atmosphere.',

  memoryTitle: 'Memory Style',
  memoryDetail: 'Frame your moments.',

  cardTitle: 'Card Style',
  cardDetail: 'The texture of your shared space.',
  /** Drawn inside every card-style sample, as the frame does. */
  sampleNote: 'Sample Note',

  save: 'Save Our Room',
  saved: 'Your room was saved.',
  selected: 'Selected',
} as const
