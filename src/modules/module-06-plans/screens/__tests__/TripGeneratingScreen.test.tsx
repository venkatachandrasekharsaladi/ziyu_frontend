import { Feather } from '@expo/vector-icons'
import { act, screen, userEvent } from '@testing-library/react-native'
import type { ReactTestRendererJSON, ReactTestRendererNode } from 'react-test-renderer'

import { PLANNER_COPY } from '@/copy/planner'
import { TripGeneratingScreen } from '@/modules/module-06-plans/screens/TripGeneratingScreen'
import { PLANNER_CATALOGUE } from '@/sample/plannerCatalogue'
import {
  plannerService,
  type PlannerProgress,
  type PlannerStage,
  type Result,
} from '@/services/planner'
import type { Trip } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

/**
 * The draft, as the URL carries it.
 *
 * Every value here is a STRING, because that is all a route param ever is —
 * `nights` and `budget` arrive as `'6'` and `'250'` and the screen is the thing
 * that has to turn them back into numbers. A test that handed the screen real
 * numbers would be testing a route that cannot exist.
 */
let mockParams: Record<string, string> = {}

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}))

/*
 * THE PLANNER IS REPLACED WHOLESALE, not spied on.
 *
 * The real mock planner paces itself with 900ms `setTimeout`s per stage and
 * decides its own outcome from `sample/plannerCatalogue.ts`. Neither is
 * something this suite should be at the mercy of: the pacing would make every
 * test below a five-second wait, and the outcome would mean "what does the
 * screen do when the planner fails?" could only be asked by finding a
 * destination the catalogue happens not to know — an assertion that changes
 * meaning the day someone adds Narnia to the catalogue.
 *
 * Replacing the module means the SCREEN is under test and nothing else: this
 * file decides when each stage is reported and what comes back at the end.
 * `destinations` is stubbed too, because the module's shape is the contract and
 * a partial mock would let a screen start calling it without anything noticing.
 */
jest.mock('@/services/planner', () => ({
  plannerService: { generate: jest.fn(), destinations: jest.fn() },
}))

const mockGenerate = plannerService.generate as jest.MockedFunction<typeof plannerService.generate>

/** Five stages, as `PlannerStage['key']` enumerates them. */
const TOTAL_STAGES = 5

/**
 * The stages the fake planner reports, in order.
 *
 * Every `detail` is deliberately NOT one of `PLANNER_COPY.stages` — the screen
 * draws both the stage's name (from copy) and its detail (from the planner) in
 * the same row, and a detail that happened to repeat a stage name would make
 * `getByText` ambiguous and, worse, would let a screen that printed the copy
 * twice pass a test meant to prove the planner's own words reached the page.
 */
const STAGES: PlannerStage[] = [
  { key: 'reading', detail: 'romantic, foodie' },
  { key: 'searching', detail: 'Looking through 87 places' },
  { key: 'routing', detail: 'Nothing more than a short walk apart' },
  { key: 'budgeting', detail: 'Keeping each day under 160' },
  { key: 'writing', detail: 'Putting it in order' },
]

/**
 * The stage names as the screen prints them, top to bottom.
 *
 * Widened to `string[]` on purpose: `PLANNER_COPY` is `as const`, so the mapped
 * result would otherwise be a union of five literals and `includes(someText)`
 * would not compile against an arbitrary string from the rendered tree.
 */
const STAGE_LABELS: string[] = STAGES.map((stage) => PLANNER_COPY.stages[stage.key])

/**
 * The trip the fake planner hands back.
 *
 * Nothing about it is derivable from the draft below — the title names Japan
 * while the draft says Kyoto, the cost is a figure no catalogue holds. A screen
 * that rebuilt a trip from the params it was given, rather than storing the one
 * the planner composed, would fail on every field here.
 */
const TRIP: Trip = {
  id: 'trip-from-the-planner',
  title: 'Our Japan Adventure',
  destination: 'Kyoto, Japan',
  dateRange: '14 May – 17 May, 2027',
  coverUri: null,
  nights: 6,
  travellers: 2,
  budgetBand: 250,
  estimatedCost: 417,
  currency: '£',
  styles: ['romantic', 'foodie'],
  days: [],
  momentsPlanned: 0,
  momentsTotal: 0,
}

