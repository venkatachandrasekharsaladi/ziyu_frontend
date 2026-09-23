/**
 * TYPES for the "Our Plans" cluster — Figma `Tales of Two`, page `New Features`
 * (node 3483:4729).
 *
 * One service rather than seven. Every feature on that page answers the same
 * question — "what are we going to do together, and what did we promise each
 * other" — and they cross-reference constantly: the hub counts all of them, a
 * letter can be sealed inside a capsule, an itinerary moment can be saved as a
 * lifetime promise. Seven sibling services would have spent most of their code
 * importing each other.
 *
 * Everything here is FRONT-END ONLY. `mock.ts` is the single source of data and
 * there is no network call anywhere in this folder — the shapes below are what
 * a real API would have to return, written down now so the screens are built
 * against a contract rather than against a fixture.
 */

/** Who authored or owns a thing. The app has exactly two people in it. */
export type PartnerId = 'me' | 'partner'

/* ------------------------------------------------------------------ *
 * 1 · TRIPS — "Plan Something Together" (3482:374) and the itinerary
 *     it generates, "Our Little Adventure" (3482:15).
 * ------------------------------------------------------------------ */

/** The vibe chips on the setup screen. Figma draws these eight, pre-selected. */
export type TravelStyle =
  | 'relaxing'
  | 'adventure'
  | 'romantic'
  | 'foodie'
  | 'culture'
  | 'nature'
  | 'surprise'

/**
 * Budget is a BAND, not a number.
 *
 * The setup screen draws four chips — £100 / £250 / £500 / Flexible — and the
 * itinerary header prints "£480 (£120/day)". So the band is what the couple
 * picks and the total is what the plan costs; they are different values and
 * conflating them meant the header could not show both.
 */
export type BudgetBand = 100 | 250 | 500 | 'flexible'

/** One moment on a day's timeline. */
export type ItineraryMoment = {
  id: string
  /** "09:30 AM". Kept as a display string — no timezone maths on a mock. */
  time: string
  /** "MORNING" / "AFTERNOON" / "SUNSET MOMENT" — the uppercase eyebrow. */
  slot: string
  title: string
  description: string
  /**
   * "£24 for two", "Free · Priceless", "£32". A string because the design
   * prints prose as often as it prints a number.
   */
  cost: string
  /** Remote photo for the moment card. `null` renders the placeholder tile. */
  photoUri: string | null
  /** The caption pinned over the photo — "Montmartre, 9:40 am". */
  photoCaption?: string
  /** Whether the couple has saved this moment into their plans. */
  saved: boolean
}

export type ItineraryDay = {
  id: string
  /** 1-based. The day chips read "DAY 01". */
  number: number
  /** "First steps together" — the chip's subtitle and the section heading. */
  title: string
  /** "Friday, May 14 — Slow morning arrival and Montmartre" */
  subtitle: string
  moments: ItineraryMoment[]
}

export type Trip = {
  id: string
  /** "Our Little Adventure" */
  title: string
  /** "Paris, France" */
  destination: string
  /** "May 14 – May 17, 2027" — display string, as above. */
  dateRange: string
  /** Hero photograph. */
  coverUri: string | null
  nights: number
  travellers: number
  budgetBand: BudgetBand
  /** What the plan actually costs, in whole currency units. */
  estimatedCost: number
  currency: '£' | '$' | '€'
  styles: TravelStyle[]
  days: ItineraryDay[]
  /**
   * Deliberately NOT derived from `days`.
   *
   * The design says "3 of 7 moments planned · 43% — room for serendipity".
   * The denominator is how many moments the couple WANTS, which is a choice
   * they make, not a count of what exists yet.
   */
  momentsPlanned: number
  momentsTotal: number
}

/** What the setup screen collects before a trip exists. */
export type TripDraft = {
  destination: string
  nights: number
  budgetBand: BudgetBand
  styles: TravelStyle[]
}

/* ------------------------------------------------------------------ *
 * 2 · OUR YEAR TOGETHER — the couple bingo board (3482:1345).
 * ------------------------------------------------------------------ */

export type BingoTileState = 'todo' | 'in-progress' | 'done'

export type BingoTile = {
  id: string
  /** 1-based, printed in the tile's corner. */
  number: number
  title: string
  /** "Jan 1 · Shoreline", "Planning Saturday" — the stamp line. */
  note: string | null
  state: BingoTileState
}

export type YearBoard = {
  /** 2027 */
  year: number
  tiles: BingoTile[]
  /** "You're making a pretty good year together." */
  encouragement: string
  /** Days left in the year. The design prints 284. */
  daysRemaining: number
}

/* ------------------------------------------------------------------ *
 * 3 · ONCE IN A LIFETIME — shared promises (3482:1672).
 * ------------------------------------------------------------------ */

export type PromiseCategory = 'travel' | 'adventure' | 'romance' | 'life' | 'wild'

export type SharedPromise = {
  id: string
  category: PromiseCategory
  title: string
  /** The grey line under an unlived promise, or the place+date once lived. */
  detail: string
  lived: boolean
  /** "View Memory (8 photos & audio)" — the link shown on a lived promise. */
  linkLabel: string | null
  /** "Summer Wishlist", "Idea: Japan in Autumn" — the little tag chip. */
  tag: string | null
}

export type LifetimeList = {
  promises: SharedPromise[]
  /** The design's "8 of 50 experiences". Total is the couple's target. */
  target: number
  /** "Sunrise in Amalfi" */
  lastCompleted: string | null
}

/* ------------------------------------------------------------------ *
 * 4 · TIME CAPSULES — the sealed vault (3482:2146).
 * ------------------------------------------------------------------ */

