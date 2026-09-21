import { samplePhoto } from '@/sample/photos'
import type {
  Capsule,
  LifetimeList,
  Letter,
  SharedPlacesState,
  Trip,
  WatchRoom,
  YearBoard,
} from '@/services/plans/types'

/**
 * UI-ONLY SAMPLE CONTENT for the "Our Plans" cluster — Figma `Tales of Two`,
 * page `New Features` (3483:4729).
 *
 * Every string below is READ OFF A FRAME, not invented. The designs are unusually
 * written — "Leave some room for getting wonderfully lost", "Now it has somewhere
 * to wait" — and that voice is most of what the screens are. Paraphrasing it
 * would have quietly replaced the product's tone with mine, so where a frame
 * draws a sentence, that sentence is here verbatim.
 *
 * The couple is Chandu & Sarah throughout, because that is who the frames name.
 * Screens prefer `relationshipStore` wherever it holds a real name and fall back
 * here only when it is empty — the same rule `SAMPLE_HOME` follows.
 *
 * Two frames disagree on the trip's name: the hub (3482:3155) calls it "Our Paris
 * Adventure" and the refined itinerary (3482:15) calls it "Our Little Adventure".
 * The hub wins here, on the grounds that it is the index and names the thing
 * twice while the itinerary names it once.
 */

/* ------------------------------------------------------------------ *
 * TRIP — 3482:374 (setup) and 3482:15 (itinerary)
 * ------------------------------------------------------------------ */

export const SAMPLE_TRIP: Trip = {
  id: 'trip-paris-2027',
  title: 'Our Paris Adventure',
  destination: 'Paris, France',
  dateRange: 'May 14 – May 17, 2027',
  coverUri: samplePhoto('parisDusk', 900, 600),
  nights: 4,
  travellers: 2,
  budgetBand: 500,
  estimatedCost: 485,
  currency: '£',
  styles: ['romantic', 'foodie', 'culture'],
  // "3 of 7 moments planned · 43%" — see the field comment on `Trip`.
  momentsPlanned: 3,
  momentsTotal: 7,
  days: [
    {
      id: 'day-1',
      number: 1,
      title: 'First steps together',
      subtitle: 'Friday, May 14 — Slow morning arrival and Montmartre',
      moments: [
        {
          id: 'm-1-1',
          time: '09:30 AM',
          slot: 'Morning',
          title: 'Breakfast at a charming sidewalk café',
          description:
            'Quiet corner table at Le Chien qui Fume. Fresh warm pain au chocolat, café crème, and watching the morning cobblestone street wake up.',
          cost: '£24 for two',
          photoUri: samplePhoto('cafeInterior', 800, 520),
          photoCaption: 'Montmartre, 9:40 am',
          saved: false,
        },
        {
          id: 'm-1-2',
          time: '02:15 PM',
          slot: 'Afternoon',
          title: 'Walk through secret Montmartre',
          description:
            'Wander through the quiet back alleys behind Sacré-Cœur, vintage vinyl stalls, and ivy-covered stone walls.',
          cost: 'Free · Priceless',
          photoUri: samplePhoto('parisDay', 800, 520),
          photoCaption: '2.5 km gentle walking',
          saved: false,
        },
        {
          id: 'm-1-3',
          time: '07:30 PM',
          slot: 'Sunset moment',
          title: 'Sunset picnic overlooking Paris',
          description:
            'Linen blanket, fresh baguette, soft cheese, and two glasses of pinot noir on the Montmartre overlook as the Eiffel tower lights shimmer.',
          cost: '£52',
          photoUri: samplePhoto('embraceSunset', 800, 520),
          photoCaption: 'Golden hour highlight',
          saved: false,
        },
      ],
    },
    {
      id: 'day-2',
      number: 2,
      title: 'Seine moments',
      subtitle: 'Saturday, May 15 — Booksellers, bridges and a long lunch',
      moments: [],
    },
    {
      id: 'day-3',
      number: 3,
      title: 'Rooms & starlight',
      subtitle: 'Sunday, May 16 — Galleries in the morning, rooftops after dark',
      moments: [],
    },
    {
      id: 'day-4',
      number: 4,
      title: 'Until next time',
      subtitle: 'Monday, May 17 — One last coffee before the train',
      moments: [],
    },
  ],
}

