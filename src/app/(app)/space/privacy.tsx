/**
 * ROUTE  /space/privacy   —   M05-S26 · Space → Privacy Details
 *
 * WHAT THIS FILE IS: a route, not a screen. See `/space/index.tsx`.
 *
 * REACHED FROM: Space -> Space Preferences, and the Keep Our Space Private
 * card. NOT the same as `/settings/privacy`, which holds the switches this
 * page only makes promises about.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/PrivacyDetailsScreen.tsx
 *   Every word on screen  src/copy/spacePrivacy.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { PrivacyDetailsScreen as default } from '@/modules/module-05-profile/screens/PrivacyDetailsScreen'
