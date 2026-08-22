/**
 * ELEVATION TOKENS — `boxShadow` strings.
 *
 * RN's single-shadow props cannot express two stacked shadows, so `boxShadow`
 * is used throughout. Collected here so the strings stop being retyped per
 * component, and so the black-versus-purple decision lives in one place.
 */
export const elevation = {
  /**
   * Buttons. Black at 10%, two stacks.
   *
   * NOT a purple tint. Figma draws three different purple shadows across the
   * M00 screens — rgba(79,49,155,.2), rgba(103,75,181,.2) and rgba(56,19,132,.2)
   * — and no two frames agree. Purple-on-purple also reads muddy against a
   * lavender ground. See spec D16.
   */
  control:
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
  /** Inputs. Figma 522:77. */
  field: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  /** Cards. Figma 522:183. */
  card: '0px 4px 6px 0px rgba(103, 75, 181, 0.05)',
  /** M00-S02 medallion. Figma 522:68. */
  medallion: '0px 8px 24px 0px rgba(79, 49, 155, 0.15)',
  /** M00-S04 envelope. Figma 522:248. */
  illustration:
    '0px 12px 32px 0px rgba(103, 75, 181, 0.12), 0px 2px 8px 0px rgba(103, 75, 181, 0.04)',
} as const

export type Elevation = typeof elevation
