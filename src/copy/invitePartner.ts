import { BRAND } from '@/config/brand'

/**
 * Copy for M01-S03 Invite Your Partner. Figma 522:422.
 *
 * The decorative "Our safe space ✨" note is dropped with the Bricolage stray
 * it was typeset in (D34).
 *
 * "YOUR UNIQUE CODE" is drawn in `#7A7583`, which measures 4.37:1 — below the
 * AA floor, directly above a code someone has to transcribe. It is normalised
 * to `text.body` per spec §5.
 */
export const INVITE_PARTNER_COPY = {
  heading: 'Invite your person ❤️',
  lede: `Send them this code and they will land straight in your ${BRAND.name} space.`,
  codeLabel: 'YOUR UNIQUE CODE',
  share: 'Share Invite',
  copy: 'Copy Code',
  /** Interpolated with the code when the system share sheet opens. */
  shareMessage: (code: string) => `Join me on ${BRAND.name}. My code is ${code}.`,
  errors: {
    CODE_INVALID: 'Something went wrong. Try again.',
    CODE_EXPIRED: 'Something went wrong. Try again.',
    CANNOT_PAIR_WITH_SELF: 'Something went wrong. Try again.',
    NETWORK: 'No connection. Check your network and try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
