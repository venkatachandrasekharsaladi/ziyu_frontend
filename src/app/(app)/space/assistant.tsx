/**
 * ROUTE  /space/assistant   —   M05-S28 · Space → LoveOS Assistant
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Space Preferences.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/LoveOsAssistantScreen.tsx
 *   Every word on screen  src/copy/spaceAssistant.ts
 *   What it remembers     src/state/preferencesStore.ts  (the `assistant*` keys)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { LoveOsAssistantScreen as default } from '@/modules/module-05-profile/screens/LoveOsAssistantScreen'
