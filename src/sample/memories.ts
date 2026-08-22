import type { WithPhotos } from '@/modules/module-03-memories/photos'

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
 * Photos are seeded `picsum.photos` URLs: stable, deterministic, and no
 * invented asset IDs that would 404.
 */
const photo = (seed: string, w = 800, h = 1000) =>
  `https://picsum.photos/seed/loveos-${seed}/${w}/${h}`

export const SAMPLE_MEMORIES: WithPhotos[] = [
  {
    id: 'sample-rome-coffee',
    photos: [
      photo('rome-coffee'),
      photo('rome-coffee-2'),
      photo('rome-coffee-3'),
    ],
    title: 'Coffee, sunshine, and nowhere to be.',
    date: '2023-10-14',
    caption: 'Rome · Oct 14, 2023',
    location: 'Rome',
    photoUri: photo('rome-coffee'),
    note: 'You ordered for both of us in terrible Italian and it worked.',
    tags: ['Us', 'Dates'],
    favorite: true,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-paris-notre-dame',
    photos: [
      photo('paris'),
      photo('paris-2'),
      photo('paris-3'),
      photo('paris-4'),
    ],
    title: 'First time seeing the Eiffel Tower.',
    date: '2023-08-14',
    caption: 'Paris',
    location: 'Paris',
    photoUri: photo('paris'),
    tags: ['Trips', 'Us'],
    favorite: true,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-coast-trip',
    photos: [
      photo('coast'),
      photo('coast-2'),
      photo('coast-3'),
    ],
    title: 'Our first trip to the coast, 2021',
    date: '2021-06-19',
    caption: 'The one where we missed the last train back.',
    location: 'Amalfi',
    photoUri: photo('coast'),
    tags: ['Trips'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-plane-snacks',
    title: '"Plane snacks were 10/10."',
    date: '2023-08-14',
    caption: 'Chandu ate all the Biscoff cookies before we even took off.',
    tags: ['Trips', 'Little Things'],
    favorite: false,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-night-market',
    photos: [
      photo('market'),
      photo('market-2'),
    ],
    title: 'The night market that never closed.',
    date: '2023-09-12',
    location: 'Bangkok',
    photoUri: photo('market'),
    tags: ['Trips'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-street-laugh',
    title: 'Caught mid-laugh.',
    date: '2024-05-02',
    caption: 'Yesterday',
    photoUri: photo('street-laugh'),
    tags: ['Us'],
    favorite: false,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-flowers',
    title: 'Because it was a Tuesday.',
    date: '2024-04-28',
    photoUri: photo('flowers', 600, 600),
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
    addedBy: 'Sarah',
  },
  {
    id: 'sample-coffee-shop-note',
    title: '"Can’t believe it’s been exactly 1,394 days since we first met at that terrible coffee shop."',
    date: '2024-04-26',
    tags: ['Us'],
    favorite: false,
    addedBy: 'Chandu',
  },
  {
    id: 'sample-birthday-candles',
    title: 'Twenty-nine, and still terrible at blowing out candles.',
    date: '2023-11-02',
    photoUri: photo('candles'),
    tags: ['Birthdays'],
    favorite: false,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-first-date',
    title: 'The beginning of everything.',
    date: '2022-04-16',
    caption: 'Apr 16, 2022',
    photoUri: photo('first-date'),
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
    photoUri: photo('picnic'),
    tags: ['Dates'],
    favorite: false,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-pasta-night',
    title: 'First time making pasta from scratch together. Flour everywhere.',
    date: '2022-10-14',
    location: 'Apartment 4B',
    tags: ['Us', 'Little Things'],
    favorite: true,
    addedBy: 'Sarah',
  },
  {
    id: 'sample-rainy-coffees',
    title: 'Rainy day coffees.',
    date: '2021-10-14',
    photoUri: photo('rainy-coffees'),
    tags: ['Dates'],
    favorite: false,
    addedBy: 'Chandu',
  },
]
