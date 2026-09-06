/**
 * MOTION TOKENS — durations, easing curves and spring presets.
 *
 * This group exists for the same reason `layout.ts` does: the numbers were
 * already in the app, just scattered and un-agreed. `PressableScale` carried
 * `{ damping: 20, stiffness: 320 }` inline, `PhotoMessage` and `PhotoCarousel`
 * each picked their own `transition={150}`, `FeedbackBanner` and
 * `TypingIndicator` each timed themselves independently. Nothing was wrong
 * individually; collectively there was no answer to "how fast does this app
 * move?", so every new animation invented one.
 *
 * PLAIN DATA ONLY — no `react-native-reanimated` import.
 *
 * Tokens are consumed through the theme, and the theme is walked by
 * `theme.parity.test.ts` (which flattens it looking for strings) and mocked
 * wholesale under Jest. A live `Easing.bezier(...)` here would put a function
 * in that tree and couple the design system to an animation library it should
 * not know about. Curves are therefore the four cubic-bezier control points,
 * and the consumer builds the real easing:
 *
 *     Easing.bezier(...theme.motion.curve.standard)
 *
 * RULE: nothing outside `themes/` imports this file — same rule as every
 * other token group. Components read `theme.motion.*`.
 *
 * REDUCE MOTION is not expressed here. A duration token cannot know whether
 * the user asked for less movement; that is a runtime question, and every
 * consumer answers it the way `PressableScale` already does — with
 * Reanimated's `useReducedMotion()`. These are the values for when motion is
 * wanted, not a decision about whether it is.
 */

/**
 * How long things take, in milliseconds.
 *
 * Deliberately few. Five steps is enough to build a hierarchy and few enough
 * that picking one is obvious; a twelve-step ramp just recreates the problem
 * of everyone choosing differently.
 */
export const duration = {
  /**
   * A state flip that must not read as animated — a checkbox, a toggle's
   * colour. Long enough to avoid a jarring snap, short enough that nobody
   * perceives a transition.
   */
  instant: 100,
  /** Press feedback and small fades. The floor for anything a finger triggers. */
  fast: 160,
  /**
   * THE default. Content entering, a sheet rising, a banner arriving. When
   * there is no reason to choose otherwise, this is the one.
   */
  base: 240,
  /** Screen-level transitions, where the whole surface is moving. */
  slow: 320,
  /**
   * Once-per-session moments that are allowed to be seen — the splash
   * handoff, a celebration. Anything recurring at this speed becomes a wait.
   */
  deliberate: 480,
} as const

/**
 * Cubic-bezier control points, as `[x1, y1, x2, y2]`.
 *
 * Spread into `Easing.bezier(...)` at the call site — see the header note on
 * why these are data rather than built curves.
 */
export const curve = {
  /**
   * The default. Accelerates out, decelerates in — the curve almost every
   * in-place change should use.
   */
  standard: [0.2, 0, 0, 1],
  /**
   * Entering. Starts fast and settles, so arriving content feels handed to
   * the user rather than dragged in.
   */
  decelerate: [0, 0, 0, 1],
  /**
   * Leaving. Starts slow and accelerates away — the mirror of `decelerate`,
   * and why an exit should never simply reverse an entrance's curve.
   */
  accelerate: [0.3, 0, 1, 1],
} as const

/**
 * Spring presets, as Reanimated `withSpring` configs.
 *
 * Springs, not durations, wherever a finger is involved: a spring can be
 * interrupted mid-flight and re-target without a visible jump, which is what
 * makes a fast double-tap feel responsive instead of queued.
 */
export const spring = {
  /**
   * Press feedback. Lifted verbatim from `PressableScale`, which tuned it
   * first — this group is where it now lives, not a new value that quietly
   * disagrees with the one already shipping.
   */
  press: { damping: 20, stiffness: 320 },
  /** Content settling into place after a layout change. A little more travel. */
  settle: { damping: 18, stiffness: 180 },
  /** Large surfaces — a sheet, a screen. Slow enough to read as weight. */
  gentle: { damping: 24, stiffness: 120 },
} as const

export const motion = { duration, curve, spring } as const

export type Motion = typeof motion
