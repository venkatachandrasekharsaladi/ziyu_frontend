/**
 * ROUTE  /profile   —   M05-S01 · Profile tab — this IS the settings hub
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/SettingsHomeScreen.tsx
 *   Every word on screen  src/copy/settingsAppearance.ts
 *                         src/copy/settingsHome.ts
 *                         src/copy/settingsLanguage.ts
 *   What it remembers     src/state/relationshipStore.ts
 *                         src/state/spaceStore.ts
 *                         src/state/storyStore.ts
 *                         src/state/preferencesStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M05-S10 = module 05, screen 10) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
export { SettingsHomeScreen as default } from '@/modules/module-05-profile/screens/SettingsHomeScreen'
