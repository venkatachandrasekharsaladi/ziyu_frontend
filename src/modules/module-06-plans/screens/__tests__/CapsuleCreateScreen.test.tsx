import { act, screen, userEvent } from '@testing-library/react-native'

import { CAPSULE_CREATE_COPY } from '@/copy/capsules'
import { CapsuleCreateScreen } from '@/modules/module-06-plans/screens/CapsuleCreateScreen'
import { SAMPLE_CAPSULE_KINDS } from '@/sample/plans'
import type { Capsule, CapsuleDraft, CapsuleItemKind } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({
    canGoBack: () => true,
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
}))

const STEPS = 3

/** The three kinds the wizard arrives with already chosen. */
const DEFAULT_KINDS: CapsuleItemKind[] = ['photos', 'letter', 'prediction']

/**
 * A kind tile's accessible name — label and hint, as the screen composes it.
 * Derived from the same fixture the screen renders from, so adding a seventh
 * kind cannot leave this file naming one that no longer exists.
 */
function kindLabel(kind: CapsuleItemKind): string {
  const option = SAMPLE_CAPSULE_KINDS.find((o) => o.kind === kind)!

  return `${option.label}. ${option.hint}`
}

/**
 * The capsule a stubbed `sealCapsule` hands back.
 *
 * Its vault code is deliberately nothing the screen could have guessed: the
 * real store builds one as `TOT-${year}-CS`, and a year from now is 2027, which
 * is also what the sample capsule carries. Asserting against a code the screen
 * could have derived or copied would pass on a screen that printed a fixture.
 */
const STUB_SEALED: Capsule = {
  id: 'cap-stub',
  title: 'A capsule for us',
  createdAt: '2026-09-21',
  opensAt: '2026-09-30',
  sealedBy: 'both',
  sealNote: null,
  contents: { photos: 1 },
  vaultCode: 'TOT-4242-ZZ',
  opened: false,
}

/**
 * The store's real `sealCapsule`, captured before any test can replace it.
 *
 * `reset()` rebuilds the DATA a test may have changed and nothing else — the
 * actions are not part of its seed — so a test that swaps `sealCapsule` for a
 * spy would leave that spy in place for every test after it. This puts the real
 * one back, in the same `beforeEach` that resets the data.
 */
const realSealCapsule = usePlansStore.getState().sealCapsule

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  mockReplace.mockClear()
  usePlansStore.setState({ sealCapsule: realSealCapsule })
  usePlansStore.getState().reset()
})

afterEach(() => {
  jest.restoreAllMocks()
})

/**
 * Presses a `Button` and then waits out its double-tap guard.
 *
 * `Button` swallows a second press within 600ms of the first — a deliberate
 * guard against a fast double tap pushing a destination twice; see its own
 * note. "Continue" on step 1 and "Continue" on step 2 are the SAME Button
 * instance (same position, same component), so the ref holding that guard
 * survives the step change: driven at test speed, the wizard silently stops
 * advancing after its first press.
 *
 * Waiting the guard out here rather than shortening it in the source keeps the
 * test honest about the component a user actually presses.
 */
async function pressButton(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  await user.press(screen.getByRole('button', { name }))

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 650))
  })
}

/** Walks the wizard from step 1 to step 3, leaving the defaults alone. */
async function advanceToStep(user: ReturnType<typeof userEvent.setup>, step: 2 | 3) {
  for (let i = 1; i < step; i += 1) {
    await pressButton(user, CAPSULE_CREATE_COPY.next)
  }
}

/**
 * M06-S07 · Sealing a time capsule.
 *
 * Three steps and a confirmation, all on ONE screen — so "step 2" and "sealed"
 * are states to be driven into, not routes to be rendered directly. Every test
 * below starts at step 1 and presses its way forward, which is also the only
 * way a user can get there.
 */
