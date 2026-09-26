import { create } from 'zustand'

import {
  SAMPLE_CAPSULES,
  SAMPLE_LETTERS,
  SAMPLE_LIFETIME,
  SAMPLE_PLACES,
  SAMPLE_TRIP,
  SAMPLE_YEAR_BOARD,
} from '@/sample/plans'
import type {
  BingoTileState,
  Capsule,
  CapsuleDraft,
  Letter,
  LetterDraft,
  PromiseCategory,
  ShareWindow,
  SharedPromise,
  Trip,
  TripDraft,
  YearBoard,
} from '@/services/plans/types'

/**
 * EVERYTHING THE "OUR PLANS" CLUSTER REMEMBERS.
 *
 * One store, for the same reason there is one service: these features read each
 * other. The hub counts sealed capsules and waiting letters; sealing a letter
 * has to change a number on a card the user has already seen. Seven stores would
 * have meant the hub subscribing to seven of them.
 *
 * NOTHING PERSISTS. Like `relationshipStore`, this is in-memory only — there is
 * no provider to write to yet, and a half-finished capsule surviving a reload
 * would be a promise the app cannot keep. `reset()` exists for tests.
 *
 * Seeded from `@/sample/plans` rather than starting empty, which is the opposite
 * of what `memoriesService` does. The difference is deliberate: a new couple
 * genuinely has no memories, so that screen's empty state is the honest first
 * view. These screens are a DESIGN being built ahead of a backend, and an empty
 * bingo board shows none of what the design is. When the backend lands, the seed
 * becomes `[]` and the empty states — which are built and tested — take over.
 */

type PlansState = {
  trip: Trip
  yearBoard: YearBoard
  promises: SharedPromise[]
  lifetimeTarget: number
  capsules: Capsule[]
  letters: Letter[]

  /** Which day of the itinerary is selected. 1-based. */
  selectedDay: number

  /** Location sharing — the only feature here with a live/off state. */
  sharingWindow: ShareWindow | null
  minutesRemaining: number

  /* --- trips --- */
  selectDay: (number: number) => void
  toggleMomentSaved: (momentId: string) => void
  createTrip: (draft: TripDraft) => void
  /**
   * Replaces the trip wholesale with one the planner built.
   *
   * Separate from `createTrip`, which only carries a draft's answers onto the
   * existing sample trip. This one takes a finished `Trip` — days, moments,
   * costs and all — because the planner composed it and there is nothing left
   * to merge. `selectedDay` resets so the couple lands on day one of the plan
   * they just watched being written, not on whatever day they were reading
   * before.
   */
  setGeneratedTrip: (trip: Trip) => void
  /** The couple's own choice of cover photo, from `CoverPhotoField`. */
  setTripCover: (uri: string) => void

  /* --- year board --- */
  cycleTile: (tileId: string) => void

  /* --- lifetime --- */
  togglePromiseLived: (promiseId: string) => void
  addPromise: (input: { title: string; detail: string; category: PromiseCategory }) => void

  /* --- capsules --- */
  sealCapsule: (draft: CapsuleDraft) => Capsule

  /* --- letters --- */
  sealLetter: (draft: LetterDraft) => Letter
  openLetter: (letterId: string) => void

  /* --- places --- */
  setSharingWindow: (window: ShareWindow | null) => void

  reset: () => void
}

/** The seed, rebuilt on every `reset()` so tests never share mutated arrays. */
const seed = () => ({
  trip: structuredClone(SAMPLE_TRIP),
  yearBoard: structuredClone(SAMPLE_YEAR_BOARD),
  promises: structuredClone(SAMPLE_LIFETIME.promises),
  lifetimeTarget: SAMPLE_LIFETIME.target,
  capsules: structuredClone(SAMPLE_CAPSULES),
  letters: structuredClone(SAMPLE_LETTERS),
  selectedDay: 1,
  sharingWindow: SAMPLE_PLACES.activeWindow,
  minutesRemaining: SAMPLE_PLACES.minutesRemaining,
})

/**
 * A bingo tile cycles rather than toggles.
 *
 * The board draws three states, not two, and the middle one ("in progress", the
 * amber card) is the one the design spends its accent colour on. A checkbox
 * would have made it unreachable by tapping.
 */