/**
 * Hands this file the planner's two levers: when a stage is reported, and when
 * — and how — the work ends.
 *
 * `generate` returns a promise that NOTHING resolves until `finish` is called,
 * so a test that only wants to look at the progress screen can hold it open
 * indefinitely without a timer, a fake clock or a race. `report` is captured
 * from the screen's own `onProgress`, which also means a screen that stopped
 * passing one would fail here rather than quietly rendering a frozen list.
 *
 * `reach(n)` replays every stage from where it left off up to `n`, each inside
 * its own `act`. One `act` per stage rather than one for the batch is the point:
 * it produces a separate React commit per stage, which is what a real planner
 * does and what the "called exactly once" test below needs to be meaningful.
 */
function takeControl() {
  let report: PlannerProgress | undefined
  let settle: ((result: Result<Trip>) => void) | undefined
  let reported = -1

  mockGenerate.mockImplementation(({ onProgress }) => {
    report = onProgress

    return new Promise<Result<Trip>>((resolve) => {
      settle = resolve
    })
  })

  return {
    async reach(index: number) {
      for (let i = reported + 1; i <= index; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
          report?.(STAGES[i], i, TOTAL_STAGES)
        })
      }

      reported = index
    },

    async finish(result: Result<Trip>) {
      await act(async () => {
        settle?.(result)
      })
    },
  }
}

/**
 * The character a Feather icon actually renders.
 *
 * `@expo/vector-icons` draws a glyph from an icon font, so `<Feather
 * name="check" />` reaches the tree as a Text node holding one codepoint and
 * nothing that `getByRole` or `getByLabelText` can see. Looking the codepoint up
 * in the icon set's own glyph map — rather than pasting the character in — keeps
 * this readable and survives an icon-set upgrade that renumbers the font.
 */
function glyph(name: keyof typeof Feather.glyphMap): string {
  // The glyph map is typed `string | number` across the icon families; Feather's
  // are codepoints, and `Number` is what makes that narrowing explicit.
  return String.fromCodePoint(Number(Feather.glyphMap[name]))
}

/** Every string in the tree, in the order the screen lays them out. */
function textsInOrder(node: ReactTestRendererNode | ReactTestRendererNode[] | null): string[] {
  if (node === null || node === undefined) return []
  if (Array.isArray(node)) return node.flatMap(textsInOrder)
  if (typeof node === 'string') return [node]

  return (node.children ?? []).flatMap(textsInOrder)
}

/** How many host nodes of a given type the tree holds. */
function countHostNodes(
  node: ReactTestRendererNode | ReactTestRendererNode[] | null,
  type: string,
): number {
  if (node === null || node === undefined) return 0
  if (Array.isArray(node)) return node.reduce((n, child) => n + countHostNodes(child, type), 0)
  if (typeof node === 'string') return 0

  return (node.children ?? []).reduce(
    (n, child) => n + countHostNodes(child, type),
    node.type === type ? 1 : 0,
  )
}

/** The screen's own JSON tree, typed for the two helpers above. */
type Tree = ReactTestRendererJSON | ReactTestRendererJSON[] | null

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  mockReplace.mockClear()
  // `mockReset`, not `mockClear` — every test installs its own implementation
  // through `takeControl`, and a leftover one from the test before would decide
  // the outcome of a test that thought it was still waiting.
  mockGenerate.mockReset()
  mockParams = {}
  // `plansStore` is seeded from `@/sample/plans` and `setGeneratedTrip` writes
  // over that seed for the rest of the process, so the success test would
  // otherwise leave its trip behind for everything after it.
  usePlansStore.getState().reset()
})

