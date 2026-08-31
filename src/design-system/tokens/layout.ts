/**
 * LAYOUT TOKENS — the content column, in one place.
 *
 * This group exists because it didn't: `AppScreenLayout`, `AuthScreenLayout`
 * and `WelcomeScreen` each hardcoded their own copy of the same idea — a
 * `maxWidth` that stops the content stretching edge-to-edge once the device is
 * wider than a phone. 448 showed up three times across two files, and
 * WelcomeScreen alone carried two more numbers (480, 384) for its own wider
 * and narrower blocks. Changing "how wide is the app" meant finding all five.
 *
 * RULE: nothing outside `themes/` imports this file — same rule as every other
 * token group. Screens and components read `theme.layout.*`, never this
 * module directly.
 */
export const layout = {
  /**
   * THE content column cap. What `AppScreenLayout` and `AuthScreenLayout`
   * centre every screen's children inside, and what WelcomeScreen's headline
   * and subtitle match so its copy lines up with the column every other
   * screen in the app uses. This is the one number the brief means by "the
   * single lever" — change it here and every screen's column changes with it.
   */
  column: 448,
  /**
   * WelcomeScreen's outer content wrapper ONLY. A little wider than `column`
   * because it also has to bound the hero collage, which Figma draws bigger
   * than a form column — not a second general-purpose role, just the one
   * screen that needs more room around the same idea.
   */
  columnWide: 480,
  /**
   * WelcomeScreen's button stack. Figma draws the two CTAs narrower than the
   * copy above them, so this is deliberately less than `column` rather than
   * reusing it — reusing `column` here would stretch the buttons wider than
   * the design calls for.
   */
  columnNarrow: 384,
} as const

export type Layout = typeof layout
