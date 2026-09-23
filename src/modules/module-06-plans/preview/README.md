# Alternate itinerary design — a showcase you can keep or bin

This folder holds a SECOND design for the trip itinerary, built from Figma
`Tales of Two` / `New Features` / **3482:965** ("Our Paris Adventure").

The shipped itinerary is `3482:15` ("Our Little Adventure"), at
`/plans/trip`. The two frames are the same screen drawn twice — 3482:965 is the
earlier, wireframe-grey iteration. It is rebuilt here **in the app's own colour
tokens** rather than in its original greys, so the two can be compared as
designs instead of as fidelities.

It exists to be shown to people and then kept or deleted. Nothing else in the
app depends on it.

## Where it is

- Route: **`/plans/trip/preview`**
- Way in: a chip labelled "Alternate design" at the foot of `/plans/trip`

## To hide it (keep the code)

Set the flag in `previewFlag.ts`:

```ts
export const SHOW_ITINERARY_PREVIEW = false
```

The chip disappears. The route still resolves if typed directly, which is
convenient for showing someone without the rest of the app advertising it.

## To delete it for good — 3 steps

1. Delete this folder:
   `src/modules/module-06-plans/preview/`
2. Delete the route:
   `src/app/(app)/plans/trip/preview.tsx`
3. In `src/modules/module-06-plans/screens/TripItineraryScreen.tsx`, delete the
   two blocks marked:
   `── ALTERNATE DESIGN PREVIEW ──`
   (one import near the top, one JSX block near the bottom). Both are fenced in
   comments saying exactly that.

Then `npx tsc --noEmit` and `npx jest` — both should be clean. Nothing else
references this folder.

## Why the copy lives here, not in `src/copy/`

House convention puts screen copy in `src/copy/`. This folder deliberately
breaks that rule so that "delete the design" is one folder and not a hunt across
the tree. The moment this design is adopted rather than discarded, its copy
should move to `src/copy/tripItineraryPreview.ts` and this note should go with
it.
