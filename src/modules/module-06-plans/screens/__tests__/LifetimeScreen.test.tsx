import { screen, userEvent } from '@testing-library/react-native'

import { LIFETIME_COPY } from '@/copy/lifetime'

import { LifetimeScreen } from '@/modules/module-06-plans/screens/LifetimeScreen'
import { SAMPLE_LIFETIME } from '@/sample/plans'
import type { PromiseCategory } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

/**
 * M06-S05 · Once in a Lifetime — the shared-promises bucketlist.
 *
 * Like the bingo board this reads `plansStore` directly rather than a service,
 * so the seed in `@/sample/plans` is the fixture and `reset()` before each test
 * is what keeps a toggled promise or an added dream out of the next one.
 */

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: mockReplace }),
}))

/**
 * A PASSTHROUGH WRAPPER AROUND `Text`, SO THE STRIKE IS OBSERVABLE AT ALL.
 *
 * A lived promise is struck through, and the screen's own header calls that out
 * as load-bearing rather than decorative: the tick, the green badge and the
 * strike each say "lived", so the state survives losing any one of them. It is
 * worth a test — but under Jest nothing about it reaches the rendered tree:
 *
 *   1. The Unistyles mock strips `variants` and no-ops `useVariants` (see the
 *      header of `jest.config.js`), so `textDecorationLine: 'line-through'`
 *      never lands on the host node — the rendered style is literally `{}`.
 *   2. `Text` consumes `strike` and does not forward it, by design: the
 *      primitive exposes no `style` prop, which is the mechanism keeping raw
 *      visual values out of screens.
 *   3. RNTL 14 dropped the `UNSAFE_*ByType` queries, so the composite element
 *      carrying the prop cannot be reached either.
 *
 * So the prop is mirrored onto a `testID`, which `Text` DOES forward. The real
 * component still renders — this adds one attribute and changes nothing else,
 * which is why the other 20-odd tests in this file are unaffected by it.
 *
 * The literal below has to be written out rather than referencing
 * `STRUCK_TEST_ID`: a `jest.mock` factory runs while the module graph is still
 * being imported, before any `const` in this file has been initialised.
 */
jest.mock('@/design-system/primitives/Text', () => {
  const actual = jest.requireActual('@/design-system/primitives/Text')
  const react = jest.requireActual('react')

  return {
    ...actual,
    Text: ({ strike = false, ...rest }: { strike?: boolean; testID?: string }) =>
      react.createElement(actual.Text, {
        ...rest,
        strike,
        testID: strike ? 'text-struck-through' : rest.testID,
      }),
  }
})

/** Must match the literal inside the `Text` mock above. */
const STRUCK_TEST_ID = 'text-struck-through'

beforeEach(() => {
  jest.clearAllMocks()
  usePlansStore.getState().reset()
})

/* ------------------------------------------------------------------ *
 * Derived from the seed, never typed out — the list is 19 hand-written
 * promises across 5 categories and the per-section figures are exactly
 * the numbers most likely to be edited by hand later.
 * ------------------------------------------------------------------ */

/** Same order the screen renders its sections in. */
const CATEGORIES: PromiseCategory[] = ['travel', 'adventure', 'romance', 'life', 'wild']

const PROMISES = SAMPLE_LIFETIME.promises
const TARGET = SAMPLE_LIFETIME.target
const LIVED = PROMISES.filter((promise) => promise.lived).length

const inCategory = (category: PromiseCategory) =>
  PROMISES.filter((promise) => promise.category === category)

/** The "2 of 4 lived" figure a section head prints for itself. */
const progressFor = (category: PromiseCategory) =>
  LIFETIME_COPY.categoryProgress(
    inCategory(category).filter((promise) => promise.lived).length,
    inCategory(category).length,
  )

/**
 * How many sections print a given figure.
 *
 * Two of the five sections genuinely read "1 of 4 lived" — Adventure and Life —
 * so a plain `getByText` on a section figure throws on the duplicate. Counting
 * occurrences asserts the same thing without pretending the strings are unique.
 */
const sectionsShowing = (figure: string, only?: PromiseCategory) =>
  CATEGORIES.filter(
    (category) => (only === undefined || category === only) && progressFor(category) === figure,
  ).length