/**
 * M06-S13 · Building the plan.
 *
 * The screen between "Create our plan" and the itinerary. It has exactly three
 * jobs and the three `describe`s below are those jobs: show the work honestly
 * while it happens, hand the finished trip over and get out of the way, and say
 * something useful when there is no trip to hand over.
 *
 * NOTE ON PRESSES. `Button` swallows a second press within 600ms of the first
 * (see its own note, and the `pressButton` helper in
 * `CapsuleCreateScreen.test.tsx` that waits that guard out). No test in this
 * file presses a `Button` twice — the error state offers one action and the
 * destination chips are plain `Pressable`s, which carry no guard — so the wait
 * is not needed here and is deliberately not paid.
 */
describe('M06-S13 Building the plan · showing the work', () => {
  it('lists every stage of the work, in the order the planner reports them', async () => {
    const planner = takeControl()

    const view = await renderScreen(<TripGeneratingScreen />)
    await planner.reach(2)

    // Asserted as a SEQUENCE rather than five separate `getByText`s. The order
    // is the claim the screen makes — "reading, then searching, then routing" —
    // and five presence checks would pass just as happily on a list that had
    // shuffled itself.
    expect(textsInOrder(view.toJSON() as Tree).filter((t) => STAGE_LABELS.includes(t))).toEqual(
      STAGE_LABELS,
    )
  })

  it('shows the whole list from the first frame, before any stage has reported', async () => {
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    // The list is not built up as the stages arrive. The couple can see what is
    // going to happen before it happens, which is the difference between a
    // progress screen and a slot machine.
    for (const label of STAGE_LABELS) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it('prints the planner’s detail against the stage that is running, and no other', async () => {
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(1)

    expect(screen.getByText(STAGES[1].detail)).toBeTruthy()
    // The detail belongs to the moment, not to the row: the stage that finished
    // keeps its name and loses its commentary, and the stages still to come
    // have nothing to say yet.
    expect(screen.queryByText(STAGES[0].detail)).toBeNull()
    expect(screen.queryByText(STAGES[2].detail)).toBeNull()
  })

  it('ticks off the stages already done and spins on the one in hand', async () => {
    const planner = takeControl()

    const view = await renderScreen(<TripGeneratingScreen />)
    await planner.reach(2)

    // Two behind (reading, searching) carry a tick; the third (routing) is the
    // one being worked on, so it carries the only spinner on the screen.
    expect(screen.getAllByText(glyph('check'))).toHaveLength(2)
    expect(countHostNodes(view.toJSON() as Tree, 'ActivityIndicator')).toBe(1)

    // And the two ahead still show their own resting icons — a stage that has
    // not started is not a stage that has failed.
    expect(screen.getByText(glyph('credit-card'))).toBeTruthy()
    expect(screen.getByText(glyph('edit-3'))).toBeTruthy()
  })

  it('has nothing ticked off before the first stage reports', async () => {
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    expect(screen.queryAllByText(glyph('check'))).toHaveLength(0)
  })

  it('moves the progress bar and its step count with the stages', async () => {
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)

    expect(screen.getByText(PLANNER_COPY.stepOf(1, TOTAL_STAGES))).toBeTruthy()

    await planner.reach(3)

    // Step 4 of 5 — the running stage counts as begun, not as finished, so the
    // bar reads 80% rather than 60%.
    expect(screen.getByText(PLANNER_COPY.stepOf(4, TOTAL_STAGES))).toBeTruthy()
    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 80 })
  })

  it('names the place the couple asked for while it works', async () => {
    mockParams = { destination: 'Kyoto, Japan' }
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    expect(screen.getByText(PLANNER_COPY.lede('Kyoto, Japan'))).toBeTruthy()
  })

  it('says "something good" rather than leaving a hole when no place was typed', async () => {
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    // `lede('')` would render "Putting together  for the two of you." — the
    // fallback exists so the sentence survives an empty param.
    expect(screen.getByText(PLANNER_COPY.lede('something good'))).toBeTruthy()
  })
})

