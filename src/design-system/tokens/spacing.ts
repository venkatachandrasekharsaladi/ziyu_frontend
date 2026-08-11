/**
 * SPACING TOKENS — a 4pt grid.
 *
 * Derived from the real gaps in Figma node 522:266, which uses
 * 4 / 12 / 16 / 20 / 24 / 35 throughout.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  /** Horizontal inset either side of the hero collage. Figma 522:286. */
  heroInset: 35,
} as const

export type Spacing = typeof spacing
