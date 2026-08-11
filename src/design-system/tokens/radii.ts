/**
 * RADIUS TOKENS.
 *
 * Figma draws buttons at radius 9999 — a pill. Expressed here as `pill` so
 * intent survives, rather than repeating a magic number.
 */
export const radii = {
  md: 16,
  pill: 9999,
} as const

export type Radii = typeof radii