/** The pinned idea card at the foot of the itinerary. Figma draws it in italic. */
export const SAMPLE_TRIP_IDEA = {
  label: 'One little idea from Tales of Two',
  quote: "Leave some room for getting wonderfully lost. The best memories aren't on the schedule.",
  attribution: 'Tales of Two Intelligence · Paris Co-pilot',
} as const

/** "Add a little something" — the five chips under the timeline. */
export const SAMPLE_TRIP_EXTRAS = [
  { key: 'surprise', icon: 'gift', label: 'Surprise date' },
  { key: 'photo', icon: 'camera', label: 'Photo moment' },
  { key: 'letter', icon: 'mail', label: 'Letter to open later' },
  { key: 'memory', icon: 'bookmark', label: 'Memory to create' },
  { key: 'challenge', icon: 'award', label: 'Couple challenge' },
] as const

/* ------------------------------------------------------------------ *
 * OUR YEAR TOGETHER — 3482:1345
 * ------------------------------------------------------------------ */

export const SAMPLE_YEAR_BOARD: YearBoard = {
  year: 2027,
  encouragement: "You're making a pretty good year together.",
  daysRemaining: 284,
  tiles: [
    { id: 'y-1', number: 1, title: 'Watch the sunrise', note: 'Jan 1 · Shoreline', state: 'done' },
    { id: 'y-2', number: 2, title: 'Cook a meal neither made', note: 'Truffle gnocchi', state: 'done' },
    { id: 'y-3', number: 3, title: 'Spontaneous day trip', note: 'Planning Saturday', state: 'in-progress' },
    { id: 'y-4', number: 4, title: 'Write letters to each other', note: 'Sealed Feb 14', state: 'done' },
    { id: 'y-5', number: 5, title: 'Try a new restaurant', note: 'Le Petit Vendôme', state: 'done' },
    { id: 'y-6', number: 6, title: 'Have a phone-free evening', note: 'Candlelit moonlit night', state: 'todo' },
    { id: 'y-7', number: 7, title: 'Take a silly photo booth strip', note: null, state: 'done' },
    { id: 'y-8', number: 8, title: 'Create a shared playlist', note: 'Favourite center', state: 'in-progress' },
    { id: 'y-9', number: 9, title: 'Visit somewhere neither has been', note: null, state: 'todo' },
    { id: 'y-10', number: 10, title: 'Dance in the kitchen', note: null, state: 'done' },
    { id: 'y-11', number: 11, title: 'Plant something and keep it alive', note: null, state: 'in-progress' },
    { id: 'y-12', number: 12, title: 'Write our year in one sentence', note: null, state: 'todo' },
    { id: 'y-13', number: 13, title: 'Watch a sunset from somewhere high', note: null, state: 'done' },
    { id: 'y-14', number: 14, title: 'Send a postcard home', note: null, state: 'done' },
    { id: 'y-15', number: 15, title: 'Learn to make one perfect dish', note: null, state: 'todo' },
    { id: 'y-16', number: 16, title: 'Spend a whole day outside', note: null, state: 'todo' },
    { id: 'y-17', number: 17, title: 'Reread our first messages', note: null, state: 'todo' },
    { id: 'y-18', number: 18, title: 'Take a train with no destination', note: null, state: 'todo' },
    { id: 'y-19', number: 19, title: 'Make breakfast in bed', note: null, state: 'todo' },
    { id: 'y-20', number: 20, title: 'Frame one photograph', note: null, state: 'todo' },
    { id: 'y-21', number: 21, title: 'Go somewhere just for the drive', note: null, state: 'todo' },
    { id: 'y-22', number: 22, title: 'Swim somewhere cold', note: null, state: 'todo' },
    { id: 'y-23', number: 23, title: 'Host dinner for the people we love', note: null, state: 'todo' },
    { id: 'y-24', number: 24, title: 'Do nothing at all, on purpose', note: null, state: 'todo' },
    { id: 'y-25', number: 25, title: 'Write next year’s first tile', note: null, state: 'todo' },
  ],
}