/** The label a row announces, which names what the next tap does. */
const labelFor = (title: string, lived: boolean) =>
  `${title}. ${lived ? LIFETIME_COPY.toggleHint.lived : LIFETIME_COPY.toggleHint.waiting}`

const livedInStore = (id: string) =>
  usePlansStore.getState().promises.find((promise) => promise.id === id)!.lived

/** Whether the `Text` rendering this title was handed `strike` — see the mock above. */
const strikeOn = (title: string) => screen.getByText(title).props.testID === STRUCK_TEST_ID

describe('M06-S05 Once in a Lifetime — grouping', () => {
  it('splits the promises into the five headed sections the frame draws', async () => {
    await renderScreen(<LifetimeScreen />)

    for (const category of CATEGORIES) {
      // The heading appears twice by design — once as the section head, once on
      // its filter chip — so presence is asserted rather than uniqueness.
      expect(screen.getAllByText(LIFETIME_COPY.categories[category]).length).toBeGreaterThan(0)
    }

    for (const promise of PROMISES) {
      expect(screen.getByLabelText(labelFor(promise.title, promise.lived))).toBeTruthy()
    }
  })

  it('gives every section its own lived-of-total count', async () => {
    await renderScreen(<LifetimeScreen />)

    for (const category of CATEGORIES) {
      const figure = progressFor(category)

      expect(screen.getAllByText(figure).length).toBe(sectionsShowing(figure))
    }
  })

  it('counts each category on its own chip', async () => {
    await renderScreen(<LifetimeScreen />)

    expect(screen.getByLabelText(`${LIFETIME_COPY.all}, ${PROMISES.length}`)).toBeTruthy()

    for (const category of CATEGORIES) {
      expect(
        screen.getByLabelText(
          `${LIFETIME_COPY.categories[category]}, ${inCategory(category).length}`,
        ),
      ).toBeTruthy()
    }
  })

  it('totals the whole list against the target, not against the list length', async () => {
    await renderScreen(<LifetimeScreen />)

    // The couple promised 50; 19 are written down so far. The summary line is
    // about the pact, which is why the denominator is the target.
    expect(screen.getByText(LIFETIME_COPY.summary(LIVED, TARGET))).toBeTruthy()
    expect(
      screen.getByText(LIFETIME_COPY.percentLived(Math.round((LIVED / TARGET) * 100))),
    ).toBeTruthy()
    expect(screen.getByText(LIFETIME_COPY.stillWaiting(TARGET - LIVED))).toBeTruthy()
  })
})

describe('M06-S05 Once in a Lifetime — the category filter', () => {
  it('narrows the page to a single section', async () => {
    const user = userEvent.setup()
    const chosen: PromiseCategory = 'travel'

    await renderScreen(<LifetimeScreen />)

    await user.press(
      screen.getByLabelText(`${LIFETIME_COPY.categories[chosen]}, ${inCategory(chosen).length}`),
    )

    // Every promise, not a sampled one — a filter that leaks one row is broken.
    for (const promise of PROMISES) {
      const query = screen.queryByLabelText(labelFor(promise.title, promise.lived))

      if (promise.category === chosen) expect(query).toBeTruthy()
      else expect(query).toBeNull()
    }
  })

  it('leaves only the chosen section head standing', async () => {
    const user = userEvent.setup()
    const chosen: PromiseCategory = 'romance'

    await renderScreen(<LifetimeScreen />)

    await user.press(
      screen.getByLabelText(`${LIFETIME_COPY.categories[chosen]}, ${inCategory(chosen).length}`),
    )

    for (const category of CATEGORIES) {
      const figure = progressFor(category)

      expect(screen.queryAllByText(figure).length).toBe(sectionsShowing(figure, chosen))
    }
  })

  it('keeps the whole-list summary while a single category is in view', async () => {
    const user = userEvent.setup()
    const chosen: PromiseCategory = 'wild'

    await renderScreen(<LifetimeScreen />)

    await user.press(
      screen.getByLabelText(`${LIFETIME_COPY.categories[chosen]}, ${inCategory(chosen).length}`),
    )

    // The filter is a view over the list, not a different list — the pact's
    // progress is unchanged by what you happen to be looking at.
    expect(screen.getByText(LIFETIME_COPY.summary(LIVED, TARGET))).toBeTruthy()
  })

  it('marks the chip in view as selected, and All as not', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.press(screen.getByLabelText(`${LIFETIME_COPY.categories.life}, ${inCategory('life').length}`))

    expect(
      screen.getByLabelText(`${LIFETIME_COPY.categories.life}, ${inCategory('life').length}`).props
        .accessibilityState,
    ).toMatchObject({ selected: true })
    expect(
      screen.getByLabelText(`${LIFETIME_COPY.all}, ${PROMISES.length}`).props.accessibilityState,
    ).toMatchObject({ selected: false })
  })

  it('brings every section back when All is chosen again', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.press(
      screen.getByLabelText(`${LIFETIME_COPY.categories.travel}, ${inCategory('travel').length}`),
    )
    await user.press(screen.getByLabelText(`${LIFETIME_COPY.all}, ${PROMISES.length}`))

    for (const promise of PROMISES) {
      expect(screen.getByLabelText(labelFor(promise.title, promise.lived))).toBeTruthy()
    }
  })
})

