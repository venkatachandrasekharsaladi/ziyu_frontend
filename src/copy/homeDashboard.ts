/**
 * Copy for M02-S01 Home Dashboard. Stitch screen df11563d.
 *
 * The design shows sample content — "1,248 Days Together", a Paris trip, a
 * birthday 45 days out. None of it is rendered as drawn: every number here is
 * computed from what the couple actually entered, and where they entered
 * nothing the screen says so rather than showing a plausible invention.
 */
export const HOME_DASHBOARD_COPY = {
  daysTogether: 'Days Together',
  daysUnknown: '—',
  daysUnknownHint: 'Add the day you met to start counting.',

  quickActionsLabel: 'Quick actions',
  quickActions: [
    { key: 'memory' as const, label: 'Add Memory', icon: 'plus-circle' as const },
    { key: 'places' as const, label: 'Our Places', icon: 'map-pin' as const },
    { key: 'list' as const, label: 'Shared List', icon: 'check-square' as const },
  ],

  upcomingLabel: 'Upcoming',
  upcomingEmpty: 'No dates saved yet.',
  inDays: (days: number) => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`),

  dates: {
    anniversary: 'Anniversary',
    yourBirthday: 'Your Birthday',
    partnerBirthday: "Partner's Birthday",
    firstDate: 'First Date',
    firstMeeting: 'First Meeting',
  },

  tabs: [
    { key: 'home' as const, label: 'Home', icon: 'home' as const, live: true },
    { key: 'memories' as const, label: 'Memories', icon: 'book-open' as const, live: false },
    { key: 'chat' as const, label: 'Chat', icon: 'message-circle' as const, live: false },
    { key: 'story' as const, label: 'Story', icon: 'feather' as const, live: false },
  ],
} as const
