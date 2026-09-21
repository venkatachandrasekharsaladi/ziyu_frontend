import { screen, userEvent } from '@testing-library/react-native'
import type { ReactTestRendererJSON } from 'react-test-renderer'

import { TRIP_ITINERARY_COPY as COPY } from '@/copy/trips'
import { TripItineraryScreen } from '@/modules/module-06-plans/screens/TripItineraryScreen'
import { SAMPLE_TRIP } from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: jest.fn() }),
}))

/** Day 01 is the only day of the four the sample fills. */
const DAY_ONE = SAMPLE_TRIP.days[0]
const FIRST_MOMENT = DAY_ONE.moments[0]

/** The three days the frame draws with chips but no content. */
const EMPTY_DAYS = SAMPLE_TRIP.days.filter((day) => day.moments.length === 0)

/** The accessible name a day chip carries — "Day 02, Seine moments". */
const dayChipName = (day: (typeof SAMPLE_TRIP.days)[number]) =>
  `${COPY.dayChip(day.number)}, ${day.title}`

/**
 * The `now` the progress track reports, dug out of the rendered tree.
 *
 * NOT `getByRole('progressbar')`, which finds nothing here: RNTL only matches a
 * role on a node that `isAccessibilityElement`, and `ProgressBar`'s track sets
 * `accessibilityRole`/`accessibilityValue` without `accessible`. The value is
 * therefore in the tree and invisible to assistive technology alike — see the
 * note in the suite's report. Reading the prop directly asserts what the screen
 * computed, which is what this file is for; whether the bar announces itself is
 * `ProgressBar`'s own test to make.
 */
function progressNow(tree: ReactTestRendererJSON | null): number | undefined {
  if (!tree || typeof tree !== 'object') return undefined

  if (tree.props?.accessibilityRole === 'progressbar') {
    return tree.props.accessibilityValue?.now
  }

  for (const child of tree.children ?? []) {
    if (typeof child === 'string') continue

    const found = progressNow(child as ReactTestRendererJSON)

    if (found !== undefined) return found
  }

  return undefined
}

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  // The selected day and every moment's `saved` flag live in this store, so a
  // test that taps either of them would otherwise hand its state to the next.
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

/**
 * M06-S03 · The itinerary. Figma 3482:15.
 *
 * Three of the four sample days carry no moments, which makes the empty state
 * what this screen shows three quarters of the time rather than an edge case —
 * so it is tested as the common path, day by day, not as one afterthought.
 */