/* ------------------------------------------------------------------ *
 * ONCE IN A LIFETIME — 3482:1672
 * ------------------------------------------------------------------ */

export const SAMPLE_LIFETIME: LifetimeList = {
  target: 50,
  lastCompleted: 'Sunrise in Amalfi',
  promises: [
    /* Travel — 2 of 4 lived */
    {
      id: 'p-t1',
      category: 'travel',
      title: 'See the Northern Lights',
      detail: 'Tromsø, Norway · January 14, 2026',
      lived: true,
      linkLabel: 'View Memory (8 photos & audio)',
      tag: null,
    },
    {
      id: 'p-t2',
      category: 'travel',
      title: 'Take a road trip with no fixed plan',
      detail: 'Just an open tank of petrol, an old cassette playlist, and wherever turns left.',
      lived: false,
      linkLabel: null,
      tag: 'Summer Wishlist',
    },
    {
      id: 'p-t3',
      category: 'travel',
      title: 'Watch the sunrise somewhere beautiful',
      detail: 'Positano Cliffside · June 22, 2025',
      lived: true,
      linkLabel: "View Memory (Sarah's favourite morning)",
      tag: null,
    },
    {
      id: 'p-t4',
      category: 'travel',
      title: 'Visit a country neither of us has been to',
      detail: 'Starting completely fresh where neither person knows the street corners.',
      lived: false,
      linkLabel: null,
      tag: 'Idea: Japan in Autumn',
    },

    /* Adventure — 1 of 4 lived */
    {
      id: 'p-a1',
      category: 'adventure',
      title: 'Take a hot-air balloon ride',
      detail: 'Floating in silent golden hour light over Cappadocia or the English countryside.',
      lived: false,
      linkLabel: null,
      tag: null,
    },
    {
      id: 'p-a2',
      category: 'adventure',
      title: 'Sleep under the stars',
      detail: 'Brecon Beacons Dark Sky Reserve · August 2025',
      lived: true,
      linkLabel: 'Chandu whispered a promise at 2 AM',
      tag: null,
    },
    {
      id: 'p-a3',
      category: 'adventure',
      title: 'Go skydiving',
      detail: 'Holding hands on the edge of the aircraft cabin before jumping together.',
      lived: false,
      linkLabel: null,
      tag: null,
    },
    {
      id: 'p-a4',
      category: 'adventure',
      title: 'Dive somewhere extraordinary',
      detail: 'Warm blue silence and coral kingdoms below the waves.',
      lived: false,
      linkLabel: null,
      tag: null,
    },

    /* Romance — 3 of 4 lived */
    {
      id: 'p-r1',
      category: 'romance',
      title: 'Recreate our first date',
      detail: 'Same corner table, same nervous laughs · October 14, 2025',
      lived: true,
      linkLabel: 'View Timeline Milestone',
      tag: null,
    },
    {
      id: 'p-r2',
      category: 'romance',
      title: 'Write letters to our future selves',
      detail: 'Sealed in our 2027 Time Capsule · December 2025',
      lived: true,
      linkLabel: 'Sealed until Sept 2027',
      tag: null,
    },
    {
      id: 'p-r3',
      category: 'romance',
      title: 'Have dinner somewhere unforgettable',
      detail: 'Candlelight over Florence rooftops · June 2025',
      lived: true,
      linkLabel: 'View Memory',
      tag: null,
    },
    {
      id: 'p-r4',
      category: 'romance',
      title: 'Renew our promises to each other',
      detail: 'Somewhere barefoot and breezy, with only the tide listening.',
      lived: false,
      linkLabel: null,
      tag: null,
    },

    /* Life — 1 of 4 lived */
    {
      id: 'p-l1',
      category: 'life',
      title: 'Build something together',
      detail: 'Our tiny balcony herb garden & reading nook · Spring 2025',
      lived: true,
      linkLabel: 'Balcony Album',
      tag: null,
    },
    {
      id: 'p-l2',
      category: 'life',
      title: 'Learn a new skill together',
      detail: 'Pottery wheel throwing or making fresh pasta from scratch.',
      lived: false,
      linkLabel: null,
      tag: null,
    },
    {
      id: 'p-l3',
      category: 'life',
      title: 'Volunteer somewhere meaningful',
      detail: 'Spending a Saturday giving love to rescue animals together.',
      lived: false,
      linkLabel: null,
      tag: null,
    },
    {
      id: 'p-l4',
      category: 'life',
      title: 'Create something that lasts',
      detail: 'A shared photo book, an engraved bench, or planting a tree.',
      lived: false,
      linkLabel: null,
      tag: null,
    },

    /* Wild & Wonderful — 1 of 3 lived */
    {
      id: 'p-w1',
      category: 'wild',
      title: 'Take a completely spontaneous trip',
      detail: 'Booked at noon, in Cornwall by dinner · May 2025',
      lived: true,
      linkLabel: 'Cornwall Getaway',
      tag: null,
    },
    {
      id: 'p-w2',
      category: 'wild',
      title: 'Do something neither of us has ever done',
      detail: 'Both being total beginners at the exact same second.',
      lived: false,
      linkLabel: null,
      tag: null,
    },
    {
      id: 'p-w3',
      category: 'wild',
      title: 'Say yes to a completely unexpected adventure',
      detail: "Trusting each other's spontaneous glance across a crowded room.",
      lived: false,
      linkLabel: null,
      tag: null,
    },
  ],
}

