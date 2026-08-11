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
  /** Uppercase footnote. Figma 522:285. */
  caption: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
} as const

export type Typography = typeof typography
