import { act, screen, userEvent } from '@testing-library/react-native'

import { PLANS_COPY } from '@/copy/plans'
import { NextAdventureCard } from '@/modules/module-06-plans/components/NextAdventureCard'
import { SAMPLE_TRIP } from '@/sample/plans'
import type { Trip } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

/*
 * WHAT THE SEEDED CARD SHOULD SAY, derived from `@/sample/plans` rather than
 * written down as literals — the same rule `PlansHubScreen.test.tsx` follows.
 * The sample trip is still being edited; a test holding "3 saved spots" as a
 * string would go red the next time a moment is added to the itinerary, which
 * is not a regression in this card.
 *
 * TWO COUNTS, because the card uses two and they are not the same question.
 *
 * PLANNED — every moment on every day — is what decides WHETHER there is a plan
 * to show. SAVED_SPOTS counts only moments the couple actually saved, and is
 * what the card REPORTS. They are equal on a trip where everything is saved and
 * differ on the seeded sample, where nothing is: the card used to print PLANNED
 * under the words "saved spots" and so announced three saves that had never
 * happened. Deriving both here is what keeps that fix pinned.
 *
 * Neither is `trip.momentsPlanned`, which the type documents as a target the
 * couple chooses rather than a count of what exists.
 */
const PLANNED = SAMPLE_TRIP.days.reduce((count, day) => count + day.moments.length, 0)

const SAVED_SPOTS = SAMPLE_TRIP.days.reduce(
  (count, day) => count + day.moments.filter((moment) => moment.saved).length,
  0,
)

/** "MAY 14 – MAY 17, 2027 · PARIS, FRANCE" — uppercased by the card, not the data. */
const WHEN_AND_WHERE = `${SAMPLE_TRIP.dateRange} · ${SAMPLE_TRIP.destination}`.toUpperCase()

/** "0 saved spots · Open itinerary" — the footnote under the trip title. */
const SPOTS_LINE = `${PLANS_COPY.savedSpots(SAVED_SPOTS)} · ${PLANS_COPY.openItinerary}`

/** The accessible name the card builds when there IS a trip to open. */
const PLAN_NAME = `${SAMPLE_TRIP.title}. ${PLANS_COPY.openItinerary}`

/**
 * A trip with days but nothing planned in them.
 *
 * Emptied day by day rather than replaced with `days: []`, because that is the
 * state the app can genuinely reach: `createTrip` keeps the sample's day
 * scaffold and only carries the draft's answers across. Keeping the title and
 * the destination on it also proves the card decides on MOMENTS — not on
 * whether a trip record exists — which is the whole reason the empty state can
 * co-exist with a seeded store.
 */
const NOTHING_PLANNED: Trip = {
  ...SAMPLE_TRIP,
  days: SAMPLE_TRIP.days.map((day) => ({ ...day, moments: [] })),
}

beforeEach(() => {
  mockPush.mockClear()
  // Bare, not wrapped in `act()` — with nothing yet mounted, wrapping it leaves
  // the renderer root empty on the next `render`. `ChatHome.test.tsx` has the
  // full story on why; every sibling suite in this module does the same.
  usePlansStore.getState().reset()
})

describe('NextAdventureCard — with a trip the couple has planned', () => {
  it('names the trip, where it goes and when', async () => {
    await renderScreen(<NextAdventureCard />)

    expect(screen.getByText(SAMPLE_TRIP.title)).toBeTruthy()
    // Date range and destination are one line in the design, so they are
    // asserted as one string: two separate `getByText`s would still pass if
    // the card drew them as two stacked eyebrows, which is not what it does.
    expect(screen.getByText(WHEN_AND_WHERE)).toBeTruthy()
    expect(screen.getByText(SPOTS_LINE)).toBeTruthy()
  })

  it('wears the plans kicker, uppercased by the card rather than by the copy', async () => {
    await renderScreen(<NextAdventureCard />)

    // `PLANS_COPY.kicker` is sentence case so the same words can be read as
    // prose elsewhere; the badge is typography, and does the shouting itself.
    expect(screen.getByText(PLANS_COPY.kicker.toUpperCase())).toBeTruthy()
  })

  it('says none of the invitation copy while there is something to open', async () => {
    await renderScreen(<NextAdventureCard />)

    // The two states are exclusive. A card showing both would be telling the
    // couple they have a trip and inviting them to start one in the same breath.
    expect(screen.queryByText(PLANS_COPY.noTrip.heading)).toBeNull()
    expect(screen.queryByText(PLANS_COPY.noTrip.lede)).toBeNull()
    expect(screen.queryByText(PLANS_COPY.noTrip.action)).toBeNull()
  })

  it('is a button named for the trip, not for the card', async () => {
    await renderScreen(<NextAdventureCard />)

    // Title AND what pressing does. "Next adventure" alone would announce the
    // component; the trip's name is what a screen-reader user is deciding about.
    expect(screen.getByRole('button', { name: PLAN_NAME })).toBeTruthy()
  })

  it('opens the plans hub, where the rest of the cluster is', async () => {
    const user = userEvent.setup()
    await renderScreen(<NextAdventureCard />)

    await user.press(screen.getByRole('button', { name: PLAN_NAME }))

    // The hub rather than the itinerary: the card is the way INTO the cluster,
    // and the bingo board, promises, capsules and letters all live one tap on
    // from there.
    expect(mockPush).toHaveBeenCalledWith('/(app)/plans')
    expect(mockPush).toHaveBeenCalledTimes(1)
  })
})

