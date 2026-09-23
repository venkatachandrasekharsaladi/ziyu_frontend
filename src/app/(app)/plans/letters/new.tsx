/**
 * ROUTE  /plans/letters/new   —   M06-S09 · The letter composer
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * `new.tsx` sits beside `[id].tsx` and wins the match, because Expo Router
 * prefers a static segment over a dynamic one. Without that rule this URL would
 * open the reading screen looking for a letter whose id is the word "new".
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/LetterComposeScreen.tsx
 *   Every word on screen  src/copy/letters.ts
 *   What it remembers     src/state/plansStore.ts  (only the sealed letter)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { LetterComposeScreen as default } from '@/modules/module-06-plans/screens/LetterComposeScreen'