/** What can go inside a capsule. The creation flow's step 1 offers these five. */
export type CapsuleItemKind = 'photos' | 'letter' | 'memory' | 'prediction' | 'promise' | 'question'

export type Capsule = {
  id: string
  /** "To us, one year from now" */
  title: string
  /** ISO date the capsule was created. */
  createdAt: string
  /** ISO date it may be opened. */
  opensAt: string
  /** Who sealed it. */
  sealedBy: PartnerId | 'both'
  /** The note written on the seal, shown before it opens. */
  sealNote: string | null
  /** Counts by kind, for the "SEALED INSIDE" strip. */
  contents: Partial<Record<CapsuleItemKind, number>>
  /** "TOT-2027-CS" — printed on the sealed confirmation. */
  vaultCode: string
  opened: boolean
}

/** What the 3-step creation flow collects. */
export type CapsuleDraft = {
  kinds: CapsuleItemKind[]
  opensAt: string
  sealNote: string
}

/* ------------------------------------------------------------------ *
 * 5 · LETTERS — the private couple vault (3483:4305).
 * ------------------------------------------------------------------ */

export type LetterState = 'sealed' | 'ready' | 'opened'

export type Letter = {
  id: string
  /** "No. 004" — printed on the card and at the top of the reading view. */
  number: number
  title: string
  from: PartnerId
  to: PartnerId
  /** ISO date written. */
  writtenAt: string
  /** ISO date it unseals. */
  opensAt: string
  state: LetterState
  /** The one-line teaser on a sealed card — never the letter itself. */
  teaser: string
  /**
   * Full text. `null` while sealed — and null on purpose: a sealed letter
   * whose body is sitting in the client is not sealed, it is merely hidden,
   * and the first person to open the debugger would find it.
   */
  body: string | null
  /** Where it was written — "Written in Paris". */
  writtenIn: string | null
  /** The enclosed photograph on the reading view. */
  photoUri: string | null
  photoCaption: string | null
}

/** What the composer collects. */
export type LetterDraft = {
  to: PartnerId
  title: string
  body: string
  /** ISO date, or `null` for "whenever they wish". */
  opensAt: string | null
}

/* ------------------------------------------------------------------ *
 * 6 · WATCH TOGETHER — the shared living room (3482:2738).
 * ------------------------------------------------------------------ */

export type WatchTitle = {
  id: string
  title: string
  year: number
  /** "Romance · 2h 5m" */
  meta: string
  posterUri: string | null
  /** 0–100. The design prints "89% FINISHED". */
  progress: number
  /** "20m left", "1h 40m left" */
  remaining: string | null
}

export type WatchHistoryEntry = {
  id: string
  title: string
  /** "Watched on 28 Jan 2027 · Shared by Sarah" */
  detail: string
  /** "😭 ❤️ (loved the ending)" — the reaction strip. */
  reactions: string
}

/** A note whispered during a synchronised session. */
export type Whisper = {
  id: string
  from: PartnerId
  text: string
  /** "at 00:30:12" — position in the film, not wall-clock time. */
  at: string
}

export type WatchRoom = {
  /** Tonight's pick, shown before a session starts. */
  tonight: WatchTitle
  /** Why it was picked — "Sarah's pick", and the match score. */
  pickedBy: PartnerId
  matchScore: number
  /** The quote under the title. */
  quote: string
  synopsis: string
  /** Whether the partner is currently connected. */
  connected: boolean
  /** Playback position and length, as display strings. */
  position: string
  duration: string
  whispers: Whisper[]
  queue: WatchTitle[]
  history: WatchHistoryEntry[]
}

/* ------------------------------------------------------------------ *
 * 7 · SHARED PLACES — "Where we are" (3482:2499).
 * ------------------------------------------------------------------ */

/** How long location stays shared. The design draws three durations. */
export type ShareWindow = '1h' | 'tonight' | 'until-off'

export type Coordinate = {
  latitude: number
  longitude: number
}

export type PartnerLocation = {
  who: PartnerId
  /** "Sarah is on Neal Street" */
  name: string
  /** "Covent Garden · Heading towards you" */
  detail: string
  coordinate: Coordinate
  /** 0–100. */
  battery: number
  /** "Walking (3 min)" */
  activity: string
  /** Minutes since the fix. */
  updatedMinutesAgo: number
}

export type SharedPlacesState = {
  /** "London · Central Soho & Strand" */
  area: string
  me: PartnerLocation
  partner: PartnerLocation
  /** "3.2 km apart · 12 min" */
  distanceLabel: string
  /** Null when nobody is sharing. */
  activeWindow: ShareWindow | null
  /** Minutes left on the current window. */
  minutesRemaining: number
  /** "EXPIRING AT 10:30" */
  expiresAtLabel: string
}

/* ------------------------------------------------------------------ *
 * 8 · THE HUB — "Our plans" (3482:3155).
 * ------------------------------------------------------------------ */

/** One card on the hub grid. The hub reads counts off every feature above. */
export type HubCard = {
  key: 'year' | 'lifetime' | 'capsules' | 'letters' | 'watch' | 'places'
  /** "Active Board", "Shared Promises", "Sealed Vault" — the corner chip. */
  chip: string
  title: string
  lede: string
  /** The one live figure the card reports, already phrased. */
  status: string
  /** The second, quieter line under it. */
  statusDetail: string | null
}

export type PlansOverview = {
  /** The trip pinned at the top — "NEXT UP · 10 DAYS AWAY". */
  nextTrip: Trip | null
  /** "12 waiting for us" */
  waitingCount: number
  cards: HubCard[]
}
