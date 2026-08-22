/**
 * COLOUR TOKENS — raw values only.
 *
 * TWO palettes. `palette` is the lavender one, read from the Figma file
 * (`t0FGzFLXoVXSUYa7mkjSbR`); that file defines no Figma variables, so this is
 * the source of truth for it. `midnightPalette` at the foot of the file is the
 * dark one.
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

  /**
   * ROW ACCENT TINTS — the rounded icon tiles on a list row ("Upcoming").
   *
   * INVENTED, like the feedback colours: the Stitch frame draws a peach and a
   * mint tile behind those icons and the Figma file defines neither. Each tint
   * ships beside the ink meant to sit on it, and every pair clears AA — unlike
   * `roseAccent` / `peachAccent`, which fill bars and never carry a glyph.
   *
   * The third pair is `lavender200` + `purple900`, already in the palette.
   */
  peachTint: '#FFEEE3',
  peachInk: '#9E4526',
  mintTint: '#DFF2E9',

  /** Page background glow, top centre. Figma 522:54. */
  glowLavender: 'rgba(206, 189, 255, 0.4)',
  /**
   * The transparent end of that glow.
   *
   * A LinearGradient needs both stops, and `transparent` is not usable here:
   * RN interpolates toward transparent BLACK, which greys the middle of the
   * ramp. The fade has to be the same hue at zero alpha.
   */
  glowLavenderFade: 'rgba(206, 189, 255, 0)',

  /**
   * Purple wash behind an illustration — the M00-S02 medallion, the M00-S04
   * envelope disc. Figma draws both at 10%.
   */
  washPurple: 'rgba(56, 19, 132, 0.1)',
  washPurpleFade: 'rgba(56, 19, 132, 0)',

  /**
   * The focus ring, as the colour inside a `boxShadow` spread. Figma 522:77.
   * A token rather than a literal in two primitives, because a ring that does
   * not follow the theme is a purple halo on a dark field.
   */
  focusRingPurple: 'rgba(56, 19, 132, 0.12)',

  /** Translucent lavender hairline — the envelope card's ring. */
  hairlineLavender: 'rgba(232, 221, 255, 0.5)',

  white: '#FFFFFF',

  /** Primary button shadow. Figma renders black at 10%, not a purple tint. */
  shadowSoft: 'rgba(0, 0, 0, 0.1)',

  /**
   * Scrim behind text reversed out over a photo — the Album Detail hero.
   * NOT `shadowSoft`: black at 10% leaves white text on a light cover at
   * roughly 1.3:1. At 45% the hero title clears AA against any photo the
   * cover happens to be.
   */
  scrimInk: 'rgba(0, 0, 0, 0.45)',
} as const

export type Palette = typeof palette

/**
 * MIDNIGHT — the dark palette.
 *
 * ENTIRELY INVENTED. No dark frame was ever drawn, so this is not a reading of
 * a design; it is a second palette built to the same rules the lavender one
 * follows, and it should be replaced wholesale if a dark design ever arrives.
 *
 * Three things constrain every value here:
 *
 * 1. It stays in the lavender family. The surfaces are desaturated indigo, not
 *    neutral grey — a grey dark mode would read as a different product wearing
 *    the same typeface.
 * 2. Elevation is carried by the SURFACE STEP, not by shadow. `elevation` is
 *    shared with the lavender theme and its shadows are black at 5-10%, which
 *    is invisible on a dark ground. `page` -> `card` -> `field` -> `soft` climb
 *    in lightness instead, and `border.subtle` draws the edge.
 * 3. The brand purple INVERTS. In lavender, `purple900` is dark enough to be
 *    text on a light page and to take white on top as a button fill. Neither
 *    holds here, so the dark brand is a light lavender and `onPrimary` becomes
 *    a dark ink — the two roles swap ends. Every pair is asserted in
 *    `themes/__tests__/theme.contrast.test.ts`.
 */
export const midnightPalette = {
  /** Brand purple, inverted: light enough to be text on a dark page. */
  lavender300: '#C3A8FF',
  /**
   * Secondary link label — a step lighter again, mirroring the way `purple700`
   * is a step off `purple900` in the other direction.
   */
  lavender200: '#D5C4FF',

  /** Ink that sits ON the brand fill. The counterpart to lavender's `white`. */
  ink900: '#1A1330',

  /**
   * Heading text — near-white, carrying the same purple cast that `ink900`
   * carries in the lavender palette.
   */
  paper50: '#F5F1FF',
  /** Body / caption text. */
  paper200: '#C6BFDA',
  /**
   * Placeholder ink. Clears AA on the field fill at 5.47:1 — the same bar
   * lavender's `ink400` was darkened to meet. See spec D20.1.
   */
  paper400: '#9C94B4',

  /** Page ground. The darkest surface; every other one climbs from here. */
  indigo900: '#12101C',
  /** Card fill — one step up from the page. */
  indigo800: '#1C1930',
  /** Input fill, panel fill, and the `soft` button variant. */
  indigo700: '#232038',
  /** Raised lavender surface: the medallion, the bottom bar's active pill. */
  indigo600: '#322C52',

  /** Divider and outline-button border. */
  indigo500: '#2E2945',
  /** Field border. Lighter than the divider, as in the lavender palette. */
  indigo400: '#443C63',

  /**
   * DECORATIVE ONLY, exactly as lavender's `greyLavender300` is: it scores
   * 1.89:1 on the card fill. The contrast suite pins it below AA in BOTH
   * palettes, so nobody promotes it to a text role in either. See spec D20.3.
   */
  indigoMuted: '#4B4468',

  /** Feedback. Lightened from the lavender pair, which would vanish here. */
  rose300: '#FF95A8',
  green300: '#63D9A4',

  /**
   * Password-strength accents. `weak` and `fair` are the SAME hexes the
   * lavender palette uses — they were always pale bar fills, and pale reads
   * correctly against a dark track. `strong` follows the brand, as it does
   * there.
   */
  roseAccent: '#E9A4C7',
  peachAccent: '#FFC7A8',

  /** Row accent tints, inverted: a deep fill under a light glyph. */
  peachTint: '#4A2E20',
  peachInk: '#FFC7A8',
  mintTint: '#17372B',
  mintInk: '#7FE3B4',

  /** Page background glow, top centre. */
  glowIndigo: 'rgba(150, 118, 255, 0.2)',
  /** Its transparent end — same hue at zero alpha, never `transparent`. */
  glowIndigoFade: 'rgba(150, 118, 255, 0)',

  /**
   * Illustration wash. Lighter than the lavender palette's, not darker: a wash
   * has to be brighter than the ground it sits on, and here the ground is dark.
   */
  washLavender: 'rgba(195, 168, 255, 0.12)',
  washLavenderFade: 'rgba(195, 168, 255, 0)',

  /** Focus ring. Carried a touch heavier — a dark field swallows 12%. */
  focusRingLavender: 'rgba(195, 168, 255, 0.22)',

  /** Translucent hairline on a raised dark surface. */
  hairlineLavender: 'rgba(195, 168, 255, 0.18)',

  /**
   * Scrim behind text reversed out over a photo. Heavier than lavender's 45%:
   * a dark UI makes a photo the brightest thing on the screen, so it takes more
   * to bring white text back off it.
   */
  scrimInk: 'rgba(0, 0, 0, 0.55)',

  /** Shadows barely register here — see note 2 above. */
  shadowSoft: 'rgba(0, 0, 0, 0.5)',
} as const

export type MidnightPalette = typeof midnightPalette