describe('M06-S07 Seal a capsule · step 1, what goes in', () => {
  it('arrives with three kinds already chosen', async () => {
    await renderScreen(<CapsuleCreateScreen />)

    expect(screen.getByText(CAPSULE_CREATE_COPY.step(1, STEPS))).toBeTruthy()
    expect(screen.getByText(CAPSULE_CREATE_COPY.kindsTitle)).toBeTruthy()

    for (const kind of DEFAULT_KINDS) {
      expect(screen.getByLabelText(kindLabel(kind)).props.accessibilityState).toMatchObject({
        checked: true,
      })
    }

    expect(screen.getByLabelText(kindLabel('memory')).props.accessibilityState).toMatchObject({
      checked: false,
    })
  })

  it('toggles a kind on, and the same kind back off', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await user.press(screen.getByLabelText(kindLabel('memory')))
    expect(screen.getByLabelText(kindLabel('memory')).props.accessibilityState).toMatchObject({
      checked: true,
    })

    // The tiles are checkboxes, not radios — a second press takes it back out
    // rather than leaving it stuck on.
    await user.press(screen.getByLabelText(kindLabel('memory')))
    expect(screen.getByLabelText(kindLabel('memory')).props.accessibilityState).toMatchObject({
      checked: false,
    })
  })

  it('refuses to continue with an empty capsule, and says why', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    for (const kind of DEFAULT_KINDS) {
      await user.press(screen.getByLabelText(kindLabel(kind)))
    }

    await pressButton(user, CAPSULE_CREATE_COPY.next)

    expect(await screen.findByText(CAPSULE_CREATE_COPY.kindsRequired)).toBeTruthy()
    // Still on step 1. The wizard refusing to advance is the assertion that
    // matters — an error message above a screen that had already moved on
    // would be worse than no error at all.
    expect(screen.getByText(CAPSULE_CREATE_COPY.step(1, STEPS))).toBeTruthy()
    expect(screen.getByText(CAPSULE_CREATE_COPY.kindsTitle)).toBeTruthy()
    expect(screen.queryByText(CAPSULE_CREATE_COPY.whenTitle)).toBeNull()
  })

  it('lets a rescued capsule through once something is put back in', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    for (const kind of DEFAULT_KINDS) {
      await user.press(screen.getByLabelText(kindLabel(kind)))
    }
    await pressButton(user, CAPSULE_CREATE_COPY.next)
    expect(await screen.findByText(CAPSULE_CREATE_COPY.kindsRequired)).toBeTruthy()

    await user.press(screen.getByLabelText(kindLabel('promise')))
    await pressButton(user, CAPSULE_CREATE_COPY.next)

    expect(screen.getByText(CAPSULE_CREATE_COPY.step(2, STEPS))).toBeTruthy()
  })
})

describe('M06-S07 Seal a capsule · step 2, when it opens', () => {
  it('offers the four dates and starts on the fifth anniversary', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 2)

    expect(screen.getByText(CAPSULE_CREATE_COPY.whenTitle)).toBeTruthy()

    for (const option of Object.values(CAPSULE_CREATE_COPY.options)) {
      expect(screen.getByLabelText(new RegExp(`^${option}, `))).toBeTruthy()
    }

    expect(
      screen.getByLabelText(new RegExp(`^${CAPSULE_CREATE_COPY.options.fiveYears}, `)).props
        .accessibilityState,
    ).toMatchObject({ selected: true })
  })

  it('picks a different unseal date, and carries it into the summary', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 2)

    const yearOption = screen.getByLabelText(
      new RegExp(`^${CAPSULE_CREATE_COPY.options.year}, `),
    )
    await user.press(yearOption)

    // One choice at a time — the rows are radios, so choosing one has to
    // un-choose the one that was selected a moment ago.
    expect(
      screen.getByLabelText(new RegExp(`^${CAPSULE_CREATE_COPY.options.year}, `)).props
        .accessibilityState,
    ).toMatchObject({ selected: true })
    expect(
      screen.getByLabelText(new RegExp(`^${CAPSULE_CREATE_COPY.options.fiveYears}, `)).props
        .accessibilityState,
    ).toMatchObject({ selected: false })

    // The date the row printed, read off the row rather than recomputed here —
    // re-deriving "one year from now" in the test would only prove the test
    // and the screen share an arithmetic bug.
    const unsealDate = String(yearOption.props.accessibilityLabel).split(', ')[1]

    await pressButton(user, CAPSULE_CREATE_COPY.next)

    expect(screen.getByText(CAPSULE_CREATE_COPY.unsealsOn)).toBeTruthy()
    expect(screen.getByText(unsealDate)).toBeTruthy()
  })
})

