import { palette } from '@/design-system/tokens/colors'
import { elevation } from '@/design-system/tokens/elevation'
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
      placeholder: palette.ink400,
      /**
       * DECORATIVE ONLY. Never text a user must read: it scores roughly 1.7:1
       * on the card fill, which is what made M00-S03's requirement rows
       * unreadable. The contrast suite asserts it stays below AA so nobody
       * promotes it to a text role by accident. See spec D20.3.
       */
      muted: palette.greyLavender300,
      onPrimary: palette.white,
    },
    surface: {
      /**
       * Form screens: a flat fill plus a glow, NOT the hero gradient. A
       * gradient running to lavender200 would sit under the primary button and
       * cut its contrast. See spec D18.
       */
      page: palette.lavender50,
      /** M00-S01 only — the hero gradient's two stops. */
      gradientFrom: palette.lavender50,
      gradientTo: palette.lavender200,
      /** Input fill, and the `soft` button variant. */
      field: palette.lavender100,
      card: palette.white,
      /** Raised lavender surface — the M00-S02 medallion. */
      soft: palette.lavender200,
      glow: palette.glowLavender,
    },
    border: {
      /** Dividers and button outlines. */
      subtle: palette.greyLavender200,
      /** Inputs only. Not interchangeable with `subtle`. */
      field: palette.greyLavender300,
    },
    feedback: {
      error: palette.crimson600,
      success: palette.green700,
    },
    shadow: palette.shadowSoft,
  },
  /** One height for buttons, social buttons and inputs alike. See spec D14. */
  control: {
    height: 56,
  },
  spacing,
  radii,
  typography,
  elevation,
} as const

export type AppTheme = typeof lavenderTheme
