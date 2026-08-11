import { palette } from '@/design-system/tokens/colors'
import { radii } from '@/design-system/tokens/radii'
import { spacing } from '@/design-system/tokens/spacing'
import { typography } from '@/design-system/tokens/typography'

/**
 * THE THEME — semantic names over raw values.
 *
 * Named `lavender` for its palette, not `light` for a light/dark axis. Only
 * one theme exists and no dark design has been drawn. If a second is ever
 * designed it gets its own palette name, rather than forcing this one to
 * become "the light variant" retroactively.
 */
export const lavenderTheme = {
  colors: {
    brand: {
      primary: palette.purple900,
      /** Secondary link label. Deliberately NOT primary — Figma 522:301. */
      link: palette.purple700,
    },
    text: {
      heading: palette.ink900,
      body: palette.ink600,
      onPrimary: palette.white,
    },
    surface: {
      /** Screen background is a gradient, top → bottom. */
      gradientFrom: palette.lavender50,
      gradientTo: palette.lavender200,
      /** Flat fill behind the hero, so a failed image never collapses layout. */
      soft: palette.lavender200,
    },
    border: {
      subtle: palette.greyLavender200,
    },
    shadow: palette.shadowSoft,
  },
  spacing,
  radii,
  typography,
} as const

export type AppTheme = typeof lavenderTheme
