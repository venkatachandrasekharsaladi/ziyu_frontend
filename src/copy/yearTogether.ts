/**
 * Copy for M06-S04 Our Year Together — the couple bingo board.
 * Figma `Tales of Two` / `New Features` / 3482:1345.
 *
 * The board's numbers are all live (`plansStore` selectors), so what lives here
 * is the frame it prints them in.
 */
export const YEAR_COPY = {
  eyebrow: 'Annual Couple Board',
  headerTitle: 'Shared Keepsakes',
  title: 'Our Year Together',
  lede: '12 months. A hundred little possibilities. Pick moments to share, discover, or simply look forward to.',

  progress: (done: number, total: number) => `${done} / ${total}`,
  completed: (percent: number) => `${percent}% Completed`,
  daysLeft: 'Days left',
  toGo: (n: number) => `${n} to go`,

  filters: {
    all: 'All',
    completed: 'Completed',
    inProgress: 'In Progress',
  },
  addTile: 'Add tile',

  /**
   * The state a tap moves a tile INTO, announced to screen readers.
   *
   * A tile cycles todo → in progress → done → todo (see `NEXT_TILE_STATE` in
   * the store for why it cycles rather than toggles). Sighted users read the
   * cycle off the card's colour; without this they would have no way to know
   * what a tap is about to do.
   */
  cycleHint: {
    todo: 'Not started. Tap to mark in progress.',
    'in-progress': 'In progress. Tap to mark done.',
    done: 'Done. Tap to clear.',
  },

  badge: {
    'in-progress': 'In progress',
    done: 'Stamped',
  },

  empty: {
    all: 'No tiles on the board yet.',
    completed: "Nothing stamped yet. That's what the year is for.",
    'in-progress': 'Nothing on the go right now.',
  },
} as const
