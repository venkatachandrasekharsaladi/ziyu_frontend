import type { BooleanPreferenceKey } from '@/state/preferencesStore'

/**
 * Copy for Space → LoveOS Assistant. Figma `3430:2279` "(Refined)" and
 * `3430:848` "(Module 05)".
 *
 * Three standing permissions, each phrased as something the assistant MAY do
 * rather than something it will. The frame's wording is kept exactly — a
 * feature that watches your relationship and offers suggestions is the one
 * place where a friendlier paraphrase would be a way of being less clear about
 * what was agreed to.
 */
export const ASSISTANT_TOGGLES: readonly {
  key: BooleanPreferenceKey
  label: string
  detail: string
}[] = [
  {
    key: 'assistantDateNightIdeas',
    label: 'Date Night Ideas',
    detail: 'Suggestions based on your shared interests.',
  },
  {
    key: 'assistantMemorySuggestions',
    label: 'Memory Suggestions',
    detail: 'Gentle reminders of past moments.',
  },
  {
    key: 'assistantAnniversaryIdeas',
    label: 'Anniversary Ideas',
    detail: 'Proactive planning for important dates.',
  },
] as const

export const SPACE_ASSISTANT_COPY = {
  title: 'Your LoveOS assistant.',
  lede: 'Here to gently notice, remember and help.',

  groupTitle: 'Assistant Preferences',
  save: 'Save Preferences',
  saved: 'Your assistant preferences were saved.',

  /** The orb is decorative; this is what a screen reader is told instead. */
  orbLabel: 'The LoveOS assistant',

  /**
   * The way into Assistant Preferences. NOT ON THE BOARD — no frame draws a
   * link to that screen, and without one it is unreachable. Same reasoning as
   * `SPACE_MORE_LINKS`.
   */
  moreTitle: 'Voice & frequency',
  moreDetail: 'How it speaks, and how often it chimes in',
} as const
