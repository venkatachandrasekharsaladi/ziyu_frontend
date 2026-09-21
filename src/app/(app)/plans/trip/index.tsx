/**
 * ROUTE  /plans/trip   —   M06-S03 · The itinerary
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * NOT `[id].tsx`. The couple has one trip in planning at a time — the hub pins
 * exactly one and `plansStore` holds exactly one — so a trip id in the URL would
 * be a parameter with a single possible value. It becomes `[id]` the day the
 * store holds a list.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/TripItineraryScreen.tsx
 *   Every word on screen  src/copy/trips.ts
 *   What it remembers     src/state/plansStore.ts
 *   Sample content        src/sample/plans.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { TripItineraryScreen as default } from '@/modules/module-06-plans/screens/TripItineraryScreen'
