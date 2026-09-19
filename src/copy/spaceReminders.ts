/**
 * Copy for Space → Gentle Reminders. Figma `3430:2209` "(Refined)" and
 * `3430:602` "(Module 05)".
 *
 * The frame is drawn with a worked example — a 3rd anniversary 18 days away,
 * two named birthdays, one abandoned draft about a coastal drive. NONE of that
 * is hard-coded here. Every figure comes from `storyStore`, and each card is
 * simply not drawn when the date behind it was never recorded.
 *
 * That is the whole reason this screen has so many empty states: a reminders
 * page that invents a reminder is worse than one that is briefly quiet.
 */
export const SPACE_REMINDERS_COPY = {
  title: 'Let LoveOS remember the little things.',
  lede: 'Only the reminders that feel meaningful.',

  comingUp: 'COMING UP',
  anniversary: 'Anniversary',
  anniversaryBody: (years: number) =>
    `Your ${ordinal(years)} year together is just around the corner. Something worth planning together.`,
  anniversaryBodyPlain: 'Your next anniversary is just around the corner.',
  daysAway: 'DAYS AWAY',
  today: 'TODAY',
  plan: 'Plan Something',

  birthdays: 'Birthdays',
  yourBirthday: 'You',

  unfinished: 'Unfinished Memories',
  unfinishedBody: 'Drafts you started and have not come back to yet.',
  /** Drawn when there is nothing waiting — which, at the moment, is always. */
  unfinishedEmpty: 'Nothing half-written. Everything you started, you finished.',

  /**
   * Shown instead of the whole page when the pair have recorded no dates at
   * all. The frame has no such state; without it this screen is blank.
   */
  emptyTitle: 'Nothing to remember yet.',
  emptyBody: 'Add the dates that matter and they will show up here.',
  addDates: 'Add our dates',
} as const

/** `3` -> `3rd`. Only ever called with a year count. */
function ordinal(n: number): string {
  const rem100 = n % 100
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`

  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}
