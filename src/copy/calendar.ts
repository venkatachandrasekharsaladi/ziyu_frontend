/**
 * Copy for the calendar screen — reached from a "Little things" reminder, and
 * from "Add an Important Date" on the dashboard's empty state.
 *
 * NO FIGMA FRAME EXISTS. The pinned note in the Figma file lists "Calendar",
 * "Notes" and "Any other events they wish to pin" as home-screen features, so
 * this screen realises that note using the app's existing components.
 */
export const CALENDAR_COPY = {
  title: 'Our calendar',
  eyebrow: 'Chandu & Sarah',
  weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  monthLabel: (month: string, year: number) => `${month} ${year}`,
  prev: 'Previous month',
  next: 'Next month',
  agendaLabel: 'This month',
  agendaEmpty: 'Nothing on the calendar this month.',
  remindersLabel: 'Little things',
  remindersEmpty: 'No reminders pinned yet.',
  addDate: 'Add an Important Date',
  writeNote: 'Write a Note',
  today: 'Today',
  back: 'Back home',
} as const