describe('M06-S05 Once in a Lifetime — living a promise', () => {
  const waiting = PROMISES.find((promise) => !promise.lived)!
  const alreadyLived = PROMISES.find((promise) => promise.lived)!

  it('flips a waiting promise to lived, in the store and in what it announces', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.press(screen.getByLabelText(labelFor(waiting.title, false)))

    expect(livedInStore(waiting.id)).toBe(true)
    expect(screen.getByLabelText(labelFor(waiting.title, true))).toBeTruthy()
    expect(
      screen.getByLabelText(labelFor(waiting.title, true)).props.accessibilityState,
    ).toMatchObject({ checked: true })
  })

  it('strikes the title through once the promise is lived', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    // A promise still waiting is plain; the seeded lived one is already struck,
    // so the strike tracks state rather than tracking the tap.
    expect(strikeOn(waiting.title)).toBe(false)
    expect(strikeOn(alreadyLived.title)).toBe(true)

    await user.press(screen.getByLabelText(labelFor(waiting.title, false)))

    expect(strikeOn(waiting.title)).toBe(true)
  })

  it('un-lives a promise that was tapped by mistake', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.press(screen.getByLabelText(labelFor(alreadyLived.title, true)))

    expect(livedInStore(alreadyLived.id)).toBe(false)
    expect(strikeOn(alreadyLived.title)).toBe(false)
    expect(screen.getByLabelText(labelFor(alreadyLived.title, false))).toBeTruthy()
  })

  it('moves the figures — the section count, the badge and the summary — in one tap', async () => {
    const user = userEvent.setup()
    const section = waiting.category
    const before = inCategory(section).filter((promise) => promise.lived).length

    await renderScreen(<LifetimeScreen />)

    // One badge per lived promise before the tap — the badge, the tick and the
    // strike are three readings of one fact.
    expect(screen.getAllByText(LIFETIME_COPY.didIt.toUpperCase()).length).toBe(LIVED)

    await user.press(screen.getByLabelText(labelFor(waiting.title, false)))

    expect(
      screen.getAllByText(
        LIFETIME_COPY.categoryProgress(before + 1, inCategory(section).length),
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText(LIFETIME_COPY.summary(LIVED + 1, TARGET))).toBeTruthy()
    expect(screen.getAllByText(LIFETIME_COPY.didIt.toUpperCase()).length).toBe(LIVED + 1)
  })
})

