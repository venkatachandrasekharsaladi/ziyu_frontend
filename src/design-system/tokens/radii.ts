/**
 * RADIUS TOKENS.
 *
 * `md: 16` was removed: it had no consumers. `Button` was the only file
 * referencing this group and it uses `pill`.
 *
 * M00-S05 draws its input at radius 8 — the only 8pt radius in the module. It
 * conforms to `field` at 12, which the other two input screens use.
 */
export const radii = {
  /** Inputs, cards, and the icon tiles on a list row. Figma 522:77, 522:183. */
  field: 12,
  /** A row card nested inside a panel, and the bottom bar's active pill. */
  tile: 16,
  /** The outer grouped surface a list of row cards sits in. */
  panel: 24,
  /** The M00-S02 medallion. Figma 522:68. */
  medallion: 32,
  /** Buttons. Figma draws 9999 — named so the intent survives. */
  pill: 9999,
} as const

export type Radii = typeof radii
