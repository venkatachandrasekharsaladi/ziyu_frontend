/**
 * ROUTE  /space/edit-partner   —   M05-S31 · Space → Edit Partner Details
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Our Identity -> their card, and from Partner &
 * Connection -> "Edit Partner Details".
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/EditPartnerDetailsScreen.tsx
 *   Every word on screen  src/copy/spaceEditPartner.ts
 *   What it remembers     src/state/relationshipStore.ts (partner),
 *                         src/state/storyStore.ts (keyDates.partnerBirthday)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { EditPartnerDetailsScreen as default } from '@/modules/module-05-profile/screens/EditPartnerDetailsScreen'