describe('M06-S13 Building the plan · the handover', () => {
  it('gives the finished trip to the store exactly as the planner composed it', async () => {
    const planner = takeControl()
    usePlansStore.getState().selectDay(3)

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(4)
    await planner.finish({ ok: true, value: TRIP })

    /*
     * Asserted through the real store rather than a spy on `setGeneratedTrip`.
     * The screen reaches the action through a selector, so a spy would still be
     * satisfied by a screen that called some other action — and the thing that
     * matters to the itinerary downstream is what the store HOLDS.
     */
    expect(usePlansStore.getState().trip).toEqual(TRIP)
    // And day one, not whatever day the couple was reading on the trip before.
    expect(usePlansStore.getState().selectedDay).toBe(1)
  })

  it('replaces itself with the itinerary rather than pushing it', async () => {
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(4)
    await planner.finish({ ok: true, value: TRIP })

    /*
     * `replace`, and the absence of `push`, is the whole assertion.
     *
     * A `push` would leave this screen on the stack: pressing back from the
     * finished itinerary would return the couple to a progress screen whose
     * work is done, whose planner has already resolved, and which has nowhere
     * left to go. The couple would have to press back twice to escape a screen
     * they never chose to revisit.
     */
    expect(mockReplace).toHaveBeenCalledWith('/(app)/plans/trip')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('runs the planner once, however many times the effect is re-evaluated', async () => {
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(4)
    await planner.finish({ ok: true, value: TRIP })

    /*
     * This is the `started` ref earning its place, and the re-renders above are
     * what put it under load.
     *
     * The screen's `run` is a `useCallback` whose deps include `styles_` — a
     * fresh array built by `params.styles.split(',')` on every render — and
     * `router`, a fresh object from `useRouter()` on every render. Neither is
     * ever referentially equal to the last one, so `run` has a new identity
     * every render and the `useEffect` that depends on it re-fires every render
     * too. Each stage reported above is a render; without the ref guard each of
     * those renders would start another planner, which would report another
     * stage, which would render again — a loop, not a double call.
     *
     * (React's own double-invoked-effect behaviour under StrictMode is the
     * reason the screen's comment gives for the guard. It is not what this test
     * exercises — `renderScreen` does not wrap in StrictMode, and react-test-
     * renderer does not double-invoke here; verified before writing this.)
     */
    expect(mockGenerate).toHaveBeenCalledTimes(1)
  })
})

describe('M06-S13 Building the plan · the draft in the URL', () => {
  it('passes the draft straight through to the planner, unchanged', async () => {
    mockParams = {
      destination: 'Kyoto, Japan',
      nights: '6',
      budget: '250',
      styles: 'romantic,foodie',
    }
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    // The draft does NOT travel through the store — a half-answered trip has no
    // business in global state — so the params are the only thing standing
    // between the setup form's answers and the planner. `nights` and `budget`
    // arrive as strings and must leave as numbers.
    expect(mockGenerate).toHaveBeenCalledWith({
      draft: {
        destination: 'Kyoto, Japan',
        nights: 6,
        budgetBand: 250,
        styles: ['romantic', 'foodie'],
      },
      onProgress: expect.any(Function),
    })
  })

  it('keeps a flexible budget as the word rather than coercing it to a number', async () => {
    mockParams = { destination: 'Lisbon, Portugal', nights: '3', budget: 'flexible', styles: '' }
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    // `Number('flexible')` is `NaN`, and a planner asked to respect a NaN daily
    // ceiling drops every moment it looks at. `BudgetBand` keeps the word for
    // exactly this reason.
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: expect.objectContaining({ budgetBand: 'flexible', styles: [] }),
      }),
    )
  })

  it('falls back to a four-night £500 trip when the URL carries nothing', async () => {
    takeControl()

    await renderScreen(<TripGeneratingScreen />)

    // A deep link or a reload with no params still has to produce a plannable
    // draft rather than `NaN` nights and an undefined band.
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: { destination: '', nights: 4, budgetBand: 500, styles: [] },
      }),
    )
  })
})

