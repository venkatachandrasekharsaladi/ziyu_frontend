/**
 * Copy for the two album screens — Figma `Ziyu`, Memories Page frames 2 and 3.
 *
 * Both were designed and neither existed in code: "Your albums" was reachable
 * from a "VIEW ALL" the Memories home never had, and "Album Detail" had no
 * route at all.
 */
export const ALBUMS_COPY = {
  list: {
    eyebrow: 'Chandu & Sweatcha',
    heading: 'Your albums',
    /** Under each cover: "86 memories". */
    count: (n: number) => (n === 1 ? '1 memory' : `${n} memories`),
    empty: 'Your albums fill up as you tag memories.',
  },
  detail: {
    /** Hero subtitle: "32 memories · Chandu & Sweatcha". */
    subtitle: (n: number, couple: string) =>
      `${n === 1 ? '1 memory' : `${n} memories`} · ${couple}`,
    empty: 'Nothing in this album yet.',
    back: 'Back to albums',
    more: 'Album options',
    missing: 'That album could not be found.',
  },
} as const
