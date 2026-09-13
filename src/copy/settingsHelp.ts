/**
 * Copy for Settings → Help & FAQ.
 *
 * The search is a filter over `data/faq.ts`, not a query to anything. An empty
 * result says what was searched for, because "no results" alone leaves someone
 * wondering whether they mistyped or whether the answer does not exist.
 */
export const SETTINGS_HELP_COPY = {
  title: 'Help & FAQ',
  lede: 'The questions people actually ask.',

  searchLabel: 'Search help',
  searchPlaceholder: 'Try "read receipts"',
  noResultsPrefix: 'Nothing matched',
  noResultsHint: 'Try fewer words, or write to us below.',

  contactGroup: 'Still stuck',
  contact: 'Contact & Feedback',
  contactDetail: 'Tell us what happened and we will look.',
} as const
