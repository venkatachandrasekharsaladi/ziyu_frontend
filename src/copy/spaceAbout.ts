/**
 * Copy for Space → About Our Space. Figma `3430:927`.
 *
 * A stats page, not a privacy page — worth saying, because the frame sits
 * beside `Privacy Details` on the board and the two were nearly conflated from
 * their names alone.
 *
 * The frame is drawn with one couple's totals: 1,394 days, 186 memories, 42
 * moments, 3 trips. None are hard-coded. Three of the four tiles are counted
 * from real state; `trips` has no source anywhere in the app, so it says so
 * rather than showing a number nobody counted.
 */
export const SPACE_ABOUT_COPY = {
  title: 'How our story began.',
  lede: 'A living archive of shared moments, growing every day since we started this space.',

  timeTogether: 'TIME TOGETHER',
  favourite: 'favorite',
  daysOfUs: 'Days of Us',
  stillBeingWritten: 'Your story is still being written.',

  memories: 'MEMORIES',
  moments: 'MOMENTS',
  milestones: 'MILESTONES',
  trips: 'TRIPS',

  /** Drawn in a tile whose number nothing in the app counts yet. */
  uncounted: '—',
  uncountedHint: 'Not counted yet',

  founded: 'Space Founded',
  foundedUnknown: 'Not recorded yet',

  /**
   * Shown instead of the big number when the pair have not said when they met.
   * The frame has no such state; without it the page opens on a zero.
   */
  daysUnknown: 'Still counting',
} as const
