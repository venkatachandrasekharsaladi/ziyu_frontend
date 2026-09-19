/**
 * ROUTE  /space   —   M05-S20 · Space (tab hub)
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * REACHED FROM: the Space tab, last stop on the bottom bar. This replaced
 * Profile as that tab's destination — the settings list it used to open is
 * still at `/settings`, now behind the cog in this screen's header.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/SpaceHomeScreen.tsx
 *   Every word on screen  src/copy/spaceHome.ts
 *   What it remembers     src/state/relationshipStore.ts, src/state/storyStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M05-S20 = module 05, screen 20) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
export { SpaceHomeScreen as default } from '@/modules/module-05-profile/screens/SpaceHomeScreen'