const NEXT_TILE_STATE: Record<BingoTileState, BingoTileState> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export const usePlansStore = create<PlansState>((set, get) => ({
  ...seed(),

  selectDay: (number) => set({ selectedDay: number }),

  toggleMomentSaved: (momentId) =>
    set((state) => ({
      trip: {
        ...state.trip,
        days: state.trip.days.map((day) => ({
          ...day,
          moments: day.moments.map((moment) =>
            moment.id === momentId ? { ...moment, saved: !moment.saved } : moment,
          ),
        })),
      },
    })),

  createTrip: (draft) =>
    set((state) => ({
      // The generated plan keeps the sample's days — there is no planner to run,
      // and inventing empty days would make "Create our plan" look broken. What
      // the draft genuinely decides is carried across.
      trip: {
        ...state.trip,
        destination: draft.destination,
        nights: draft.nights,
        budgetBand: draft.budgetBand,
        styles: draft.styles,
      },
      selectedDay: 1,
    })),

  setGeneratedTrip: (trip) => set({ trip, selectedDay: 1 }),

  setTripCover: (uri) => set((state) => ({ trip: { ...state.trip, coverUri: uri } })),

  cycleTile: (tileId) =>
    set((state) => ({
      yearBoard: {
        ...state.yearBoard,
        tiles: state.yearBoard.tiles.map((tile) =>
          tile.id === tileId ? { ...tile, state: NEXT_TILE_STATE[tile.state] } : tile,
        ),
      },
    })),

  togglePromiseLived: (promiseId) =>
    set((state) => ({
      promises: state.promises.map((promise) =>
        promise.id === promiseId ? { ...promise, lived: !promise.lived } : promise,
      ),
    })),

  addPromise: ({ title, detail, category }) =>
    set((state) => ({
      promises: [
        ...state.promises,
        {
          id: `p-own-${state.promises.length + 1}`,
          category,
          title,
          detail,
          lived: false,
          linkLabel: null,
          tag: 'Ours',
        },
      ],
    })),

  sealCapsule: (draft) => {
    const capsule: Capsule = {
      id: `cap-${get().capsules.length + 1}`,
      title: 'A capsule for us',
      createdAt: new Date().toISOString().slice(0, 10),
      opensAt: draft.opensAt,
      sealedBy: 'both',
      sealNote: draft.sealNote.trim() || null,
      contents: Object.fromEntries(draft.kinds.map((kind) => [kind, 1])),
      vaultCode: `TOT-${draft.opensAt.slice(0, 4)}-CS`,
      opened: false,
    }

    set((state) => ({ capsules: [capsule, ...state.capsules] }))

    return capsule
  },

  sealLetter: (draft) => {
    const letters = get().letters
    const letter: Letter = {
      id: `l-${String(letters.length + 1).padStart(3, '0')}`,
      number: Math.max(...letters.map((l) => l.number)) + 1,
      title: draft.title.trim(),
      from: 'me',
      to: draft.to,
      writtenAt: new Date().toISOString().slice(0, 10),
      opensAt: draft.opensAt ?? new Date().toISOString().slice(0, 10),
      // A letter with no date is readable the moment it is written, so it is
      // `ready`, not `sealed`. "Whenever they wish" is a choice not to seal.
      state: draft.opensAt ? 'sealed' : 'ready',
      teaser: draft.body.trim().slice(0, 120),
      body: draft.body,
      writtenIn: null,
      photoUri: null,
      photoCaption: null,
    }

    set({ letters: [letter, ...letters] })

    return letter
  },

  openLetter: (letterId) =>
    set((state) => ({
      letters: state.letters.map((letter) =>
        letter.id === letterId ? { ...letter, state: 'opened' } : letter,
      ),
    })),

  setSharingWindow: (window) =>
    set({
      sharingWindow: window,
      minutesRemaining: window === '1h' ? 60 : window === 'tonight' ? 480 : 0,
    }),

  reset: () => set({ ...seed() }),
}))

/* ------------------------------------------------------------------ *
 * DERIVED READS
 *
 * Selectors rather than stored counts. Every one of these is a fact ABOUT the
 * state, so storing it would mean two places that can disagree — and the hub is
 * where they would visibly disagree first.
 * ------------------------------------------------------------------ */

/**
 * Spots the couple has actually SAVED — not every moment in the plan.
 *
 * `ItineraryMoment.saved` is a real flag with a real control behind it (the
 * "Save" / "Saved to Plans" toggle on `MomentCard`). Counting `moments.length`
 * instead made the hub and the Home card both announce "3 saved spots" over a
 * trip where nothing had been saved, which is the app telling the couple they
 * did something they did not do.
 *
 * A shared selector rather than the same reduce written twice — that duplication
 * is how the two screens disagreed in the first place.
 */
export const selectSavedSpots = (state: PlansState) =>
  state.trip.days.reduce(
    (count, day) => count + day.moments.filter((moment) => moment.saved).length,
    0,
  )

/** Days that have anything planned in them at all. */
export const selectPlannedDays = (state: PlansState) =>
  state.trip.days.filter((day) => day.moments.length > 0).length

/** Every moment in the plan, saved or not — what "is there a plan" means. */
export const selectPlannedMoments = (state: PlansState) =>
  state.trip.days.reduce((count, day) => count + day.moments.length, 0)

export const selectTilesStamped = (state: PlansState) =>
  state.yearBoard.tiles.filter((tile) => tile.state === 'done').length

export const selectTilesInProgress = (state: PlansState) =>
  state.yearBoard.tiles.filter((tile) => tile.state === 'in-progress').length

export const selectPromisesLived = (state: PlansState) =>
  state.promises.filter((promise) => promise.lived).length

export const selectSealedCapsules = (state: PlansState) =>
  state.capsules.filter((capsule) => !capsule.opened).length

/** Letters addressed to the user that they have not read yet. */
export const selectWaitingLetters = (state: PlansState) =>
  state.letters.filter((letter) => letter.to === 'me' && letter.state !== 'opened').length
