/**
 * ROUTE  /space/keep-private   —   M05-S33 · Space → Keep Our Space Private
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Space Preferences.
 *
 * SIBLING: `/space/privacy` makes four promises and offers no controls; this
 * page makes three and puts the assistant's access level under the last one.
 * `/settings/privacy` holds the switches both of them talk about.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/KeepOurSpacePrivateScreen.tsx
 *   Every word on screen  src/copy/spaceKeepPrivate.ts
 *   What it remembers     src/state/preferencesStore.ts  (assistantAccess)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { KeepOurSpacePrivateScreen as default } from '@/modules/module-05-profile/screens/KeepOurSpacePrivateScreen'
