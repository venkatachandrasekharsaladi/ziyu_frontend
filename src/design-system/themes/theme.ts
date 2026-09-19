import { midnightPalette as dark, palette } from '@/design-system/tokens/colors'
import { elevation } from '@/design-system/tokens/elevation'
import { layout } from '@/design-system/tokens/layout'
import { motion } from '@/design-system/tokens/motion'
import { radii } from '@/design-system/tokens/radii'
import { spacing } from '@/design-system/tokens/spacing'
import { typography } from '@/design-system/tokens/typography'

/**
 * The shape every theme fills in.
 *
 * Written out as an explicit type rather than inferred from one theme with
 * `as const`, and that is the whole point: it is what makes "add a colour to
 * one theme and forget the other" a COMPILE error instead of a hole somebody
 * finds in dark mode three screens later. `themes/__tests__/theme.parity.test.ts`
 * covers the same ground at runtime, for the values TypeScript cannot see.
 */
export type ThemeColors = {
  brand: {
    primary: string
    /** Secondary link label. Deliberately NOT primary — Figma 522:301. */
    link: string
  }
  text: {
    heading: string
    body: string
    placeholder: string
    /**
     * DECORATIVE ONLY. Never text a user must read. The contrast suite asserts
     * it stays below AA on the card in EVERY theme, so nobody promotes it to a
     * text role by accident. See spec D20.3.
     */
    muted: string
    /** Ink on top of `brand.primary`. */
    onPrimary: string
  }
  surface: {
    /**
     * Form screens: a flat fill plus a glow, NOT the hero gradient. A gradient
     * running to the raised stop would sit under the primary button and cut its
     * contrast. See spec D18.
     */
    page: string
    /** M00-S01 only — the hero gradient's two stops. */
    gradientFrom: string
    gradientTo: string
    /** Input fill, and the `soft` button variant. */
    field: string
    card: string
    /** Raised surface — the M00-S02 medallion, the bottom bar's active pill. */
    soft: string
    glow: string
    /**
     * The transparent end of `glow`, and of `wash`.
     *
     * Both exist because a LinearGradient needs two stops and `transparent` is
     * not one of them: RN ramps toward transparent BLACK, which greys the middle
     * of the fade. The fade must be the same hue at zero alpha.
     */
    glowFade: string
    /** Purple wash behind an illustration — the medallion, the envelope disc. */
    wash: string
    washFade: string
    /** Behind text reversed out over a photo — the Album Detail hero. */
    scrim: string
  }
  border: {
    /** Dividers and button outlines. */
    subtle: string
    /** Inputs only. Not interchangeable with `subtle`. */
    field: string
    /** A translucent ring on a raised surface — the envelope card. */
    hairline: string
  }
  feedback: {
    error: string
    success: string
  }
  /**
   * M00-S06's strength meter. Bar fills only — never text.
   *
   * `strong` reuses the brand rather than the success green: the Stitch design
   * fills the last bar with the primary, and a green here would read as a
   * different kind of signal from the rest of the screen.
   */
  strength: {
    weak: string
    fair: string
    strong: string
    track: string
  }
  /**
   * ROW ACCENTS — the icon tile on a list row ("Upcoming", "Coming up").
   *
   * An ordered list rather than named roles, cycled by position, so a list of
   * any length stays varied without a screen reaching for a hex. `soft` is the
   * tile fill, `ink` the glyph on it; the pairs are fixed together because that
   * is the only combination each tint is contrast-checked for. Both themes must
   * ship the same NUMBER of pairs, or a row would change accent when the theme
   * changed — `theme.parity` asserts that.
   */
  accents: readonly { readonly soft: string; readonly ink: string }[]
  /**
   * The five space moods, as the wash behind each mood card's photograph.
   *
   * NAMED rather than an ordered list, unlike `accents`. An accent is cycled by
   * position and any tint will do; a mood is a thing the couple CHOSE, stored
   * by name in `spaceStore`, and it has to come back as the same colour every
   * time. Position would not survive adding a sixth mood.
   *
   * Decorative only — see the palette's note. Nothing draws text on these.
   */
  moods: {
    lavenderCalm: string
    warmMorning: string
    roseGlow: string
    goldenHour: string
    midnightQuiet: string
  }
  /**
   * The focus ring, as the colour inside a `boxShadow` spread.
   *
   * A colour and not an `elevation` string, because `elevation` is shared by
   * both themes and this one is the single shadow that MUST change with them: a
   * ring keyed to the light brand is a purple halo on a dark field.
   */
  focusRing: string
  shadow: string
  /**
   * CHAT — bubble fills, and the one accent Chat is allowed to tint with.
   *
   * `accent` is Iris, never Fuschia: Fuschia measures 3.09:1 on white and
   * 2.93:1 on the page, failing AA as text and under a white label alike.
   * Fuschia survives only as `bubbleIncoming`'s tint in lavender, where it
   * sits behind `bubbleInk` rather than carrying text itself.
   */
  chat: {
    bubbleOutgoing: string
    bubbleIncoming: string
    /** Ink on top of both bubbles. One value — both fills are contrast-checked for it. */
    bubbleInk: string
    accent: string
    accentSoft: string
    /** Label on top of `accent`. */
    onAccent: string
  }
}