describe('M06-S03 Our Little Adventure', () => {
  describe('choosing a day', () => {
    it('opens on day one and draws the moments it holds', async () => {
      await renderScreen(<TripItineraryScreen />)

      expect(screen.getByText(COPY.dayHeading(DAY_ONE.number, DAY_ONE.title))).toBeTruthy()
      expect(screen.getByText(DAY_ONE.subtitle)).toBeTruthy()

      for (const moment of DAY_ONE.moments) {
        expect(screen.getByText(moment.title)).toBeTruthy()
      }
    })

    it('swaps the rendered day when another chip is pressed', async () => {
      const user = userEvent.setup()
      const second = SAMPLE_TRIP.days[1]
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(dayChipName(second)))

      expect(screen.getByText(COPY.dayHeading(second.number, second.title))).toBeTruthy()
      expect(screen.getByText(second.subtitle)).toBeTruthy()
      // Day one's heading and its moments go with it — this is a switch, not an
      // append.
      expect(screen.queryByText(COPY.dayHeading(DAY_ONE.number, DAY_ONE.title))).toBeNull()
      expect(screen.queryByText(FIRST_MOMENT.title)).toBeNull()
    })

    it('puts the chosen day in the store, not in local state', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(dayChipName(SAMPLE_TRIP.days[2])))

      // The screen's own comment says this is the one piece of its state worth
      // surviving a trip into a moment and back, which is only true if it is
      // genuinely in `plansStore`.
      expect(usePlansStore.getState().selectedDay).toBe(3)
    })

    it('renders whichever day the store was already on when the screen opened', async () => {
      usePlansStore.getState().selectDay(4)
      const fourth = SAMPLE_TRIP.days[3]

      await renderScreen(<TripItineraryScreen />)

      expect(screen.getByText(COPY.dayHeading(fourth.number, fourth.title))).toBeTruthy()
    })

    it('marks exactly one chip as selected, and moves that mark', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      expect(screen.getByLabelText(dayChipName(DAY_ONE)).props.accessibilityState).toMatchObject({
        selected: true,
      })

      await user.press(screen.getByLabelText(dayChipName(SAMPLE_TRIP.days[1])))

      expect(screen.getByLabelText(dayChipName(DAY_ONE)).props.accessibilityState).toMatchObject({
        selected: false,
      })
      expect(
        screen.getByLabelText(dayChipName(SAMPLE_TRIP.days[1])).props.accessibilityState,
      ).toMatchObject({ selected: true })
    })

    it('offers every day as a chip, including the empty ones', async () => {
      await renderScreen(<TripItineraryScreen />)

      for (const day of SAMPLE_TRIP.days) {
        expect(screen.getByLabelText(dayChipName(day))).toBeTruthy()
      }
    })
  })

  describe('a day with nothing on it', () => {
    it.each(EMPTY_DAYS.map((day) => [COPY.dayChip(day.number), day] as const))(
      '%s shows the empty state rather than a blank stretch of screen',
      async (_name, day) => {
        const user = userEvent.setup()
        await renderScreen(<TripItineraryScreen />)

        await user.press(screen.getByLabelText(dayChipName(day)))

        expect(screen.getByText(COPY.dayEmpty.heading)).toBeTruthy()
        expect(screen.getByText(COPY.dayEmpty.lede)).toBeTruthy()
        expect(screen.getByText(COPY.dayEmpty.action)).toBeTruthy()
      },
    )

    it('draws no timeline card at all, not an empty one', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(dayChipName(EMPTY_DAYS[0])))

      // The save control is the one thing every moment card carries, so its
      // absence is the cheapest proof that no card was rendered.
      expect(screen.queryByLabelText(new RegExp(`^${COPY.save}: `))).toBeNull()
    })

    it('keeps the empty state off day one, which does have moments', async () => {
      await renderScreen(<TripItineraryScreen />)

      expect(screen.queryByText(COPY.dayEmpty.heading)).toBeNull()
    })

    it('comes back to the filled day intact', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(dayChipName(EMPTY_DAYS[0])))
      await user.press(screen.getByLabelText(dayChipName(DAY_ONE)))

      expect(screen.queryByText(COPY.dayEmpty.heading)).toBeNull()
      expect(screen.getByText(FIRST_MOMENT.title)).toBeTruthy()
    })
  })

  describe('saving a moment', () => {
    it('flips the flag in the store rather than in the card', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`))

      const stored = usePlansStore
        .getState()
        .trip.days.flatMap((day) => day.moments)
        .find((moment) => moment.id === FIRST_MOMENT.id)

      expect(stored?.saved).toBe(true)
    })

    it('re-renders the card from the store it just wrote to', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`))

      // The card has no state of its own — if the label changed, the store
      // change came all the way back down.
      expect(screen.getByLabelText(`${COPY.saved}: ${FIRST_MOMENT.title}`)).toBeTruthy()
      expect(screen.queryByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`)).toBeNull()
    })

    it('unsaves on a second press', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`))
      await user.press(screen.getByLabelText(`${COPY.saved}: ${FIRST_MOMENT.title}`))

      const stored = usePlansStore
        .getState()
        .trip.days.flatMap((day) => day.moments)
        .find((moment) => moment.id === FIRST_MOMENT.id)

      expect(stored?.saved).toBe(false)
      expect(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`)).toBeTruthy()
    })

    it('touches only the moment that was pressed', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`))

      // `toggleMomentSaved` rebuilds every day and every moment on each call, so
      // "did it flip the neighbours too" is a real question to ask of it.
      for (const sibling of DAY_ONE.moments.slice(1)) {
        expect(screen.getByLabelText(`${COPY.save}: ${sibling.title}`)).toBeTruthy()
      }
    })
  })

  describe('the progress figure', () => {
    it('reads the planned-of-total the trip carries', async () => {
      await renderScreen(<TripItineraryScreen />)

      expect(
        screen.getByText(COPY.momentsPlanned(SAMPLE_TRIP.momentsPlanned, SAMPLE_TRIP.momentsTotal)),
      ).toBeTruthy()
      expect(screen.getByText('3 of 7 moments planned')).toBeTruthy()
    })

    it('prints the same fraction as a rounded percentage', async () => {
      await renderScreen(<TripItineraryScreen />)

      // 3/7 is 42.857…, so the screen has to round rather than truncate to
      // match the frame's "43%".
      expect(screen.getByText(COPY.momentsSet(43))).toBeTruthy()
    })

    it('gives the bar the same number it printed', async () => {
      const tree = (await renderScreen(<TripItineraryScreen />)).toJSON() as ReactTestRendererJSON

      // A progress bar whose track disagrees with its own caption is a bar
      // nobody can read, and only the caption would have been caught above.
      expect(progressNow(tree)).toBe(43)
    })

    it('does not move when a moment is saved', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${FIRST_MOMENT.title}`))

      // Deliberate, and documented on the `Trip` type: the denominator is how
      // many moments the couple WANTS, so saving one is not planning one.
      expect(screen.getByText(COPY.momentsSet(43))).toBeTruthy()
      expect(screen.getByText('3 of 7 moments planned')).toBeTruthy()
    })
  })

  describe('the header and the actions under the timeline', () => {
    it('titles the trip from the stored nights and destination', async () => {
      await renderScreen(<TripItineraryScreen />)

      expect(
        screen.getByText(COPY.heroTitle(SAMPLE_TRIP.nights, SAMPLE_TRIP.destination)),
      ).toBeTruthy()
      // Only the city — the frame drops the country from the hero.
      expect(screen.getByText('4 days in Paris')).toBeTruthy()
    })

    it('prints the estimated cost beside the band the couple chose', async () => {
      await renderScreen(<TripItineraryScreen />)

      // Two different figures on one chip — see the `BudgetBand` comment. The
      // chip carries no `onPress`, so it is a badge rather than a button and is
      // found by its words rather than by a label.
      expect(screen.getByText(COPY.budget('£', SAMPLE_TRIP.estimatedCost, '£500'))).toBeTruthy()
      expect(screen.getByText('Est. Budget: £485 / £500')).toBeTruthy()
    })

    it('prints a flexible band as the word, not as "£flexible"', async () => {
      usePlansStore
        .getState()
        .createTrip({ destination: 'Paris, France', nights: 4, budgetBand: 'flexible', styles: [] })

      await renderScreen(<TripItineraryScreen />)

      expect(
        screen.getByText(COPY.budget('£', SAMPLE_TRIP.estimatedCost, 'Flexible')),
      ).toBeTruthy()
    })

    it('confirms the save in place rather than navigating away from the plan', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByRole('button', { name: COPY.primary }))

      expect(screen.getByRole('button', { name: COPY.savedConfirmation })).toBeTruthy()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('sends "Share with" to the chat thread', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByRole('button', { name: COPY.share('Sarah') }))

      expect(mockPush).toHaveBeenCalledWith('/(app)/chat')
    })

    it('sends "Change vibe" back to the setup screen that produced this plan', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripItineraryScreen />)

      await user.press(screen.getByLabelText(COPY.changeVibe))

      expect(mockPush).toHaveBeenCalledWith('/(app)/plans/trip/new')
    })
  })
})
