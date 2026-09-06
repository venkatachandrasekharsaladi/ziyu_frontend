import type { WithPhotos } from '@/modules/module-03-memories/photos'
import { samplePhoto, samplePhotoSquare } from '@/sample/photos'

/**
 * UI-ONLY SAMPLE CONTENT — Figma `Ziyu`, Memories Page + Home Dashboard.
 *
 * The app's own principle is that numbers are computed and nothing is invented
 * (see `services/memories/mock.ts`, whose seed is empty by default). That
 * principle is suspended HERE and only here, deliberately: the UI is being
 * built before the backend, and a library with no content cannot show the
 * albums, the polaroids or the "On this day" row that the design is made of.
 *
 * Nothing in this directory is imported by `services/`. When a real provider
 * lands, delete `src/sample/` and the fallbacks that reference it — every
 * consumer already prefers live data when it exists.
 *
 * Photos come from `@/sample/photos` — a small catalogue of hand-verified
 * Unsplash photos, chosen so each memory's photo actually matches its
 * caption. This used to build `picsum.photos/seed/loveos-<subject>` URLs
 * instead: the seeds read like they meant something, but picsum does not
 * search — it hashes the seed to an arbitrary photo, blind to the subject.
 * That is how "Coffee, sunshine, and nowhere to be." ended up over a
 * landscape. See `@/sample/photos` for the full story.
 */

export const SAMPLE_MEMORIES: WithPhotos[] = [
  {
    id: 'sample-rome-coffee',
    photos: [
      samplePhoto('coffeeTable'),
      samplePhoto('coffeeToast'),
      samplePhoto('cafeInterior'),
    ],
    title: 'Coffee, sunshine, and nowhere to be.',
    date: '2023-10-14',
    caption: 'Rome · Oct 14, 2023',
    location: 'Rome',
    photoUri: samplePhoto('coffeeTable'),
    note: 'You ordered for both of us in terrible Italian and it worked.',
    tags: ['Us', 'Dates'],
    favorite: true,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-paris-notre-dame',
    photos: [
      samplePhoto('parisDusk'),
      samplePhoto('parisDay'),
      samplePhoto('parisDusk'),
      samplePhoto('parisDay'),
    ],
    title: 'First time seeing the Eiffel Tower.',
    date: '2023-08-14',
    caption: 'Paris',
    location: 'Paris',
    photoUri: samplePhoto('parisDusk'),
    tags: ['Trips', 'Us'],
    favorite: true,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-coast-trip',
    photos: [
      samplePhoto('coastSunset'),
      samplePhoto('coastPalm'),
      samplePhoto('coastSunset'),
    ],
    title: 'Our first trip to the coast, 2021',
    date: '2021-06-19',
    caption: 'The one where we missed the last train back.',
    location: 'Amalfi',
    photoUri: samplePhoto('coastSunset'),
    tags: ['Trips'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-plane-snacks',
    title: '"Plane snacks were 10/10."',
    date: '2023-08-14',
    caption: 'Chandu ate all the Biscoff cookies before we even took off.',
    photoUri: samplePhoto('planeWing'),
    tags: ['Trips', 'Little Things'],
    favorite: false,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-night-market',
    photos: [
      samplePhoto('market'),
      samplePhoto('market'),
    ],
    title: 'The night market that never closed.',
    date: '2023-09-12',
    location: 'Bangkok',
    photoUri: samplePhoto('market'),
    tags: ['Trips'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-street-laugh',
    title: 'Caught mid-laugh.',
    date: '2024-05-02',
    caption: 'Yesterday',
    photoUri: samplePhoto('caughtLaughing'),
    tags: ['Us'],
    favorite: false,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-flowers',
    title: 'Because it was a Tuesday.',
    date: '2024-04-28',
    photoUri: samplePhotoSquare('flowers', 600),
    tags: ['Little Things'],
    favorite: true,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-rain-note',
    title: '"Listen to this rain..."',
    date: '2024-04-27',
    caption: 'Voice note',
    tags: ['Little Things'],
    favorite: false,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-coffee-shop-note',
    title: '"Can’t believe it’s been exactly 1,394 days since we first met at that terrible coffee shop."',
    date: '2024-04-26',
    photoUri: samplePhoto('cafeInterior'),
    tags: ['Us'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-birthday-candles',
    title: 'Twenty-nine, and still terrible at blowing out candles.',
    date: '2023-11-02',
    photoUri: samplePhoto('birthdayPlate'),
    tags: ['Birthdays'],
    favorite: false,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-first-date',
    title: 'The beginning of everything.',
    date: '2022-04-16',
    caption: 'Apr 16, 2022',
    photoUri: samplePhoto('heartHands'),
    note: 'Neither of us wanted to go home.',
    tags: ['Us', 'Dates'],
    favorite: true,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-picnic',
    title: 'A memory worth keeping.',
    date: '2023-07-15',
    caption: 'Coffee, sunshine, and nowhere to be. Rome · Oct 14, 2023',
    location: 'Italy',
    photoUri: samplePhoto('coffeeToast'),
    tags: ['Dates'],
    favorite: false,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-pasta-night',
    title: 'First time making pasta from scratch together. Flour everywhere.',
    date: '2022-10-14',
    location: 'Apartment 4B',
    photoUri: samplePhoto('cookingTogether'),
    tags: ['Us', 'Little Things'],
    favorite: true,
    addedBy: 'Sweatcha',
  },
  {
    id: 'sample-rainy-coffees',
    title: 'Rainy day coffees.',
    date: '2021-10-14',
    photoUri: samplePhoto('coffeeRain'),
    tags: ['Dates'],
    favorite: false,
    addedBy: 'Chandu',
  },
]