describe('M06-S07 Seal a capsule · step 3, the note and the seal', () => {
  it('summarises what is going in, and asks for a note it can do without', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)

    expect(screen.getByText(CAPSULE_CREATE_COPY.step(3, STEPS))).toBeTruthy()

    // A chip per chosen kind, so the last thing seen before sealing is what is
    // actually being sealed.
    for (const kind of DEFAULT_KINDS) {
      const option = SAMPLE_CAPSULE_KINDS.find((o) => o.kind === kind)!
      expect(screen.getByText(option.label)).toBeTruthy()
    }

    // The note field names itself optional, because it is: the test below
    // seals without one.
    expect(
      screen.getByLabelText(`${CAPSULE_CREATE_COPY.noteLabel} · ${CAPSULE_CREATE_COPY.noteOptional}`),
    ).toBeTruthy()
  })

  it('seals with no note at all', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    await pressButton(user, CAPSULE_CREATE_COPY.seal)

    const capsule = usePlansStore.getState().capsules[0]
    // `null`, not `''` — there is no note, rather than an empty one, and the
    // vault renders nothing at all for a null.
    expect(capsule.sealNote).toBeNull()
    expect(screen.getByText(CAPSULE_CREATE_COPY.done.title)).toBeTruthy()
  })

  it('keeps the note that was written on the seal', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    await user.type(
      screen.getByLabelText(
        `${CAPSULE_CREATE_COPY.noteLabel} · ${CAPSULE_CREATE_COPY.noteOptional}`,
      ),
      'Read this on the terrace.',
    )
    await pressButton(user, CAPSULE_CREATE_COPY.seal)

    const capsule = usePlansStore.getState().capsules[0]
    expect(capsule.sealNote).toBe('Read this on the terrace.')
    expect(capsule.contents).toEqual({ photos: 1, letter: 1, prediction: 1 })
  })

  it('hands the whole draft to the store, and prints the capsule it gets back', async () => {
    const user = userEvent.setup()

    const sealCapsule = jest.fn((_draft: CapsuleDraft): Capsule => STUB_SEALED)
    usePlansStore.setState({ sealCapsule })

    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    await user.type(
      screen.getByLabelText(
        `${CAPSULE_CREATE_COPY.noteLabel} · ${CAPSULE_CREATE_COPY.noteOptional}`,
      ),
      'For the two of us.',
    )

    // Frozen only for the final press, so the confirmation's "time locked"
    // figure — computed from the returned capsule's `opensAt` against the
    // current instant, exactly like the vault's countdown — has one right
    // answer. Local midnight, for the timezone reasons `CapsulesScreen.test`
    // spells out. Restored by the file's `afterEach`.
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2026, 8, 21).getTime())

    await pressButton(user, CAPSULE_CREATE_COPY.seal)

    expect(sealCapsule).toHaveBeenCalledTimes(1)
    expect(sealCapsule).toHaveBeenCalledWith({
      kinds: DEFAULT_KINDS,
      opensAt: expect.any(String),
      sealNote: 'For the two of us.',
    })

    // The code the STORE returned, not one the screen composed for itself.
    expect(screen.getByText(STUB_SEALED.vaultCode)).toBeTruthy()
    expect(screen.getByText('9 days')).toBeTruthy()
  })
})

describe('M06-S07 Seal a capsule · the confirmation', () => {
  it("renders 'It's sealed' in place, without navigating anywhere", async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    await pressButton(user, CAPSULE_CREATE_COPY.seal)

    expect(screen.getByText(CAPSULE_CREATE_COPY.done.title)).toBeTruthy()
    expect(screen.getByText(CAPSULE_CREATE_COPY.done.lede)).toBeTruthy()
    expect(screen.getByText(CAPSULE_CREATE_COPY.done.badge)).toBeTruthy()

    // The payoff for the whole flow is a STATE of this screen. Bouncing to the
    // vault would have thrown it away before it was read, so nothing on the
    // router may have been touched.
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()

    // And the wizard behind it is gone rather than merely covered.
    expect(screen.queryByText(CAPSULE_CREATE_COPY.step(3, STEPS))).toBeNull()
    expect(screen.queryByRole('button', { name: CAPSULE_CREATE_COPY.seal })).toBeNull()
  })

  it('cannot be backed out of, and returns home on its own button', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    await pressButton(user, CAPSULE_CREATE_COPY.seal)

    // No back control: there is no step to go back to, and the capsule is
    // already in the store — the seal is not undoable by design.
    expect(screen.queryByLabelText('Go back')).toBeNull()

    await pressButton(user, CAPSULE_CREATE_COPY.done.home)

    // `replace`, not `push` — a finished flow is not something to back into.
    expect(mockReplace).toHaveBeenCalledWith('/(app)/plans')
  })
})

describe('M06-S07 Seal a capsule · going back', () => {
  it('steps back through the wizard rather than leaving it', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await advanceToStep(user, 3)
    expect(screen.getByText(CAPSULE_CREATE_COPY.step(3, STEPS))).toBeTruthy()

    await user.press(screen.getByLabelText('Go back'))
    expect(screen.getByText(CAPSULE_CREATE_COPY.step(2, STEPS))).toBeTruthy()

    await user.press(screen.getByLabelText('Go back'))
    expect(screen.getByText(CAPSULE_CREATE_COPY.step(1, STEPS))).toBeTruthy()

    // The header's back button is the wizard's back button for as long as
    // there is a step behind it — popping the stack here would have thrown
    // away a half-filled draft that lives nowhere else.
    expect(mockBack).not.toHaveBeenCalled()
  })

  it('leaves the screen only from step 1', async () => {
    const user = userEvent.setup()
    await renderScreen(<CapsuleCreateScreen />)

    await user.press(screen.getByLabelText('Go back'))

    expect(mockBack).toHaveBeenCalled()
  })
})
