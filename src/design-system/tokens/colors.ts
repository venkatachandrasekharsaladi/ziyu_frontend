/**
 * COLOUR TOKENS — raw values only.
 *
 * Every value here was read from the Figma file (`t0FGzFLXoVXSUYa7mkjSbR`).
 * That file defines no Figma variables, so this file is the source of truth.
 *
 * RULE: nothing outside `themes/` imports this file. Screens and components
 * read semantic names off the theme, never a raw hex.
 */
export const palette = {
  /** Brand purple. Button fill, wordmark. Figma 522:270, 522:296. */
  purple900: '#381384',
  /** Lighter purple used only by the secondary link label. Figma 522:301. */
  purple700: '#4F319B',

  /** Heading ink — carries a purple cast. Figma 522:292. */
  ink900: '#33264A',
  /** Body / caption ink. Figma 522:285, 522:294. */
  ink600: '#494552',

  /** Background gradient, top stop. Figma 522:266. */
  lavender50: '#FDF7FF',
  /** Background gradient, bottom stop. Doubles as a soft raised surface. */
  lavender200: '#E8DDFF',

  /** Input fill. Sits between lavender50 and lavender200. Figma 522:77. */
  lavender100: '#F8F1FB',

  /** Divider and outline-button border. */
  greyLavender200: '#E6E0EA',

  /** Field border. Darker than greyLavender200. Figma 522:77, 522:145, 522:173. */
  greyLavender300: '#CAC4D4',

  /**
   * Placeholder ink.
   *
   * Figma draws #7A7583 at 50% opacity, which scores roughly 2.1:1 on
   * lavender100 and fails WCAG AA. Even at full opacity #7A7583 reaches only
   * 4.03:1. Darkened here to clear AA at 4.52:1. See spec D20.1.
   */
  ink400: '#726D7B',

  /**
   * Feedback colours. Both INVENTED — no Figma frame draws an error or success
   * colour, and the Welcome spec deliberately kept Google's #EA4335 out of the
   * palette so it could not become one. The crimson is carried toward magenta
   * so it reads as part of a lavender palette rather than a system alert.
   */
  crimson600: '#A81E3C',
  green700: '#1F7A55',

  /**
   * Password-strength accents, read from the Stitch design system that draws
   * M00-S06 (`rose-accent`, `peach-accent`).
   *
   * DECORATIVE ONLY, like `greyLavender300`. Both are far too light to carry
   * text — the strength meter states its level in words, in an ink that clears
   * AA, and uses these only to fill the bars beside it.
   */
  roseAccent: '#E9A4C7',
  peachAccent: '#FFC7A8',

  /** Page background glow, top centre. Figma 522:54. */
  glowLavender: 'rgba(206, 189, 255, 0.4)',

  white: '#FFFFFF',

  /** Primary button shadow. Figma renders black at 10%, not a purple tint. */
  shadowSoft: 'rgba(0, 0, 0, 0.1)',
} as const

export type Palette = typeof palette
