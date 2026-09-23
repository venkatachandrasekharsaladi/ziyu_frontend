/**
 * ROUTE  /plans/places   —   M06-S12 · Where we are (shared places)
 *
 * WHAT THIS FILE IS: a route, not a screen. See `(app)/home.tsx` for the rule.
 *
 * NEEDS A DEV CLIENT on native — the map is `expo-maps`, a native module, and
 * Android additionally needs a Google Maps API key in `app.json` before tiles
 * render. The web build renders a stand-in instead; see `SharedMap.web.tsx`.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-06-plans/screens/SharedPlacesScreen.tsx
 *   The map itself        src/modules/module-06-plans/components/SharedMap.tsx
 *                         (+ SharedMap.web.tsx for the web build)
 *   Every word on screen  src/copy/sharedPlaces.ts
 *   What it remembers     src/state/plansStore.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { SharedPlacesScreen as default } from '@/modules/module-06-plans/screens/SharedPlacesScreen'
