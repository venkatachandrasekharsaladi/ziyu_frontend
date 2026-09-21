/**
 * Copy for M06-S01 Our Plans — the hub. Figma `Tales of Two`, `New Features`,
 * node 3482:3155.
 *
 * The hub is an index, so almost every string here is a LABEL over a number the
 * screen computes from `plansStore`. Where the design prints a figure ("14 of 25
 * stamped", "8 lived / 42 waiting") the number is NOT written down here — it is
 * a function of live state, and hard-coding it would mean stamping a tile left
 * the card saying the old total.
 */
export const PLANS_COPY = {
  eyebrow: 'Our plans · Notebook',
  kicker: 'A notebook for tomorrow',
  title: 'Our plans.',
  lede: "All the things we're going to do together. Some just around the corner, others worth a lifetime.",
  waiting: (count: number) => `${count} waiting for us`,

  /** The pinned trip at the top. */
  nextUp: (days: number) => `Next up · ${days} days away`,
  openItinerary: 'Open itinerary',
  daysPlanned: (days: number) => `${days} days planned`,
  savedSpots: (count: number) => `${count} saved spots`,
  noTrip: {
    heading: 'Nothing booked yet',
    lede: "Pick somewhere and we'll shape the days around the two of you.",
    action: 'Plan something together',
  },

  sectionLabel: 'Chapters & collections',
  sectionCount: (count: number) => `${count} sections active`,

  /** The wide row above the grid. */
  trips: {
    title: 'Trips & Dates',
    lede: 'Plan our next adventure together.',
    chip: (count: number) => `${count} in progress`,
    wishlist: 'Paris, Amalfi & Kyoto wishlist',
  },

  /**
   * The six grid cards. `status` is a function of live state for the reason in
   * the file header; only the fixed words live here.
   */
  cards: {
    year: {
      chip: 'Active Board',
      title: 'Our Year Together',
      lede: (year: number) => `Couple Bingo ${year}`,
      status: (done: number, total: number) => `${done} of ${total} stamped`,
    },
    lifetime: {
      chip: 'Shared Promises',
      title: 'Once in a Lifetime',
      lede: 'Shared lifetime bucketlist',
      status: (lived: number, waiting: number) => `${lived} lived · ${waiting} waiting`,
    },
    capsules: {
      chip: 'Sealed Vault',
      title: 'Time Capsules',
      lede: 'Pieces of today for tomorrow.',
      status: (count: number) =>
        count === 1 ? '1 capsule sealed' : `${count} capsules sealed`,
    },
    letters: {
      chip: 'Envelope Vault',
      title: 'Love Letters',
      lede: 'Words kept until the right time.',
      status: (count: number) =>
        count === 0
          ? 'Nothing waiting'
          : count === 1
            ? '1 letter waiting'
            : `${count} letters waiting`,
    },
    watch: {
      chip: "Tonight's Pick",
      title: 'Watch Together',
      lede: 'Side by side cinema queue.',
      status: (title: string) => `Next: ${title}`,
    },
    places: {
      chip: 'Shared Map',
      title: 'Shared Places',
      lede: "Where we've been & dreamt of.",
      status: (count: number) => `${count} pinned spots`,
    },
  },

  add: 'Add a trip, promise, or date',

  /** The closing quote. Figma sets it centred, in italic, under a small heart. */
  quote: "The best part of the future is knowing who's in it.",
  quoteAttribution: 'Tales of Two · Chapter IV',
} as const
