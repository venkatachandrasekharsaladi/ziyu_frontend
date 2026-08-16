import { BRAND } from '@/config/brand'

/**
 * Copy for M05-S01 Our Space. Stitch screen e6c82bcb.
 *
 * The heading and lede are the design's. Everything below them is NOT: the
 * Stitch project draws no sign-out on any of its 226 screens, and this one was
 * designed to fill that gap.
 *
 * Signing out confirms first. It is reversible, but getting back in costs an
 * email and a password, which is enough friction that an accidental tap is
 * worth one question.
 */
export const OUR_SPACE_COPY = {
  heading: 'Our little world.',
  lede: 'Everything that makes this space yours, together.',

  /** NOT IN THE DESIGN. */
  signOut: 'Sign Out',
  confirmTitle: 'Sign out?',
  confirmBody: `You will need your email and password to get back into ${BRAND.name}.`,
  confirmKeep: 'Stay signed in',
  confirmSignOut: 'Sign out',
} as const
