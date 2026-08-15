/**
 * Copy for M01-S07 Connecting. Figma 522:738.
 *
 * The drawn "just a moment" node uses Bricolage Grotesque at body size, which
 * is a Figma slip rather than intent (D34). The words are kept; the face is not.
 */
export const CONNECTING_COPY = {
  heading: 'Creating your shared space…',
  lede: 'just a moment',
  retry: 'Try Again',
  errors: {
    CODE_INVALID: 'Something went wrong. Try again.',
    CODE_EXPIRED: 'That invitation has expired. Ask your partner for a new one.',
    CANNOT_PAIR_WITH_SELF: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
