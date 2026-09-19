/**
 * ROUTE  /home   —   M02-S01 · Home Dashboard — the first tab
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-02-home/screens/HomeDashboardScreen.tsx
 *   Every word on screen  src/copy/homeDashboard.ts
 *   What it remembers     src/state/spaceStore.ts
 *                         src/state/storyStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M05-S10 = module 05, screen 10) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
export { HomeDashboardScreen as default } from '@/modules/module-02-home/screens/HomeDashboardScreen'
