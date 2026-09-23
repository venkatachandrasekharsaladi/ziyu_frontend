/**
 * Copy for M06-S05 Once in a Lifetime — the shared promises list.
 * Figma `Tales of Two` / `New Features` / 3482:1672.
 *
 * The longest single frame on the page (3172pt) and almost entirely list, so
 * most of its words are the promises themselves — those live in
 * `@/sample/plans`, because they are content a couple writes, not chrome.
 */
export const LIFETIME_COPY = {
  eyebrow: 'A Lifetime of Two',
  headerTitle: 'Our Shared Promises',
  title: 'Once in our lifetime.',
  lede: (target: number) =>
    `Some memories are worth waiting a lifetime for. A quiet pact of ${target} dreams we've promised to share before forever.`,

  summary: (lived: number, target: number) => `${lived} of ${target} experiences`,
  percentLived: (percent: number) => `${percent}% Lived`,
  stillWaiting: (n: number) => `${n} adventures still waiting for us.`,
  lastCompleted: (what: string) => `Last completed: ${what}`,
  together: 'Together, always',

  filterLabel: 'Filter by category',
  viewAll: (n: number) => `View All (${n})`,
  all: 'All',

  categories: {
    travel: 'Travel',
    adventure: 'Adventure',
    romance: 'Romance',
    life: 'Life',
    wild: 'Wild & Wonderful',
  },

  /** The section header's right-hand figure — "2 of 4 lived". */
  categoryProgress: (lived: number, total: number) => `${lived} of ${total} lived`,

  didIt: 'We did it',

  /** Announced on the tap target, since the tick alone carries the state. */
  toggleHint: {
    lived: 'Lived. Tap to mark as still waiting.',
    waiting: 'Still waiting. Tap to mark as lived.',
  },

  add: {
    title: 'Add your own dream',
    lede: 'Have a secret experience just for you two?',
    action: 'Add dream',
    placeholder: 'Something only the two of you would think of',
  },

  empty: 'Nothing in this category yet.',
} as const