describe('NextAdventureCard — with nothing planned yet', () => {
  beforeEach(() => {
    usePlansStore.setState({ trip: NOTHING_PLANNED })
  })

  it('invites the couple to plan something instead of printing an empty trip', async () => {
    await renderScreen(<NextAdventureCard />)

    expect(screen.getByText(PLANS_COPY.noTrip.heading)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.noTrip.lede)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.noTrip.action)).toBeTruthy()
  })

  it('drops the trip it has no moments for, title and all', async () => {
    await renderScreen(<NextAdventureCard />)

    // `NOTHING_PLANNED` still carries the sample's title, destination and date
    // range. None of it may show: a trip named and dated with nothing in it
    // reads as a plan the couple has not actually made.
    expect(screen.queryByText(SAMPLE_TRIP.title)).toBeNull()
    expect(screen.queryByText(WHEN_AND_WHERE)).toBeNull()
    expect(screen.queryByText(SPOTS_LINE)).toBeNull()
  })

  it('renames itself for the invitation rather than announcing an absent trip', async () => {
    await renderScreen(<NextAdventureCard />)

    // The label is the state. The two states look completely different on
    // screen, so a single fixed name would leave a screen-reader user with no
    // way to tell an itinerary from an invitation.
    expect(screen.getByRole('button', { name: PLANS_COPY.noTrip.action })).toBeTruthy()
    expect(screen.queryByRole('button', { name: PLAN_NAME })).toBeNull()
  })

  it('goes to the setup form, not to the hub', async () => {
    const user = userEvent.setup()
    await renderScreen(<NextAdventureCard />)

    await user.press(screen.getByRole('button', { name: PLANS_COPY.noTrip.action }))

    // The destination is the POINT of the second state. The hub would answer
    // "Plan something together" by showing the couple the same invitation a
    // second time; the form is the first thing they can actually do.
    expect(mockPush).toHaveBeenCalledWith('/(app)/plans/trip/new')
    expect(mockPush).not.toHaveBeenCalledWith('/(app)/plans')
  })

  it('still wears the plans kicker, so the card keeps its identity when empty', async () => {
    await renderScreen(<NextAdventureCard />)

    // The badge changes ground — scrim over a photo, soft lavender on the bare
    // card — but never its words. Only the colours are allowed to move.
    expect(screen.getByText(PLANS_COPY.kicker.toUpperCase())).toBeTruthy()
  })
})

describe('NextAdventureCard — reading the store live', () => {
  it('turns into the invitation the moment the last plan goes', async () => {
    await renderScreen(<NextAdventureCard />)

    expect(screen.getByText(SAMPLE_TRIP.title)).toBeTruthy()

    // Inside `act()` here, unlike the `reset()` in `beforeEach`: the card is
    // mounted and subscribed, so this is a state change React has to flush.
    await act(async () => {
      usePlansStore.setState({ trip: NOTHING_PLANNED })
    })

    // The card subscribes to `state.trip` rather than reading a count that was
    // computed once at mount, so emptying the itinerary from anywhere in the
    // app changes what Home says — no remount, no stale trip left on screen.
    expect(screen.queryByText(SAMPLE_TRIP.title)).toBeNull()
    expect(screen.getByText(PLANS_COPY.noTrip.heading)).toBeTruthy()
    expect(screen.getByRole('button', { name: PLANS_COPY.noTrip.action })).toBeTruthy()
  })

  it('takes a plan back the moment one is made', async () => {
    usePlansStore.setState({ trip: NOTHING_PLANNED })

    await renderScreen(<NextAdventureCard />)

    expect(screen.getByText(PLANS_COPY.noTrip.heading)).toBeTruthy()

    // The reverse direction, because a card that only ever degrades would pass
    // the test above while being stuck on the empty state forever — which is
    // exactly what the couple would hit after finishing the setup form.
    await act(async () => {
      usePlansStore.setState({ trip: SAMPLE_TRIP })
    })

    expect(screen.queryByText(PLANS_COPY.noTrip.heading)).toBeNull()
    expect(screen.getByText(SAMPLE_TRIP.title)).toBeTruthy()
    expect(screen.getByText(SPOTS_LINE)).toBeTruthy()
  })

  it('counts the moments rather than trusting the trip to report them', async () => {
    // `momentsPlanned` is a stored figure the type explicitly documents as NOT
    // derived from `days`. If the card believed it, a trip claiming seven
    // planned moments over four empty days would print an itinerary the couple
    // never wrote — so the card is pinned to the days themselves.
    usePlansStore.setState({
      trip: { ...NOTHING_PLANNED, momentsPlanned: 7, momentsTotal: 7 },
    })

    await renderScreen(<NextAdventureCard />)

    expect(screen.getByText(PLANS_COPY.noTrip.heading)).toBeTruthy()
    expect(screen.queryByText(SAMPLE_TRIP.title)).toBeNull()
  })
})
