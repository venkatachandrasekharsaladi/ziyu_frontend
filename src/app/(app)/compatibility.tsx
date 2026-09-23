/**
 * ROUTE  /compatibility   —   Compatibility — the stars-and-facts screen behind the Home card
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-02-home/screens/CompatibilityScreen.tsx
 *   Every word on screen  src/copy/compatibility.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { CompatibilityScreen as default } from '@/modules/module-02-home/screens/CompatibilityScreen'
