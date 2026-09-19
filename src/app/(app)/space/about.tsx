/**
 * ROUTE  /space/about   —   M05-S35 · Space → About Our Space
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Space Preferences.
 *
 * NOT `/settings/about`, which is the app's version-and-credits page. This one
 * is about the couple's space: how long, how many memories, when it started.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/AboutOurSpaceScreen.tsx
 *   Every word on screen  src/copy/spaceAbout.ts
 *   What it remembers     src/state/storyStore.ts, src/services/memories
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { AboutOurSpaceScreen as default } from '@/modules/module-05-profile/screens/AboutOurSpaceScreen'
