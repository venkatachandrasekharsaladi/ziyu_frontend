/**
 * Copy for M01-S09 Is This Your Person. Figma 522:764 (canonical; 522:559 is
 * the earlier pass).
 *
 * The last stop before the relationship is committed.
 */
export const CONFIRM_PARTNER_COPY = {
  heading: 'Is this your person?',
  lede: 'Once you connect, your space becomes theirs too.',
  confirm: 'Yes, Connect Us ❤️',
  cancel: 'Cancel',
  /**
   * Shown for the user's own avatar when they have no profile. The redeem
   * branch never passes through profile creation (spec §8), so there is
   * genuinely no name to show — an empty circle would read as a loading state.
   */
  youLabel: 'You',
} as const
