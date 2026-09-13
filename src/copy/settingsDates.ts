/**
 * Copy for Settings → Dates & Reminders.
 *
 * This screen exists because `copy/calendar.ts` has a reminders section and
 * `copy/occasion.ts` has a countdown, and nothing in the app says how far ahead
 * either one warns you. A week is the default for anniversaries and birthdays
 * because those are the two you have to buy something for.
 */
export const SETTINGS_DATES_COPY = {
  title: 'Dates & Reminders',
  lede: 'How much warning you get before a day that matters.',

  leadGroup: 'How far ahead',
  anniversary: 'Anniversaries',
  birthday: 'Birthdays',
  occasion: 'Other occasions',

  sameDay: 'Same day',
  dayBefore: 'Day before',
  weekBefore: 'Week before',

  datesGroup: 'Your dates',
  manageDates: 'Manage your dates',
  manageDatesDetail: 'Add, rename or remove the days you count.',
} as const
