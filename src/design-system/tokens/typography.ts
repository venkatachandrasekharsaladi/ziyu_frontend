/**
 * TYPOGRAPHY TOKENS.
 *
 * Typeface is Plus Jakarta Sans, confirmed from Figma node 522:266.
 * Font family strings must match the keys registered with `useFonts` in
 * `src/app/_layout.tsx` — a mismatch silently falls back to the system font.
 *
 * Sizes, line heights and letter spacing are read directly from Figma. Colour
 * is NOT set here; roles bind to colour at the theme layer.
 */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const

export const typography = {
  /** Screen headline. Figma 522:292. */
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  /**
   * Screen headline on every form screen. Figma 522:167, 522:242.
   *
   * M00-S05 draws its headline at 28/34 — the only frame that does, and its
   * headline is short enough that nothing needed to shrink. It conforms to this.
   */
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0,
  },
  /** Product wordmark in the top bar. Figma 522:270. */
  wordmark: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  /** Supporting paragraph. Figma 522:294. */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 18,
    lineHeight: 27,
  },
  /** Button label. Figma 522:298, 522:301. */
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  /**
   * Button labels.
   *
   * SemiBold at 16 supplies the emphasis Figma reached for with 20/26 on
   * M00-S02 and M00-S03, without adding a fourth type size. See spec D15.
   */
  labelStrong: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** Requirement rows and field error messages. Figma 522:191. */
  footnote: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /**
   * A small inline action sitting on a label row — M00-S02's "Forgot password?".
   * Figma 522:85: 11/15 SemiBold, tracking 0.55, and NOT uppercase.
   *
   * Distinct from `caption` precisely because of the case. Rendering it through
   * `caption` uppercased it, which put two shouting uppercase items on one row
   * and made the action read as a second field label.
   */
  captionAction: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.55,
  },
  /** Resend timer on M00-S04. Figma 522:263. */
  countdown: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  /**
   * Uppercase footnote — field labels and divider labels. Figma 522:285.
   *
   * Tracking stays 1.1. M00-S02 and M00-S05 draw their field labels at 0.55;
   * they conform to this token rather than it bending to them.
   */
  caption: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
} as const

export type Typography = typeof typography
