/**
 * ROUTE  /plans   —   M06-S01 · Our Plans — the hub, and the Plans tab
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/PlansHubScreen.tsx
 *   Every word on screen  src/copy/plans.ts
 *   What it remembers     src/state/plansStore.ts
 *   Sample content        src/sample/plans.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M06-S01 = module 06, screen 01) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
export { PlansHubScreen as default } from '@/modules/module-06-plans/screens/PlansHubScreen'
