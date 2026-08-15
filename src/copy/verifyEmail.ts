/**
 * Copy for M00-S04 Verify Email.
 *
 * The emoji is in the design and stays: it carries tone a lavender palette alone
 * does not.
 */
export const VERIFY_EMAIL_COPY = {
  heading: 'Check your inbox 💌',
  lede: 'We sent a verification link to your email.',
  resend: 'Resend Email',
  changeEmail: 'Change Email',
  /**
   * The forward exit into M01. Until a real provider reports `emailVerified`,
   * this is the user asserting they have followed the link.
   */
  continue: "I've Verified",
  /** Figma shows 00:59 — one tick into a 60-second cooldown. */
  resendCooldownSeconds: 60,
  errors: {
    NETWORK: 'No connection. Check your network and try again.',
    INVALID_CREDENTIALS: 'Something went wrong. Try again.',
    EMAIL_TAKEN: 'Something went wrong. Try again.',
    UNKNOWN: 'Something went wrong. Try again.',
  },
} as const