/* ------------------------------------------------------------------ *
 * TIME CAPSULES — 3482:2146
 * ------------------------------------------------------------------ */

export const SAMPLE_CAPSULES: Capsule[] = [
  {
    id: 'cap-1',
    title: 'To us, one year from now',
    createdAt: '2026-09-17',
    opensAt: '2027-09-17',
    sealedBy: 'both',
    sealNote: 'To us on our third anniversary: remember how soft this afternoon felt.',
    contents: { photos: 3, letter: 2, promise: 1, memory: 4 },
    vaultCode: 'TOT-2027-CS',
    opened: false,
  },
  {
    id: 'cap-2',
    title: 'Before our next adventure',
    createdAt: '2026-12-01',
    opensAt: '2027-12-01',
    sealedBy: 'both',
    sealNote: 'For Paris & Alps trip',
    contents: { photos: 2, letter: 1, memory: 2, prediction: 1 },
    vaultCode: 'TOT-2027-PA',
    opened: false,
  },
]

/** Step 1 of the creation flow — the six kinds, with the sub-labels Figma draws. */
export const SAMPLE_CAPSULE_KINDS = [
  { kind: 'photos', icon: 'image', label: 'Photos', hint: '5 memories attached' },
  { kind: 'letter', icon: 'mail', label: 'A letter', hint: 'Written by Sarah' },
  { kind: 'memory', icon: 'book-open', label: 'A memory', hint: 'Link a story milestone' },
  { kind: 'prediction', icon: 'compass', label: 'A prediction', hint: '"Where will we be?"' },
  { kind: 'promise', icon: 'heart', label: 'A promise', hint: 'A quiet vow to keep' },
  { kind: 'question', icon: 'help-circle', label: 'A question for us', hint: 'Ask our future selves' },
] as const

/* ------------------------------------------------------------------ *
 * LETTERS — 3483:4305
 * ------------------------------------------------------------------ */

