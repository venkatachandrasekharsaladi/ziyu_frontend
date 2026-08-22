/**
 * Copy for M01-S06 Partner Found. Figma 522:709.
 *
 * Built as a full screen, not a sheet (D37): it is reached by redeeming an
 * invite and has no parent screen to sit over.
 */
export const PARTNER_FOUND_COPY = {
  heading: 'We found your person. ❤️',
  lede: (name: string) => `${name} is waiting to share their space with you.`,
  confirm: 'Continue',
  /** Drawn as `#7A7583`; normalised to `text.body` per spec §5. */
  reject: "That's not them",
} as const
