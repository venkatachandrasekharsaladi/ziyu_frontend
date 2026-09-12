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

export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
} as const
