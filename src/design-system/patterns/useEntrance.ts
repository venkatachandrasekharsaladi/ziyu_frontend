import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated'
import { useUnistyles } from 'react-native-unistyles'

/**
 * The entering/exiting animations this app uses, built from `theme.motion`.
 *
 * A HOOK, not a module of constants, for one reason: token groups may only be
 * read through the theme (`nothing outside themes/ imports tokens` — the rule
 * `tokens/layout.ts` and every sibling states). Reading `theme.motion` needs
 * `useUnistyles`, so this has to be a hook.
 *
 * WHY THESE ARE SHARED: before this, the app had exactly zero entering
 * animations — verified, not assumed. Every transient surface (a sheet, a
 * context menu, a reply strip) simply appeared. Adding motion ad hoc per
 * component is how an app ends up with four different fade durations, which
 * is the same problem `tokens/motion.ts` was created to stop.
 *
 * REDUCE MOTION: every animation here carries
 * `.reduceMotion(ReduceMotion.System)`. Per Reanimated's accessibility guide,
 * that makes entering and layout animations jump instantly to their endpoint
 * and omits exiting animations entirely when the user has the OS setting on.
 * It is applied here, once, rather than left to each call site to remember —
 * a missed `reduceMotion` is invisible to everyone who does not have the
 * setting enabled, which is the worst kind of bug to leave discoverable only
 * by the people it hurts.
 *
 * WEB/JEST: Reanimated is fully mocked under Jest (`jest.setup.js` calls
 * `setUpTests()`), so these resolve to inert objects in tests. Nothing here
 * is load-bearing for behaviour — a screen must render and function
 * identically with every animation stripped, which is what lets the existing
 * suite stay meaningful.
 */
export function useEntrance() {
  const { theme } = useUnistyles()
  const { duration, curve } = theme.motion

  // Built here rather than stored in tokens: `Easing.bezier` returns a
  // function, and the token tree has to stay plain data — see the header note
  // in `tokens/motion.ts` for why.
  const decelerate = Easing.bezier(...curve.decelerate)
  const accelerate = Easing.bezier(...curve.accelerate)

  return {
    /** Content that simply becomes present — a banner, a badge. */
    fade: FadeIn.duration(duration.base).easing(decelerate).reduceMotion(ReduceMotion.System),
    fadeOut: FadeOut.duration(duration.fast).easing(accelerate).reduceMotion(ReduceMotion.System),
    /**
     * Content that arrives from just below where it lands — a context menu, a
     * reply strip. The short travel is the point: it reads as the element
     * settling into place, not flying in.
     */
    rise: FadeInDown.duration(duration.base).easing(decelerate).reduceMotion(ReduceMotion.System),
    /**
     * A bottom sheet. `slow`, and a full slide rather than a fade — the whole
     * surface is moving and its weight is the message.
     */
    sheetIn: SlideInDown.duration(duration.slow).easing(decelerate).reduceMotion(ReduceMotion.System),
    sheetOut: SlideOutDown.duration(duration.base).easing(accelerate).reduceMotion(ReduceMotion.System),
  }
}