/**
 * Everything that is not a colour, and therefore shared.
 *
 * Dark mode is a repaint, not a relayout: a heading is 34pt and a control is
 * 56pt tall in both themes. Anything that moves when the theme changes is a
 * bug, and `theme.parity` asserts these groups are the very same objects.
 */
const shared = {
  /** One height for buttons, social buttons and inputs alike. See spec D14. */
  control: {
    height: 56,
  },
  spacing,
  radii,
  typography,
  elevation,
  /**
   * Sizing, not colour — same reason `spacing` and `radii` sit here rather
   * than under a theme. A phone's content column does not get wider when the
   * user switches from lavender to midnight, so there is exactly one `layout`
   * object and both themes point at it. See `tokens/layout.ts` for why the
   * group exists at all.
   */
  layout,
  /**
   * Timing, not colour — same reasoning as `layout` above. A press settles at
   * the same speed in lavender and midnight; an animation that changed pace
   * with the palette would be a bug, and `theme.parity` asserts this is the
   * very same object in both. See `tokens/motion.ts` for why the group
   * exists and why its easing curves are plain control points rather than
   * built `Easing` functions.
   */
  motion,
} as const

/**
 * LAVENDER — the light theme.
 *
 * Named for its palette, not `light` for a light/dark axis. That naming stood
 * when it was the only theme and it still stands now that it is not: `midnight`
 * below is likewise named for its palette. The cost is that Unistyles'
 * `adaptiveThemes` — which only fires for themes literally named `light` and
 * `dark` — is off the table, so this app does not follow the OS. It ships
 * lavender and lets the user say otherwise; see `useThemeMode`.
 */
export const lavenderTheme = {
  colors: {
    brand: {
      primary: palette.purple900,
      link: palette.purple700,
    },
    text: {
      heading: palette.ink900,
      body: palette.ink600,
      placeholder: palette.ink400,
      muted: palette.greyLavender300,
      onPrimary: palette.white,
    },
    surface: {
      page: palette.lavender50,
      gradientFrom: palette.lavender50,
      gradientTo: palette.lavender200,
      field: palette.lavender100,
      card: palette.white,
      soft: palette.lavender200,
      glow: palette.glowLavender,
      glowFade: palette.glowLavenderFade,
      wash: palette.washPurple,
      washFade: palette.washPurpleFade,
      scrim: palette.scrimInk,
    },
    border: {
      subtle: palette.greyLavender200,
      field: palette.greyLavender300,
      hairline: palette.hairlineLavender,
    },
    feedback: {
      error: palette.crimson600,
      success: palette.green700,
    },
    strength: {
      weak: palette.roseAccent,
      fair: palette.peachAccent,
      strong: palette.purple900,
      track: palette.greyLavender200,
    },
    accents: [
      { soft: palette.peachTint, ink: palette.peachInk },
      { soft: palette.mintTint, ink: palette.green700 },
      { soft: palette.lavender200, ink: palette.purple900 },
    ],
    moods: {
      lavenderCalm: palette.moodLavenderCalm,
      warmMorning: palette.moodWarmMorning,
      roseGlow: palette.moodRoseGlow,
      goldenHour: palette.moodGoldenHour,
      midnightQuiet: palette.moodMidnightQuiet,
    },
    focusRing: palette.focusRingPurple,
    shadow: palette.shadowSoft,
    chat: {
      bubbleOutgoing: palette.iris60,
      bubbleIncoming: palette.fuschia60,
      bubbleInk: palette.ink900,
      accent: palette.iris100,
      accentSoft: palette.iris60,
      onAccent: palette.white,
    },
  } satisfies ThemeColors,
  /**
   * Which end of the light/dark axis this theme sits on.
   *
   * Read by anything that has to hand a light-or-dark answer to a platform API
   * instead of a colour — the status bar is the whole reason it exists. Derived
   * from the theme rather than from `Appearance`, because the app's theme is
   * the user's choice here and need not agree with the OS.
   */
  scheme: 'light',
  ...shared,
} as const