export const SAMPLE_LETTERS: Letter[] = [
  {
    id: 'l-004',
    number: 4,
    title: 'For the day you need a little reminder',
    from: 'partner',
    to: 'me',
    writtenAt: '2026-09-17',
    opensAt: '2026-10-14',
    state: 'sealed',
    teaser:
      "Written late on our balcony when Paris was sleeping, containing a memory we haven't talked about yet and one quiet promise.",
    // Sealed, so no body. See the field comment on `Letter`.
    body: null,
    writtenIn: 'Paris',
    photoUri: null,
    photoCaption: null,
  },
  {
    id: 'l-005',
    number: 5,
    title: 'Read this before you take off',
    from: 'partner',
    to: 'me',
    writtenAt: '2026-08-02',
    opensAt: '2026-08-02',
    state: 'ready',
    teaser:
      'A tucked-away note with a photograph from terminal 2, sealed with love before our departure gate opened.',
    body: null,
    writtenIn: null,
    photoUri: null,
    photoCaption: null,
  },
  {
    id: 'l-003',
    number: 3,
    title: 'New Year, Same Hand in Mine',
    from: 'partner',
    to: 'me',
    writtenAt: '2026-01-01',
    opensAt: '2026-01-01',
    state: 'opened',
    teaser: 'From Sarah to Chandu',
    body: 'Another year, and still the same hand in mine. That is the whole letter, really.',
    writtenIn: null,
    photoUri: null,
    photoCaption: null,
  },
  {
    id: 'l-002',
    number: 2,
    title: 'Morning in Positano',
    from: 'partner',
    to: 'me',
    writtenAt: '2026-06-22',
    opensAt: '2026-06-22',
    state: 'opened',
    teaser: 'From Sarah to Chandu',
    body: 'You were still asleep and the sea was already loud. I wanted you to know I watched it without you, and it was better later, with you.',
    writtenIn: 'Positano',
    photoUri: null,
    photoCaption: null,
  },
  {
    id: 'l-001',
    number: 1,
    title: 'The day we chose us',
    from: 'me',
    to: 'partner',
    writtenAt: '2024-10-14',
    opensAt: '2024-10-14',
    state: 'opened',
    teaser: 'From Chandu to Sarah',
    body: 'We did not decide it all at once. We decided it on a Tuesday, quietly, and then again every day after.',
    writtenIn: null,
    photoUri: null,
    photoCaption: null,
  },
]

/**
 * The one fully written letter — the "RECIPIENT EXPERIENCE" panel of 3483:4305.
 *
 * Kept apart from `SAMPLE_LETTERS` because it is the OPENED form of `l-004`,
 * which the list holds in its sealed form. The reading screen swaps to this
 * once the wax seal is broken, which is the only moment a body should exist.
 */
export const SAMPLE_OPENED_LETTER: Letter = {
  ...SAMPLE_LETTERS[0],
  state: 'opened',
  photoUri: samplePhoto('cafeInterior', 700, 480),
  photoCaption: 'The café table where we promised each other forever. · PARIS · Sep 2026',
  body: [
    'My Sarah,',
    '',
    'If you are reading this, today is October 14th, and another year has quietly gathered around us.',
    '',
    'I wrote this in our little kitchen apartment near Saint-Paul while you were making tea in that blue ceramic mug. You didn’t notice me watching you, but the morning sun made everything feel unhurried, like we had finally caught up with ourselves.',
    '',
    'Whenever you feel like things are slipping out of hand or the noise of everything gets too loud, remember this afternoon. Remember how simple it was to sit across from each other with nowhere to be.',
    '',
    'Whatever changes, whatever adventures come next — this will always be your home.',
    '',
    'With everything I have,',
    'Chandu',
  ].join('\n'),
}

/** The composer's four sealing choices. Figma draws these exact four. */
export const SAMPLE_SEAL_OPTIONS = [
  { key: 'whenever', label: 'Whenever they wish' },
  { key: 'date', label: 'Oct 14, 2026' },
  { key: 'anniversary', label: 'On our 3rd Anniversary' },
  { key: 'pick', label: 'Pick specific date' },
] as const

/* ------------------------------------------------------------------ *
 * WATCH TOGETHER — 3482:2738
 * ------------------------------------------------------------------ */

