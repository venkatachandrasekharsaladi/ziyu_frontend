/**
 * ROUTE  /plans/trip/generating   —   M06-S13 · Building the plan
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * Takes the draft as QUERY PARAMS (`destination`, `nights`, `budget`, `styles`)
 * rather than reading a half-finished trip out of the store — see the screen's
 * header for why.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/TripGeneratingScreen.tsx
 *   Every word on screen  src/copy/planner.ts
 *   What it actually does  src/services/planner/mock.ts
 *   The contract to build  src/services/planner/types.ts   ← hand this to the backend
 *   The bulk data          src/sample/plannerCatalogue.ts  ← deleted when the backend lands
 */
export { TripGeneratingScreen as default } from '@/modules/module-06-plans/screens/TripGeneratingScreen'