/**
 * MIDNIGHT — the dark theme.
 *
 * Same semantic names, same shape, every value from `midnightPalette`. Read
 * that palette's header for the three rules it was built to; the one with teeth
 * is that the brand and `onPrimary` swap ends, because `brand.primary` has to
 * work both as text on the page AND as a button fill with `onPrimary` on top,
 * and no single hex does both jobs at both ends of the axis.
 */
export const midnightTheme = {
  colors: {
    brand: {
      primary: dark.lavender300,
      link: dark.lavender200,
    },
    text: {
      heading: dark.paper50,
      body: dark.paper200,
      placeholder: dark.paper400,
      muted: dark.indigoMuted,
      onPrimary: dark.ink900,
    },
    surface: {
      page: dark.indigo900,
      gradientFrom: dark.indigo900,
      gradientTo: dark.indigo600,
      field: dark.indigo700,
      card: dark.indigo800,
      soft: dark.indigo600,
      glow: dark.glowIndigo,
      glowFade: dark.glowIndigoFade,
      wash: dark.washLavender,
      washFade: dark.washLavenderFade,
      scrim: dark.scrimInk,
    },
    border: {
      subtle: dark.indigo500,
      field: dark.indigo400,
      hairline: dark.hairlineLavender,
    },
    feedback: {
      error: dark.rose300,
      success: dark.green300,
    },
    strength: {
      weak: dark.roseAccent,
      fair: dark.peachAccent,
      strong: dark.lavender300,
      track: dark.indigo500,
    },
    accents: [
      { soft: dark.peachTint, ink: dark.peachInk },
      { soft: dark.mintTint, ink: dark.mintInk },
      { soft: dark.indigo600, ink: dark.lavender300 },
    ],
    moods: {
      lavenderCalm: dark.moodLavenderCalm,
      warmMorning: dark.moodWarmMorning,
      roseGlow: dark.moodRoseGlow,
      goldenHour: dark.moodGoldenHour,
      midnightQuiet: dark.moodMidnightQuiet,
    },
    focusRing: dark.focusRingLavender,
    shadow: dark.shadowSoft,
    chat: {
      bubbleOutgoing: dark.iris60Dark,
      bubbleIncoming: dark.fuschia60Dark,
      bubbleInk: dark.paper50,
      accent: dark.iris300,
      accentSoft: dark.iris60Dark,
      onAccent: dark.ink900,
    },
  } satisfies ThemeColors,
  scheme: 'dark',
  ...shared,
} as const

/**
 * The two themes, by the name Unistyles knows them.
 *
 * Exported as one object so `unistyles.ts`, the mode hook and the tests all
 * enumerate the same list. Adding a third theme should mean editing this and
 * nothing else.
 */
export const themes = {
  lavender: lavenderTheme,
  midnight: midnightTheme,
} as const

export type ThemeName = keyof typeof themes

/**
 * Which registered theme this object is.
 *
 * Matched on `surface.page`, because every theme's page ground is a different
 * colour — `theme.parity` asserts that, which is what makes this total. Needed
 * because `UnistylesRuntime.themeName` is a device-only value: the Jest mock
 * leaves it `undefined`, so anything that reads it is untestable.
 *
 * Falls back to the scheme rather than throwing. A theme this module has not
 * been told about is a configuration mistake, and taking down a screen over it
 * is worse than picking the nearer of the two.
 */
export function themeNameOf(theme: Pick<AppTheme, 'colors' | 'scheme'>): ThemeName {
  const names = Object.keys(themes) as ThemeName[]
  const match = names.find(
    (name) => themes[name].colors.surface.page === theme.colors.surface.page,
  )

  return match ?? (theme.scheme === 'dark' ? 'midnight' : 'lavender')
}

/**
 * The theme contract.
 *
 * `colors` is `ThemeColors` rather than a bag of string literals, so both themes
 * satisfy this and a component cannot come to depend on one theme's exact hex.
 */
export type AppTheme = {
  colors: ThemeColors
  scheme: 'light' | 'dark'
} & typeof shared