export const SAMPLE_WATCH_ROOM: WatchRoom = {
  tonight: {
    id: 'w-notebook',
    title: 'The Notebook',
    year: 2004,
    meta: 'Romance · 2h 5m',
    posterUri: samplePhoto('heartLights', 400, 560),
    progress: 34,
    remaining: '1h 20m left',
  },
  pickedBy: 'partner',
  matchScore: 4.9,
  quote: 'The best love is the kind that awakens the soul and makes us reach for more.',
  synopsis:
    'An unforgettable story of enduring devotion between two lovers who find their way back to one another through time, letters, and seasons.',
  connected: true,
  position: '00:42:18',
  duration: '02:03:00',
  whispers: [
    {
      id: 'wh-1',
      from: 'partner',
      text: 'The rain scene always makes me think of our Paris walk 🌧',
      at: 'at 00:30:12',
    },
  ],
  queue: [
    {
      id: 'w-sunrise',
      title: 'Before Sunrise',
      year: 1995,
      meta: 'Romance · 1h 41m',
      posterUri: samplePhoto('cyclistsSunset', 400, 560),
      progress: 89,
      remaining: '10m left',
    },
    {
      id: 'w-abouttime',
      title: 'About Time',
      year: 2013,
      meta: 'Romance · 2h 3m',
      posterUri: samplePhoto('coffeeRain', 400, 560),
      progress: 20,
      remaining: '1h 40m left',
    },
  ],
  history: [
    {
      id: 'h-1',
      title: 'La La Land',
      detail: 'Watched on 28 Jan 2027 · Shared by Sarah',
      reactions: '😭 ❤️ (loved the ending)',
    },
    {
      id: 'h-2',
      title: 'Midnight in Paris',
      detail: 'Watched on 12 Jan 2027 · Trip Inspiration',
      reactions: '🎬 (Added to Paris itinerary)',
    },
    {
      id: 'h-3',
      title: 'Interstellar',
      detail: "Watched on 31 Dec 2026 · New Year's Eve",
      reactions: '😭 (Cried at the docking scene)',
    },
  ],
}

/**
 * The stream the shared player actually plays.
 *
 * A PUBLIC TEST CLIP, not a film. Google's gtv-videos bucket is the canonical
 * sample asset for video players and is served over HTTPS with CORS open, so it
 * works on native and on the web build alike. The screen around it says "The
 * Notebook" because that is what the frame says; the pixels are Big Buck Bunny,
 * because shipping a real film would be a licensing problem and a 2GB one.
 *
 * Replace with the couple's real source — or a rights-cleared catalogue — before
 * this goes anywhere near a user.
 */
export const SAMPLE_WATCH_STREAM =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

/** The "KEEPSAKE BRIDGE" card under the player. */
export const SAMPLE_WATCH_KEEPSAKE = {
  label: 'Keepsake bridge',
  heading: "Tonight's little memory",
  lede: 'Save this shared evening directly into your relationship timeline.',
  title: 'The Notebook · 14 Feb 2027',
  detail: 'Watched together across London & Zurich · 2 hours synced',
  action: 'Add to Memories',
  footer: 'Another one for our story.',
  alternate: 'Watch something else',
} as const

/* ------------------------------------------------------------------ *
 * SHARED PLACES — 3482:2499
 * ------------------------------------------------------------------ */

export const SAMPLE_PLACES: SharedPlacesState = {
  area: 'London · Central Soho & Strand',
  me: {
    who: 'me',
    name: 'Chandu',
    detail: 'Soho · 78% battery',
    // Soho, London.
    coordinate: { latitude: 51.5136, longitude: -0.1365 },
    battery: 78,
    activity: 'Standing still',
    updatedMinutesAgo: 8,
  },
  partner: {
    who: 'partner',
    name: 'Sarah is on Neal Street',
    detail: 'Covent Garden · Heading towards you',
    // Neal Street, Covent Garden.
    coordinate: { latitude: 51.5142, longitude: -0.1253 },
    battery: 84,
    activity: 'Walking (3 min)',
    updatedMinutesAgo: 0,
  },
  distanceLabel: '3.2 km apart · 12 min',
  activeWindow: '1h',
  minutesRemaining: 48,
  expiresAtLabel: 'Expiring at 10:30',
}

/** The meetup pin Figma draws between the two people. */
export const SAMPLE_MEETUP = {
  name: 'Monmouth Coffee',
  walkLabel: '2 min walk',
  coordinate: { latitude: 51.5139, longitude: -0.1301 },
} as const
