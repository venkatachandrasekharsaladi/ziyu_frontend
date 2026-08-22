/**
 * Copy for M01-S22 Welcome Home. Stitch screen 0aaf557c.
 *
 * Stitch holds two passes — "Welcome Home Transition" and "Welcome Home
 * Entrance" — with identical copy, differing only in the button. This follows
 * the Entrance, which is the last of the pair in the board.
 *
 * The "Assistant Ready" line the design shows is dropped: no assistant exists,
 * and announcing one that does nothing is a promise the app cannot keep.
 */
export const WELCOME_HOME_COPY = {
  heading: 'Welcome Home. ❤️',
  lede: 'Your story is waiting.',
  submit: 'Open Our Home',
} as const
