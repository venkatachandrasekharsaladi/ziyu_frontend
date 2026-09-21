import { cleanup, screen, userEvent } from '@testing-library/react-native'

import { CAPSULES_COPY } from '@/copy/capsules'
import { CapsulesScreen } from '@/modules/module-06-plans/screens/CapsulesScreen'
import type { Capsule } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: jest.fn() }),
}))

/**
 * Freezes the wall clock the countdown is measured from.
 *
 * `Date.now`, not `jest.useFakeTimers()`. The screen reads the CURRENT instant
 * through `Date.now()` and the TARGET instant through `new Date(iso)`; only the
 * first of those needs to move, and a spy moves exactly it. Fake timers would
 * also have swapped the `Date` constructor out from under `userEvent`'s own
 * waits, which every press in this file depends on.
 *
 * LOCAL midnight, built with the multi-argument `Date` constructor rather than
 * an ISO string, because `daysUntil` parses `opensAt` as `${iso}T00:00:00` —
 * local midnight too. Pinning both ends to local midnight makes the difference
 * a whole number of days in every timezone this suite might be run in; a UTC
 * instant would land mid-afternoon somewhere and round the other way.
 */
function freezeAt(year: number, month: number, day: number) {
  jest.spyOn(Date, 'now').mockReturnValue(new Date(year, month - 1, day).getTime())
}

/**
 * The screen's own short-date format, reproduced rather than hardcoded.
 *
 * `'Sep 2026'` was written here first and failed: `Intl` renders en-GB's short
 * September as "Sept", not "Sep", and which of the two you get depends on the
 * ICU data compiled into the running Node. Deriving the string the same way the
 * screen does makes the assertion about the SCREEN rather than about the
 * platform's month abbreviations.
 */
function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  })
}

/**
 * One sealed capsule, standing in for the store's sample pair.
 *
 * The suite supplies its own rather than reading `SAMPLE_CAPSULES`, because the
 * sample's `opensAt` is a real date that marches closer every day the repo
 * exists — an assertion against it would have a different right answer next
 * week. Everything here is pinned relative to `freezeAt`.
 */
const SEALED: Capsule = {
  id: 'cap-test-1',
  title: 'To us, one year from now',
  createdAt: '2026-09-21',
  // Nine days after the frozen "today" below, and inside the same month, so no
  // DST transition can add or remove an hour and push the ceiling up by one.
  opensAt: '2026-09-30',
  sealedBy: 'both',
  sealNote: 'Only open this together over morning coffee.',
  contents: { photos: 3, letter: 2 },
  vaultCode: 'TOT-2026-TT',
  opened: false,
}

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  usePlansStore.getState().reset()
})

afterEach(() => {
  // Puts the real `Date.now` back. Without this the frozen clock would leak
  // into whichever test ran next and quietly break anything that measured
  // elapsed time rather than reading a date.
  jest.restoreAllMocks()
})

/**
 * M06-S06 · Time Capsules — the sealed vault.
 *
 * The two things worth pinning here are both promises the product makes rather
 * than pixels the frame drew: that the countdown is TRUE whenever you look at
 * it, and that a sealed capsule gives away nothing but how much is inside.
 */