describe('M06-S13 Building the plan · when there is no plan to hand over', () => {
  /** "Paris", "Kyoto", … — the chip labels, as the screen shortens them. */
  const KNOWN = PLANNER_CATALOGUE.map((entry) => entry.name.split(',')[0])

  it('names the place it could not find, and offers the ones it knows', async () => {
    mockParams = { destination: 'Narnia' }
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    // The real planner reports the first stage before admitting it cannot place
    // the destination, so the failure is driven in the same order here.
    await planner.reach(0)
    await planner.finish({ ok: false, error: { code: 'DESTINATION_UNKNOWN' } })

    expect(screen.getByText(PLANNER_COPY.errors.DESTINATION_UNKNOWN.heading)).toBeTruthy()
    // The couple's own word, quoted back. "We couldn't place that" would leave
    // them guessing whether it was the typo or the place that was the problem.
    expect(
      screen.getByText(PLANNER_COPY.errors.DESTINATION_UNKNOWN.lede('Narnia')),
    ).toBeTruthy()

    // And the dead end becomes a next step: every destination the provider can
    // actually plan, as a pressable chip.
    expect(screen.getByText(PLANNER_COPY.weKnow)).toBeTruthy()
    for (const name of KNOWN) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
  })

  it('stops showing the work once it has failed', async () => {
    mockParams = { destination: 'Narnia' }
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(0)
    await planner.finish({ ok: false, error: { code: 'DESTINATION_UNKNOWN' } })

    // The stage list, the progress bar and the spinner all go. A progress bar
    // left frozen under an error message reads as "still trying".
    expect(screen.queryByText(STAGE_LABELS[0])).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('carries the rest of the draft into the destination it is retried with', async () => {
    const user = userEvent.setup()
    mockParams = {
      destination: 'Narnia',
      nights: '6',
      budget: '250',
      styles: 'romantic,foodie',
    }
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.finish({ ok: false, error: { code: 'DESTINATION_UNKNOWN' } })

    await user.press(screen.getByRole('button', { name: 'Kyoto' }))

    /*
     * The chip is a one-press fix, not a trip back to the form: everything the
     * couple already answered rides along and only the destination changes. The
     * chip carries the FULL catalogue name rather than the shortened label,
     * because "Kyoto" is what fits on a pill and "Kyoto, Japan" is what the
     * planner can resolve.
     */
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/(app)/plans/trip/generating',
      params: {
        destination: 'Kyoto, Japan',
        nights: '6',
        budget: '250',
        styles: 'romantic,foodie',
      },
    })
  })

  it('writes its own copy for a budget nothing survived, and offers no destinations', async () => {
    mockParams = { destination: 'Kyoto, Japan', budget: '100', nights: '6' }
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.reach(3)
    await planner.finish({ ok: false, error: { code: 'NO_PLAN_FOUND' } })

    expect(screen.getByText(PLANNER_COPY.errors.NO_PLAN_FOUND.heading)).toBeTruthy()
    expect(screen.getByText(PLANNER_COPY.errors.NO_PLAN_FOUND.lede)).toBeTruthy()

    /*
     * NO destination chips here, and that is the point of the branch.
     *
     * The place was found; the money was the problem. Offering "try Paris
     * instead" would be answering a question the couple did not ask, and would
     * read as though the app had not understood the failure it just reported.
     */
    expect(screen.queryByText(PLANNER_COPY.weKnow)).toBeNull()
    for (const name of KNOWN) {
      expect(screen.queryByRole('button', { name })).toBeNull()
    }
  })

  it('offers each failure its own way out, back to the form', async () => {
    const user = userEvent.setup()
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.finish({ ok: false, error: { code: 'NO_PLAN_FOUND' } })

    await user.press(
      screen.getByRole('button', { name: PLANNER_COPY.errors.NO_PLAN_FOUND.action }),
    )

    // `replace` again, for the same reason as the success path: the progress
    // screen has nothing left to do and should not be behind the form.
    expect(mockReplace).toHaveBeenCalledWith('/(app)/plans/trip/new')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('leaves the trip in the store alone when the planner comes back empty', async () => {
    const before = usePlansStore.getState().trip
    const planner = takeControl()

    await renderScreen(<TripGeneratingScreen />)
    await planner.finish({ ok: false, error: { code: 'NO_PLAN_FOUND' } })

    // A failed plan must not half-overwrite the trip the couple already had —
    // and must not send them to an itinerary that was never built.
    expect(usePlansStore.getState().trip).toBe(before)
    expect(mockReplace).not.toHaveBeenCalledWith('/(app)/plans/trip')
  })
})
