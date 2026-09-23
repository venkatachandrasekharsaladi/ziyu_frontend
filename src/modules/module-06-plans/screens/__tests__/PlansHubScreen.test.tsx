import { act, screen, userEvent } from '@testing-library/react-native'

import { PLANS_COPY } from '@/copy/plans'
import { PlansHubScreen } from '@/modules/module-06-plans/screens/PlansHubScreen'
import {
  SAMPLE_CAPSULES,
  SAMPLE_LETTERS,
  SAMPLE_LIFETIME,
  SAMPLE_PLACES,
  SAMPLE_TRIP,
  SAMPLE_WATCH_ROOM,
  SAMPLE_YEAR_BOARD,
} from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: jest.fn(), replace: mockReplace }),
}))

/*
 * THE FIGURES THE SEEDED HUB SHOULD PRINT, derived from `@/sample/plans` rather
 * than written down as literals. The sample is still being edited — a test that
 * hard-coded "8 of 25 stamped" would go red the next time the board gains a row,
 * which is not a regression in this screen. The arithmetic below belongs to the
 * SCREEN (`waiting` is its own sum); the counts belong to the selectors, which
 * `plansStore.test.ts` pins to the sample independently.
 */
const TILE_TOTAL = SAMPLE_YEAR_BOARD.tiles.length
const STAMPED = SAMPLE_YEAR_BOARD.tiles.filter((tile) => tile.state === 'done').length
const IN_PROGRESS = SAMPLE_YEAR_BOARD.tiles.filter((tile) => tile.state === 'in-progress').length
const LIVED = SAMPLE_LIFETIME.promises.filter((promise) => promise.lived).length
const SEALED_CAPSULES = SAMPLE_CAPSULES.filter((capsule) => !capsule.opened).length
const WAITING_LETTERS = SAMPLE_LETTERS.filter(
  (letter) => letter.to === 'me' && letter.state !== 'opened',
).length

/** Everything still ahead of the couple, which is the one figure in the header. */
const WAITING =
  TILE_TOTAL - STAMPED + (SAMPLE_LIFETIME.target - LIVED) + SEALED_CAPSULES + WAITING_LETTERS

const YEAR_STATUS = PLANS_COPY.cards.year.status(STAMPED, TILE_TOTAL)
const LIFETIME_STATUS = PLANS_COPY.cards.lifetime.status(LIVED, SAMPLE_LIFETIME.target - LIVED)

/** The accessible name `PlanCard` builds — title, then the figure it reports. */
const cardName = (title: string, status: string) => `${title}. ${status}`

beforeEach(() => {
  mockPush.mockClear()
  mockReplace.mockClear()
  // Bare, not wrapped in `act()` — with nothing yet mounted, wrapping it leaves
  // the renderer root empty on the next `render`. `ChatHome.test.tsx` has the
  // full story on why.
  usePlansStore.getState().reset()
})