describe('M06-S05 Once in a Lifetime — adding a dream', () => {
  const NEW_DREAM = 'Learn to sail somewhere warm'

  it('will not let an empty field be submitted', async () => {
    await renderScreen(<LifetimeScreen />)

    expect(
      screen.getByRole('button', { name: LIFETIME_COPY.add.action }).props.accessibilityState,
    ).toMatchObject({ disabled: true })
  })

  it('still refuses when the field holds nothing but spaces', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), '   ')

    // The screen trims before it checks, so whitespace is not a title.
    expect(
      screen.getByRole('button', { name: LIFETIME_COPY.add.action }).props.accessibilityState,
    ).toMatchObject({ disabled: true })
  })

  it('opens the button as soon as there is something to add', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), NEW_DREAM)

    expect(
      screen.getByRole('button', { name: LIFETIME_COPY.add.action }).props.accessibilityState,
    ).toMatchObject({ disabled: false })
  })

  it('appends the dream to the store and files it under Life when viewing All', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), NEW_DREAM)
    await user.press(screen.getByRole('button', { name: LIFETIME_COPY.add.action }))

    const promises = usePlansStore.getState().promises

    expect(promises.length).toBe(PROMISES.length + 1)
    // Appended, not prepended: the list is a pact written down in order.
    expect(promises.at(-1)).toMatchObject({
      title: NEW_DREAM,
      category: 'life',
      lived: false,
      tag: 'Ours',
    })
  })

  it('shows the new dream inside the Life section, still waiting', async () => {
    const user = userEvent.setup()
    const life = inCategory('life')

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), NEW_DREAM)
    await user.press(screen.getByRole('button', { name: LIFETIME_COPY.add.action }))

    expect(screen.getByLabelText(labelFor(NEW_DREAM, false))).toBeTruthy()
    // The Life section's denominator grows by one; its lived count does not.
    expect(
      screen.getAllByText(
        LIFETIME_COPY.categoryProgress(
          life.filter((promise) => promise.lived).length,
          life.length + 1,
        ),
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByLabelText(`${LIFETIME_COPY.categories.life}, ${life.length + 1}`),
    ).toBeTruthy()
  })

  it('files the dream under the category in view instead', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.press(
      screen.getByLabelText(
        `${LIFETIME_COPY.categories.adventure}, ${inCategory('adventure').length}`,
      ),
    )
    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), NEW_DREAM)
    await user.press(screen.getByRole('button', { name: LIFETIME_COPY.add.action }))

    expect(usePlansStore.getState().promises.at(-1)).toMatchObject({
      title: NEW_DREAM,
      category: 'adventure',
    })
    // And it is visible without leaving the filter that named it.
    expect(screen.getByLabelText(labelFor(NEW_DREAM, false))).toBeTruthy()
  })

  it('empties the field afterwards, and shuts the button again with it', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), NEW_DREAM)
    await user.press(screen.getByRole('button', { name: LIFETIME_COPY.add.action }))

    expect(screen.getByLabelText(LIFETIME_COPY.add.title).props.value).toBe('')
    expect(
      screen.getByRole('button', { name: LIFETIME_COPY.add.action }).props.accessibilityState,
    ).toMatchObject({ disabled: true })
  })

  it('trims the title it stores rather than keeping the user’s stray spaces', async () => {
    const user = userEvent.setup()

    await renderScreen(<LifetimeScreen />)

    await user.type(screen.getByLabelText(LIFETIME_COPY.add.title), `  ${NEW_DREAM}  `)
    await user.press(screen.getByRole('button', { name: LIFETIME_COPY.add.action }))

    expect(usePlansStore.getState().promises.at(-1)?.title).toBe(NEW_DREAM)
  })
})

describe('M06-S05 Once in a Lifetime — the frame around the list', () => {
  it('draws the intro and the empty-category line is nowhere to be seen', async () => {
    await renderScreen(<LifetimeScreen />)

    expect(screen.getByText(LIFETIME_COPY.title)).toBeTruthy()
    expect(screen.getByText(LIFETIME_COPY.eyebrow)).toBeTruthy()
    expect(screen.getByText(LIFETIME_COPY.lede(TARGET))).toBeTruthy()
    // Every seeded category has promises in it, so no section is empty.
    expect(screen.queryByText(LIFETIME_COPY.empty)).toBeNull()
  })

  it('says a category is empty when nothing has been promised in it yet', async () => {
    // What a real couple sees before they have written anything down — the seed
    // becomes `[]` once there is a backend (see the header of `plansStore`).
    usePlansStore.setState({ promises: [] })

    await renderScreen(<LifetimeScreen />)

    expect(screen.getAllByText(LIFETIME_COPY.empty).length).toBe(CATEGORIES.length)
    expect(screen.getByText(LIFETIME_COPY.summary(0, TARGET))).toBeTruthy()
    expect(screen.getByText(LIFETIME_COPY.percentLived(0))).toBeTruthy()
  })

  it('names the last promise lived, and says nothing when none has been', async () => {
    const lastLived = [...PROMISES].reverse().find((promise) => promise.lived)!

    await renderScreen(<LifetimeScreen />)

    expect(screen.getByText(LIFETIME_COPY.lastCompleted(lastLived.title))).toBeTruthy()
  })

  it('marks Plans as the tab in view', async () => {
    await renderScreen(<LifetimeScreen />)

    expect(screen.getByLabelText('Plans').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })
})
