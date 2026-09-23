/**
 * ROUTE  /plans/watch   —   M06-S11 · Watch Together
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * NEEDS A DEV CLIENT. This screen renders a real `expo-video` player, which is a
 * native module — `expo start` into Expo Go will not load it. Run
 * `npm run android` / `npm run ios` once after pulling.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/WatchTogetherScreen.tsx
 *   Every word on screen  src/copy/watchTogether.ts
 *   Sample content        src/sample/plans.ts  (SAMPLE_WATCH_ROOM, and the
 *                         stream URL that has to be replaced before shipping)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { WatchTogetherScreen as default } from '@/modules/module-06-plans/screens/WatchTogetherScreen'