describe('M06-S06 Time Capsules', () => {
  it('counts the days to the unseal date from today, not from a stored number', async () => {
    freezeAt(2026, 9, 21)
    usePlansStore.setState({ capsules: [SEALED] })

    await renderScreen(<CapsulesScreen />)

    expect(screen.getByText(CAPSULES_COPY.featured.remaining(9))).toBeTruthy()
  })

  it('recounts them as the clock moves, with the capsule unchanged', async () => {
    usePlansStore.setState({ capsules: [SEALED] })

    freezeAt(2026, 9, 21)
    await renderScreen(<CapsulesScreen />)
    expect(screen.getByText(CAPSULES_COPY.featured.remaining(9))).toBeTruthy()

    /*
     * `await cleanup()`, not `screen.unmount()`.
     *
     * RNTL 14 renders asynchronously, and unmounting without awaiting the
     * library's own teardown leaves the first render's `act()` scope open. The
     * second render below then opens another inside it — React logs
     * "overlapping act() calls" and every test AFTER this one in the file
     * renders into a tree it cannot query. That is what made this suite pass in
     * isolation and fail in place.
     */
    await cleanup()

    // Five days later. NOTHING about the capsule in the store has been touched
    // between the two renders — this is the whole point. The frame printed "478
    // days remaining" as a literal, which was true on the day it was drawn and
    // a lie every day after; a stored countdown would still be reading 9 here.
    freezeAt(2026, 9, 26)
    await renderScreen(<CapsulesScreen />)
    expect(screen.getByText(CAPSULES_COPY.featured.remaining(4))).toBeTruthy()
    expect(screen.queryByText(CAPSULES_COPY.featured.remaining(9))).toBeNull()
  })

  it('floors the countdown at zero once the unseal date has passed', async () => {
    // A day after it opens. `daysUntil` clamps, so the vault reads "0 days
    // remaining" rather than counting backwards into negative numbers.
    freezeAt(2026, 10, 1)
    usePlansStore.setState({ capsules: [SEALED] })

    await renderScreen(<CapsulesScreen />)

    expect(screen.getByText(CAPSULES_COPY.featured.remaining(0))).toBeTruthy()
  })

  it('shows what is sealed inside only as counts', async () => {
    freezeAt(2026, 9, 21)
    usePlansStore.setState({ capsules: [SEALED] })

    await renderScreen(<CapsulesScreen />)

    expect(screen.getByText(CAPSULES_COPY.featured.sealedInside)).toBeTruthy()

    // A tile per kind the capsule holds: the number, and the kind in caps. The
    // counts are 3 and 2 and the totals line is composed copy, so a bare "3"
    // or "2" can only have come from a count tile.
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText(CAPSULES_COPY.contents.photos.toUpperCase())).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText(CAPSULES_COPY.contents.letter.toUpperCase())).toBeTruthy()

    // And no tile for a kind this capsule does not hold — the strip is built
    // from the capsule's own entries, not from the list of every kind there is.
    expect(screen.queryByText(CAPSULES_COPY.contents.promise.toUpperCase())).toBeNull()
    expect(screen.queryByText(CAPSULES_COPY.contents.question.toUpperCase())).toBeNull()
  })

  it('never reveals a sealed capsule, however hard the row is pressed', async () => {
    const user = userEvent.setup()
    freezeAt(2026, 9, 21)
    usePlansStore.setState({ capsules: [SEALED] })

    await renderScreen(<CapsulesScreen />)

    // The seal note is printed on the OUTSIDE of the capsule — it is the label
    // on the lid, written to be read before the date. The contents are not.
    expect(screen.getByText(`“${SEALED.sealNote}”`)).toBeTruthy()

    const row = screen.getByLabelText(
      `${SEALED.title}. ${CAPSULES_COPY.opensIn(shortDate(SEALED.opensAt))}`,
    )
    await user.press(row)

    // Nothing opens and nothing is routed to. There is no "peek" here on
    // purpose: a sealed capsule that could be talked into showing itself is
    // not sealed, and the row is deliberately inert until it can open for real.
    expect(mockPush).not.toHaveBeenCalled()
    expect(screen.getByText(CAPSULES_COPY.featured.remaining(9))).toBeTruthy()
  })

  it('reports how many capsules are sealed, and how much each holds', async () => {
    freezeAt(2026, 9, 21)
    usePlansStore.setState({ capsules: [SEALED] })

    await renderScreen(<CapsulesScreen />)

    expect(screen.getByText(CAPSULES_COPY.listCount(1))).toBeTruthy()
    // 3 photos + 2 letters, summed — again a count, never a listing.
    expect(screen.getByText(`· ${CAPSULES_COPY.itemsEnclosed(5)}`)).toBeTruthy()
  })

  it('offers the empty state when nothing has been sealed yet', async () => {
    usePlansStore.setState({ capsules: [] })

    await renderScreen(<CapsulesScreen />)

    expect(screen.getByText(CAPSULES_COPY.empty.heading)).toBeTruthy()
    expect(screen.getByText(CAPSULES_COPY.empty.lede)).toBeTruthy()

    // No featured capsule means no countdown and no seal — not a zeroed one.
    expect(screen.queryByText(CAPSULES_COPY.featured.opensOn)).toBeNull()
    expect(screen.queryByText(CAPSULES_COPY.featured.sealedInside)).toBeNull()
    expect(screen.getByText(CAPSULES_COPY.listCount(0))).toBeTruthy()
  })

  it('treats a vault whose capsules have all been opened as empty', async () => {
    usePlansStore.setState({ capsules: [{ ...SEALED, opened: true }] })

    await renderScreen(<CapsulesScreen />)

    // "Featured" means the next thing still waiting, not the most recent thing
    // that ever existed — an opened capsule has no countdown left to run.
    expect(screen.getByText(CAPSULES_COPY.empty.heading)).toBeTruthy()
    expect(screen.getByText(CAPSULES_COPY.listCount(0))).toBeTruthy()
  })

  it('sends the couple to the creation flow', async () => {
    const user = userEvent.setup()
    usePlansStore.setState({ capsules: [] })

    await renderScreen(<CapsulesScreen />)

    await user.press(screen.getByRole('button', { name: CAPSULES_COPY.create }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/plans/capsules/new')
  })
})
