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

  /** Outline-button border. Declared for M00-S02. */
  greyLavender200: '#E6E0EA',

  white: '#FFFFFF',

  /** Primary button shadow. Figma renders black at 10%, not a purple tint. */
  shadowSoft: 'rgba(0, 0, 0, 0.1)',
} as const

export type Palette = typeof palette
