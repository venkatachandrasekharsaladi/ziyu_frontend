/**
 * ROUTE  /plans/capsules/new   —   M06-S07 · Sealing a time capsule
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * ONE ROUTE FOR THREE STEPS AND A CONFIRMATION. The wizard is local state inside
 * the screen — see its header for why none of the steps is its own URL.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/CapsuleCreateScreen.tsx
 *   Every word on screen  src/copy/capsules.ts
 *   What it remembers     src/state/plansStore.ts  (only the sealed capsule)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { CapsuleCreateScreen as default } from '@/modules/module-06-plans/screens/CapsuleCreateScreen'
