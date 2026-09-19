/**
 * ROUTE  /space/assistant-preferences   —   M05-S34 · Space → Assistant Preferences
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> LoveOS Assistant.
 *
 * SIBLING: `/space/assistant` grants the assistant's standing permissions
 * behind a save. This page tunes its voice and how often it speaks, and lands
 * each change where it is tapped.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/AssistantPreferencesScreen.tsx
 *   Every word on screen  src/copy/spaceAssistantPreferences.ts
 *   What it remembers     src/state/preferencesStore.ts  (the `assistant*` keys)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { AssistantPreferencesScreen as default } from '@/modules/module-05-profile/screens/AssistantPreferencesScreen'
