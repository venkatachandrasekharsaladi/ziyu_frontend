/**
 * Copy for M01-S18 Our Story Recap. Stitch screen 230c258d.
 *
 * The one screen that only shows. It is also the commit point: everything the
 * previous five screens collected is sent here, so the user sees the whole
 * story before any of it is saved.
 */
export const STORY_RECAP_COPY = {
  heading: 'Our Story',
  lede: (date: string) => `It all started on ${date}.`,
  ledeUndated: 'Here is what you have told us so far.',
  closing: 'And this is only the beginning.',
  emptyTitle: 'Your story is still blank.',
  emptyBody: 'Nothing was added, and that is fine — you can fill it in any time.',
  rows: {
    met: 'First Met',
    firstDate: 'First Date',
    becameUs: 'Became Us',
    firstMemory: 'First Memory',
  },
  submit: 'Make It Ours',
  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
