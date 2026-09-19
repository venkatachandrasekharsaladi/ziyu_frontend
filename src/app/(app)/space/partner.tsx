/**
 * ROUTE  /space/partner   —   M05-S25 · Space → Partner & Connection
 *
 * WHAT THIS FILE IS: a route, not a screen. See `/space/index.tsx`.
 *
 * REACHED FROM: Space -> Our Identity -> the partner's card.
 *
 * NOT to be confused with `/settings/partner`, which is the account-level
 * pairing screen this one's "Manage Connection" button opens.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/PartnerConnectionScreen.tsx
 *   Every word on screen  src/copy/spacePartner.ts
 *   What it remembers     src/state/relationshipStore.ts, src/state/storyStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { PartnerConnectionScreen as default } from '@/modules/module-05-profile/screens/PartnerConnectionScreen'
