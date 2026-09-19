/**
 * ROUTE  /space/identity   —   M05-S21 · Space → Our Identity
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: the Space hub -> "Our Identity".
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/OurIdentityScreen.tsx
 *   Every word on screen  src/copy/spaceIdentity.ts
 *   What it remembers     src/state/relationshipStore.ts, src/state/storyStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * The board's refined frame ships as `OurIdentityRefinedScreen` at
 * `/space/identity-refined`. That screen's doc comment says why it is the
 * alternate rather than this route's screen.
 */
export { OurIdentityScreen as default } from '@/modules/module-05-profile/screens/OurIdentityScreen'
