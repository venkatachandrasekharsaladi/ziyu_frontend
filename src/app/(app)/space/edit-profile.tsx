/**
 * ROUTE  /space/edit-profile   —   M05-S29 · Space → Edit My Profile
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Our Identity -> your own card.
 *
 * NOT the same as `/settings/personal-details`, which edits the SAME profile
 * record plus email and phone. Both write `relationshipStore.profile`.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/EditMyProfileScreen.tsx
 *   Every word on screen  src/copy/spaceEditProfile.ts
 *   What it remembers     src/state/relationshipStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { EditMyProfileScreen as default } from '@/modules/module-05-profile/screens/EditMyProfileScreen'
