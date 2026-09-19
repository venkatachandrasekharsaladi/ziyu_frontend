/**
 * ROUTE  /space/welcome   —   M05-S30 · Space → not personalized yet
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: nothing links here. `/space` renders this same screen itself
 * when the pair have not named their space and have not dismissed the offer;
 * this route exists so the state can be opened and reviewed on its own.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/SpaceWelcomeScreen.tsx
 *   Every word on screen  src/copy/spaceWelcome.ts
 *   What it remembers     src/state/spaceStore.ts  (personalizePromptDismissed)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { SpaceWelcomeScreen as default } from '@/modules/module-05-profile/screens/SpaceWelcomeScreen'
