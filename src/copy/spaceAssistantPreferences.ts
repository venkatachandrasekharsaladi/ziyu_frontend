import type {
  AssistantFrequency,
  AssistantTone,
  BooleanPreferenceKey,
} from '@/state/preferencesStore'

/**
 * Copy for Space → Assistant Preferences. Figma `3430:1276`.
 *
 * The deeper sibling of `spaceAssistant.ts`. That frame offers three standing
 * permissions and a save; this one offers its own three, plus the assistant's
 * VOICE and how often it speaks. Both exist on the board, so both exist here.
 *
 * The two suggestion lists overlap without matching — see the note on
 * `assistantMemoryRecaps` in `preferencesStore`. Flagged rather than merged.
 */
export const ASSISTANT_SUGGESTIONS: readonly {
  key: BooleanPreferenceKey
  label: string
  detail: string
}[] = [
  {
    key: 'assistantDateNightIdeas',
    label: 'Date Night Ideas',
    detail: 'Based on past favorites',
  },
  {
    key: 'assistantMemoryRecaps',
    label: 'Memory Recaps',
    detail: 'Weekly "this time last year"',
  },
  {
    key: 'assistantConversationStarters',
    label: 'Conversation Starters',
    detail: 'For quieter moments',
  },
] as const

export const ASSISTANT_TONES: readonly {
  key: AssistantTone
  icon: 'feather' | 'heart' | 'smile' | 'book-open'
  label: string
  detail: string
}[] = [
  {
    key: 'quiet',
    icon: 'feather',
    label: 'Quiet & Minimal',
    detail: 'Just the facts. Short, gentle nudges without the fluff.',
  },
  {
    key: 'warm',
    icon: 'heart',
    label: 'Warm & Affectionate',
    detail: 'Like a close friend. Uses encouraging, soft language.',
  },
  {
    key: 'playful',
    icon: 'smile',
    label: 'Playful & Fun',
    detail: 'Uses emojis, lighthearted jokes, and enthusiastic prompts.',
  },
  {
    key: 'deep',
    icon: 'book-open',
    label: 'Deep & Thoughtful',
    detail: 'Reflective language focusing on emotional growth and connection.',
  },
] as const

export const ASSISTANT_FREQUENCIES: readonly { key: AssistantFrequency; label: string }[] = [
  { key: 'rarely', label: 'Rarely' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'often', label: 'Often' },
] as const

/**
 * What the assistant says it will do, in its own voice, under the frequency
 * control. The frame writes only the "Balanced" line; the other two are ours,
 * written to the same shape so the sentence changes with the setting instead
 * of staying true for one stop out of three.
 */
export const FREQUENCY_PROMISE: Record<AssistantFrequency, string> = {
  rarely: '"I\'ll stay out of the way unless something really matters."',
  balanced: '"I\'ll aim to check in a couple times a week."',
  often: '"I\'ll be around most days, with something small."',
}

export const SPACE_ASSISTANT_PREFERENCES_COPY = {
  barTitle: 'Assistant',
  title: 'Your LoveOS assistant.',
  lede: 'Here to gently remind you of important moments, suggest small acts of kindness, and help you keep your memories organized.',

  suggestTitle: 'What I can suggest',
  toneTitle: 'How I speak to you',
  toneLede: "Choose the personality that best fits your relationship's current vibe.",
  frequencyTitle: 'How often I chime in',

  selected: 'Selected',
} as const
