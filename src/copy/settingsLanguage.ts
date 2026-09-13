import type { LanguageCode } from '@/state/preferencesStore'

/**
 * Copy for Settings → Language & Region.
 *
 * Each language is written in ITS OWN language — "Español", not "Spanish".
 * Someone who has opened this screen because the app is in a language they
 * cannot read needs to find their own in a list they can read.
 *
 * HONEST LIMIT: nothing in the app is translated yet. Choosing a language
 * records the choice; it does not change a single string. `notTranslated` says
 * so on the screen rather than letting someone discover it by tapping.
 *
 * NO RESTART PROMPT, here of all places — a language change is the usual reason
 * an app asks. Settings do not persist (see `state/preferencesStore`), so a
 * restart would discard every choice the user just made.
 */
export const SETTINGS_LANGUAGE_COPY = {
  title: 'Language & Region',
  lede: 'How the app reads and how dates are written.',

  languageGroup: 'Language',
  notTranslated: 'Only English is translated so far. Your choice is remembered for when the rest arrive.',

  /**
   * The mark on the chosen language, and the word that mark announces. The
   * glyph is a user-facing string like any other and belongs here, not typed
   * into the screen; `chosenLabel` exists because "English, ✓" is what a
   * screen reader was left to make of the character.
   */
  chosen: '✓',
  chosenLabel: 'Chosen',

  dateGroup: 'Dates & time',
  dateFormatLabel: 'Date format',
  dmy: '31/12/2026',
  mdy: '12/31/2026',
  ymd: '2026-12-31',

  clockLabel: 'Clock',
  twelveHour: '12-hour',
  twentyFourHour: '24-hour',

  weekStartLabel: 'Week starts on',
  sunday: 'Sunday',
  monday: 'Monday',
} as const

/**
 * The five names, in one place. The settings hub used to keep its own copy of
 * this map to label its Language row; renaming "Español" here would have left
 * the hub saying the old word until somebody noticed. Same rule the hub's
 * `THEME_LABEL` already follows by reading Appearance's copy.
 *
 * Keyed by `LanguageCode`, not by `string`: as `Record<string, string>` a sixth
 * language added to the store would simply return `undefined` here — a row
 * rendering an empty value, at runtime, on a screen nobody was editing. Keyed
 * by the union it fails to compile instead.
 */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
}

/**
 * The order the list renders in. Declared as `LanguageCode[]` so the screen
 * maps over it without casting `Object.keys`, which returns `string[]` and
 * threw away the very union the map above is checked against.
 */
export const LANGUAGE_CODES: LanguageCode[] = ['en', 'es', 'fr', 'de', 'hi']
