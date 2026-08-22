/**
 * Copy for M02-S01 Home Dashboard. Figma `Ziyu`, the three dashboard variants,
 * plus the "List of Feature on Home Screen" note pinned beside them (Calendar,
 * Notes, Random Memory Pop-ups, Anniversary countdown, Days Together, Birthday
 * Cards, pinned events).
 *
 * The design's numbers — "1,395 beautiful days together", 8 trips, 42 places —
 * are sample content. The screen computes from the story store wherever it
 * holds a value and falls back to `src/sample/home.ts` only where it is empty,
 * so nothing invented survives a couple entering their real dates.
 *
 * `quickActions` was removed: it appeared in no frame, and two of its three
 * buttons ("Our Places", "Shared List") pointed at features that do not exist.
 */
export const HOME_DASHBOARD_COPY = {
  /** Time-of-day greeting, as the first dashboard variant draws it. */
  greeting: (name: string, hour: number) => {
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    return `${part}, ${name}`
  },
  daysTogetherLine: (days: number) =>
    days === 1 ? '1 beautiful day together.' : `${days.toLocaleString()} beautiful days together.`,

  daysTogether: 'Days Together',
  daysUnknown: '—',
  daysUnknownHint: 'Add the day you met to start counting.',

  /** "A memory worth keeping" — the featured memory card. */
  featuredLabel: 'A memory worth keeping',
  featuredOpen: 'Open Memory',
  featuredFavorite: 'Favorite',

  /** "Your little world" — the stat tiles. Annotated `←need this section`. */
  littleWorldLabel: 'Your little world',

  /** "Coming up" — the countdown rows. Annotated `←need this section`. */
  comingUpLabel: 'Coming up',
  comingUpEmpty: 'No dates saved yet.',
  inDays: (days: number) => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`),
  daysShort: (days: number) => (days === 1 ? '1 day' : `${days} days`),

  /** "Little things" — pinned reminders. Annotated `need this`. */
  littleThingsLabel: 'Little things',

  /** "Upcoming" — the event list from the third variant. */
  upcomingLabel: 'Upcoming',
  upcomingEmpty: 'No dates saved yet.',

  /**
   * The two empty-state cards, which are where the feature note's Calendar and
   * Notes items actually surface.
   */
  emptyCalendar: {
    heading: 'Nothing on the calendar yet',
    lede: 'Plan your first date or mark an anniversary.',
    action: 'Add an Important Date',
  },
  emptyNote: {
    heading: 'Leave a little note',
    lede: 'Write something sweet for them to wake up to.',
    action: 'Write a Note',
  },
  emptyTimeline: 'Your timeline is waiting to be filled with beautiful moments.',

  dates: {
    anniversary: 'Anniversary',
    yourBirthday: 'Your Birthday',
    partnerBirthday: "Partner's Birthday",
    firstDate: 'First Date',
    firstMeeting: 'First Meeting',
  },
} as const
