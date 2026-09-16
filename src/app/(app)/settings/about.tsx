/**
 * ROUTE  /settings/about   —   M05-S23 · Settings → About
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * REACHED FROM: Profile tab -> About -> "About Tales of Two"
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/AboutScreen.tsx
 *   Every word on screen  src/copy/settingsAbout.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? Read CODEBASE.md at the repo root — it explains this layout,
 * what an ID like M05-S10 means, and how to find any screen in seconds.
 */
export { AboutScreen as default } from '@/modules/module-05-profile/screens/AboutScreen'