describe('M06-S01 Our Plans — the hub', () => {
  it('opens with the notebook header and the number of things still ahead', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(PLANS_COPY.title)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.kicker)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.lede)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.waiting(WAITING))).toBeTruthy()
  })

  it('pins the trip with its dates, its destination and its name', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(SAMPLE_TRIP.title)).toBeTruthy()
    expect(
      screen.getByText(`${SAMPLE_TRIP.dateRange} · ${SAMPLE_TRIP.destination}`.toUpperCase()),
    ).toBeTruthy()
  })

  it('counts the days that have something in them, and the spots on them', async () => {
    const planned = SAMPLE_TRIP.days.filter((day) => day.moments.length > 0).length
    /*
     * SAVED spots, not every moment on the itinerary. The two differ on the
     * seeded sample, where nothing has been saved yet — the hub used to sum all
     * moments under the words "saved spots" and so reported saves that had not
     * happened. Both screens now read `selectSavedSpots`.
     */
    const spots = SAMPLE_TRIP.days.reduce(
      (count, day) => count + day.moments.filter((moment) => moment.saved).length,
      0,
    )

    await renderScreen(<PlansHubScreen />)

    // A day with an empty timeline is not a day planned — three of the four days
    // on the sample itinerary are still blank, and the chip has to say so.
    expect(screen.getByText(PLANS_COPY.daysPlanned(planned))).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.savedSpots(spots))).toBeTruthy()
  })

  /*
   * THE SIX CARDS. Each one is an index entry over a figure that lives in the
   * store, which is the entire reason this cluster shares one — see the header
   * of `plansStore.ts`. Every assertion here is the live figure, not the label.
   */
  it('reports each chapter with the figure it currently stands at', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(YEAR_STATUS)).toBeTruthy()
    expect(screen.getByText(LIFETIME_STATUS)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.cards.capsules.status(SEALED_CAPSULES))).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.cards.letters.status(WAITING_LETTERS))).toBeTruthy()
    expect(
      screen.getByText(PLANS_COPY.cards.watch.status(SAMPLE_WATCH_ROOM.tonight.title)),
    ).toBeTruthy()
    expect(screen.getByText(SAMPLE_PLACES.area)).toBeTruthy()
  })

  it('names every chapter, so the grid is not six anonymous tiles', async () => {
    await renderScreen(<PlansHubScreen />)

    for (const card of Object.values(PLANS_COPY.cards)) {
      expect(screen.getByText(card.title)).toBeTruthy()
    }

    expect(screen.getByText(PLANS_COPY.sectionLabel)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.trips.title)).toBeTruthy()
  })

  it('mentions the tiles in progress beside the stamped total', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(`${IN_PROGRESS} in progress`)).toBeTruthy()
  })

  it('says nothing about work in progress when there is none', async () => {
    // Cycling an in-progress tile once finishes it, so this leaves the board
    // with stamps and to-dos only — the detail line has to disappear rather
    // than print "0 in progress".
    for (const tile of SAMPLE_YEAR_BOARD.tiles.filter((t) => t.state === 'in-progress')) {
      usePlansStore.getState().cycleTile(tile.id)
    }

    await renderScreen(<PlansHubScreen />)

    /*
     * The exact string, not `/in progress$/`. The "Trips & Dates" row above the
     * grid legitimately reports its own count in the same words, so a loose
     * pattern asserts something this test does not mean. What it means is that
     * the year card prints NOTHING rather than "0 in progress".
     */
    expect(screen.queryByText('0 in progress')).toBeNull()
    expect(screen.getByText(PLANS_COPY.cards.year.status(STAMPED + IN_PROGRESS, TILE_TOTAL))).toBeTruthy()
  })

  it('counts a tile only once it is stamped, not once it is started', async () => {
    const todo = SAMPLE_YEAR_BOARD.tiles.find((tile) => tile.state === 'todo')!
    usePlansStore.getState().cycleTile(todo.id)

    await renderScreen(<PlansHubScreen />)

    // Started, not finished: the stamped total holds and so does the header,
    // because a tile in progress is still a thing waiting for them.
    expect(screen.getByText(YEAR_STATUS)).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.waiting(WAITING))).toBeTruthy()
    expect(screen.getByText(`${IN_PROGRESS + 1} in progress`)).toBeTruthy()
  })

  it('takes a stamped tile off the header count as well as off the board', async () => {
    const todo = SAMPLE_YEAR_BOARD.tiles.find((tile) => tile.state === 'todo')!
    usePlansStore.getState().cycleTile(todo.id)
    usePlansStore.getState().cycleTile(todo.id)

    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(PLANS_COPY.cards.year.status(STAMPED + 1, TILE_TOTAL))).toBeTruthy()
    expect(screen.getByText(PLANS_COPY.waiting(WAITING - 1))).toBeTruthy()
  })

  it('moves the lifetime card when a promise is lived', async () => {
    const unlived = usePlansStore.getState().promises.find((promise) => !promise.lived)!
    usePlansStore.getState().togglePromiseLived(unlived.id)

    await renderScreen(<PlansHubScreen />)

    expect(
      screen.getByText(
        PLANS_COPY.cards.lifetime.status(LIVED + 1, SAMPLE_LIFETIME.target - LIVED - 1),
      ),
    ).toBeTruthy()
    expect(screen.queryByText(LIFETIME_STATUS)).toBeNull()
  })

  it('counts a capsule the couple sealed on another screen', async () => {
    usePlansStore
      .getState()
      .sealCapsule({ kinds: ['photos'], opensAt: '2030-09-17', sealNote: 'For then.' })

    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(PLANS_COPY.cards.capsules.status(SEALED_CAPSULES + 1))).toBeTruthy()
  })

  it('counts a letter written to me, but not one written to my partner', async () => {
    usePlansStore
      .getState()
      .sealLetter({ to: 'partner', title: 'For you', body: 'Soon.', opensAt: '2030-01-01' })

    await renderScreen(<PlansHubScreen />)

    // The envelope figure reads "waiting for YOU", so a letter just posted the
    // other way must not land on it.
    expect(screen.getByText(PLANS_COPY.cards.letters.status(WAITING_LETTERS))).toBeTruthy()
  })

  it('updates a card the user is already looking at', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByText(PLANS_COPY.cards.letters.status(WAITING_LETTERS))).toBeTruthy()

    // The whole argument for one store rather than seven: sealing a letter
    // elsewhere has to change a number on a card already on screen, not only on
    // the next visit to the hub.
    await act(async () => {
      usePlansStore
        .getState()
        .sealLetter({ to: 'me', title: 'For me', body: 'Later.', opensAt: '2030-01-01' })
    })

    expect(screen.getByText(PLANS_COPY.cards.letters.status(WAITING_LETTERS + 1))).toBeTruthy()
  })

  /* --- where each thing on the page goes --- */

  it('opens the itinerary from the pinned trip', async () => {
    const user = userEvent.setup()
    await renderScreen(<PlansHubScreen />)

    await user.press(
      screen.getByRole('button', { name: `${SAMPLE_TRIP.title}. ${PLANS_COPY.openItinerary}` }),
    )

    expect(mockPush).toHaveBeenCalledWith('/(app)/plans/trip')
  })

  it('opens the itinerary from the chip under it too', async () => {
    const user = userEvent.setup()
    await renderScreen(<PlansHubScreen />)

    await user.press(screen.getByRole('button', { name: PLANS_COPY.openItinerary }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/plans/trip')
  })

  it('leaves the status chips unpressable, because they are figures and not filters', async () => {
    await renderScreen(<PlansHubScreen />)

    const planned = SAMPLE_TRIP.days.filter((day) => day.moments.length > 0).length

    expect(screen.queryByRole('button', { name: PLANS_COPY.daysPlanned(planned) })).toBeNull()
  })

  it.each([
    ['year', PLANS_COPY.cards.year.title, YEAR_STATUS, '/(app)/plans/year'],
    ['lifetime', PLANS_COPY.cards.lifetime.title, LIFETIME_STATUS, '/(app)/plans/lifetime'],
    [
      'capsules',
      PLANS_COPY.cards.capsules.title,
      PLANS_COPY.cards.capsules.status(SEALED_CAPSULES),
      '/(app)/plans/capsules',
    ],
    [
      'letters',
      PLANS_COPY.cards.letters.title,
      PLANS_COPY.cards.letters.status(WAITING_LETTERS),
      '/(app)/plans/letters',
    ],
    [
      'watch',
      PLANS_COPY.cards.watch.title,
      PLANS_COPY.cards.watch.status(SAMPLE_WATCH_ROOM.tonight.title),
      '/(app)/plans/watch',
    ],
    [
      'places',
      PLANS_COPY.cards.places.title,
      PLANS_COPY.cards.places.status(34),
      '/(app)/plans/places',
    ],
  ])('opens %s from its card', async (_key, title, status, href) => {
    const user = userEvent.setup()
    await renderScreen(<PlansHubScreen />)

    await user.press(screen.getByRole('button', { name: cardName(title, status) }))

    expect(mockPush).toHaveBeenCalledWith(href)
  })

  it('starts a new trip from the wide row and from the dashed footer alike', async () => {
    const user = userEvent.setup()
    await renderScreen(<PlansHubScreen />)

    await user.press(screen.getByRole('button', { name: PLANS_COPY.trips.title }))
    expect(mockPush).toHaveBeenLastCalledWith('/(app)/plans/trip/new')

    await user.press(screen.getByRole('button', { name: PLANS_COPY.add }))
    expect(mockPush).toHaveBeenLastCalledWith('/(app)/plans/trip/new')
  })

  it('marks Plans as the tab in view', async () => {
    await renderScreen(<PlansHubScreen />)

    expect(screen.getByLabelText('Plans').props.accessibilityState).toMatchObject({
      selected: true,
      disabled: false,
    })
    expect(screen.getByLabelText('Home').props.accessibilityState).toMatchObject({
      selected: false,
    })
  })
})
