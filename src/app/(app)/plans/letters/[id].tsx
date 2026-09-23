/**
 * ROUTE  /plans/letters/[id]   —   M06-S10 · Reading a letter
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * Genuinely dynamic, unlike `/plans/trip`: the vault holds a list and every
 * letter in it is its own destination.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/LetterReadScreen.tsx
 *   Every word on screen  src/copy/letters.ts
 *   What it remembers     src/state/plansStore.ts
 *   The written letter    src/sample/plans.ts  (SAMPLE_OPENED_LETTER)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { LetterReadScreen as default } from '@/modules/module-06-plans/screens/LetterReadScreen'
