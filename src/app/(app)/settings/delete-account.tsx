/**
 * ROUTE  /settings/delete-account   —   M05-S24 · Settings → Delete Account
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * REACHED FROM: Profile tab -> the red "Delete Account" row at the bottom
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/DeleteAccountScreen.tsx
 *   Every word on screen  src/copy/settingsDeleteAccount.ts
 *   What it remembers     src/state/preferencesStore.ts
 *                         src/state/relationshipStore.ts
 *                         src/state/spaceStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? The ID above (M05-S10 = module 05, screen 10) is permanent and
 * greppable. The fastest way to find any screen: grep src/copy/ for a
 * sentence you can read on it.
 */
export { DeleteAccountScreen as default } from '@/modules/module-05-profile/screens/DeleteAccountScreen'
