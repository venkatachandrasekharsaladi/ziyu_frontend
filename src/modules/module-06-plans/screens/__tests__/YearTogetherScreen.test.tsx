import { screen, userEvent } from '@testing-library/react-native'

import { YEAR_COPY } from '@/copy/yearTogether'
import { YearTogetherScreen } from '@/modules/module-06-plans/screens/YearTogetherScreen'
import { SAMPLE_YEAR_BOARD } from '@/sample/plans'
import type { BingoTile, BingoTileState } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { renderScreen } from '@/test/renderScreen'

/**
 * M06-S04 · Our Year Together — the 25-tile couple bingo board.
 *
 * `plansStore` is in-memory and seeded from `@/sample/plans`, so unlike the
 * memories suite there is no service to mock — the store IS the fixture. It is
 * reset before every test because `cycleTile` mutates the board and a tile left
 * half-way round its cycle would make the next test pass or fail by order.
 */

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: mockReplace }),
}))

beforeEach(() => {
  jest.clearAllMocks()
  usePlansStore.getState().reset()
})

/* ------------------------------------------------------------------ *
 * Everything expected here is DERIVED from the seed rather than typed
 * out. The board is 25 hand-written tiles; hardcoding "8 stamped" would
 * mean a test that fails when someone edits a note, and — worse — one
 * that still passes when someone edits a state.
 * ------------------------------------------------------------------ */

const TILES = SAMPLE_YEAR_BOARD.tiles
const TOTAL = TILES.length
const countOf = (state: BingoTileState) => TILES.filter((tile) => tile.state === state).length

/** The label the tile announces, which names the state the NEXT tap moves it to. */
const labelFor = (title: string, state: BingoTileState) =>
  `${title}. ${YEAR_COPY.cycleHint[state]}`

/** The first seeded tile in a given state — the subject of the cycle tests. */
const firstTile = (state: BingoTileState) => TILES.find((tile) => tile.state === state)!

/** Reads one tile back out of the store, which is where the cycle actually lives. */
const stateOf = (id: string) =>
  usePlansStore.getState().yearBoard.tiles.find((tile) => tile.id === id)!.state

/** Replaces the seeded board wholesale — the store exposes no board setter. */
const putTiles = (tiles: BingoTile[]) =>
  usePlansStore.setState({ yearBoard: { ...SAMPLE_YEAR_BOARD, tiles } })

describe('M06-S04 Our Year Together — the tile cycle', () => {
  /**
   * THE design decision on this screen, and the reason it is asserted first.
   *
   * The frame draws three tile states and spends its one accent colour on the
   * middle one, so the tap has to be a three-step cycle rather than a checkbox —
   * a toggle would leave "in progress" unreachable by touch. Asserting the round
   * trip all the way back to `todo` is what stops someone "simplifying" this
   * into a boolean later.
   */
  it('cycles a tile todo → in progress → done → todo rather than toggling it', async () => {
    const user = userEvent.setup()
    const tile = firstTile('todo')

    await renderScreen(<YearTogetherScreen />)

    await user.press(screen.getByLabelText(labelFor(tile.title, 'todo')))
    expect(stateOf(tile.id)).toBe('in-progress')

    // The second tap is the one a toggle would get wrong: it must move FORWARD
    // to done, not back to todo.
    await user.press(screen.getByLabelText(labelFor(tile.title, 'in-progress')))
    expect(stateOf(tile.id)).toBe('done')

    await user.press(screen.getByLabelText(labelFor(tile.title, 'done')))
    expect(stateOf(tile.id)).toBe('todo')
  })

  /**
   * The same cycle read the way a screen reader reads it.
   *
   * Sighted users take the state off the card's colour — amber for in progress,
   * a tick for done. A blind user has only this label, so it is the entire
   * affordance and is tested as a first-class behaviour, not a nicety.
   */
  it('announces the state the next tap will move the tile into', async () => {
    const user = userEvent.setup()
    const tile = firstTile('todo')

    await renderScreen(<YearTogetherScreen />)

    expect(screen.getByLabelText(labelFor(tile.title, 'todo'))).toBeTruthy()

    await user.press(screen.getByLabelText(labelFor(tile.title, 'todo')))

    expect(screen.getByLabelText(labelFor(tile.title, 'in-progress'))).toBeTruthy()
    // The old announcement is gone, rather than a second label for the same tile.
    expect(screen.queryByLabelText(labelFor(tile.title, 'todo'))).toBeNull()

    await user.press(screen.getByLabelText(labelFor(tile.title, 'in-progress')))

    expect(screen.getByLabelText(labelFor(tile.title, 'done'))).toBeTruthy()
  })

  it('shows the badge the state earns, and nothing at all for a fresh tile', async () => {
    const user = userEvent.setup()
    const tile = firstTile('todo')

    await renderScreen(<YearTogetherScreen />)

    const badgesBefore = screen.getAllByText(YEAR_COPY.badge['in-progress']).length

    await user.press(screen.getByLabelText(labelFor(tile.title, 'todo')))

    expect(screen.getAllByText(YEAR_COPY.badge['in-progress']).length).toBe(badgesBefore + 1)
  })
})

describe('M06-S04 Our Year Together — filters', () => {
  it('counts each filter off the board it is filtering', async () => {
    await renderScreen(<YearTogetherScreen />)

    // The Chip announces itself as "label, count", so the figure on the pill is
    // assertable without reaching into the rendered number.
    expect(screen.getByLabelText(`${YEAR_COPY.filters.all}, ${TOTAL}`)).toBeTruthy()
    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done')}`),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.inProgress}, ${countOf('in-progress')}`),
    ).toBeTruthy()
  })

  it('moves a tile between the counts when it is stamped', async () => {
    const user = userEvent.setup()
    const tile = firstTile('in-progress')

    await renderScreen(<YearTogetherScreen />)

    await user.press(screen.getByLabelText(labelFor(tile.title, 'in-progress')))

    // One leaves In Progress and arrives in Completed in the same tap — the two
    // counts are selectors over one board, so they cannot disagree.
    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.inProgress}, ${countOf('in-progress') - 1}`),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done') + 1}`),
    ).toBeTruthy()
  })

  it('narrows the grid to the stamped tiles under Completed', async () => {
    const user = userEvent.setup()
    await renderScreen(<YearTogetherScreen />)

    await user.press(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done')}`),
    )

    // Every tile, not a sampled one: a filter that leaks a single row is still
    // broken, and picking two examples would not have caught it.
    for (const tile of TILES) {
      const query = screen.queryByLabelText(labelFor(tile.title, tile.state))

      if (tile.state === 'done') expect(query).toBeTruthy()
      else expect(query).toBeNull()
    }
  })

  it('narrows the grid to the tiles on the go under In Progress', async () => {
    const user = userEvent.setup()
    await renderScreen(<YearTogetherScreen />)

    await user.press(
      screen.getByLabelText(`${YEAR_COPY.filters.inProgress}, ${countOf('in-progress')}`),
    )

    for (const tile of TILES) {
      const query = screen.queryByLabelText(labelFor(tile.title, tile.state))

      if (tile.state === 'in-progress') expect(query).toBeTruthy()
      else expect(query).toBeNull()
    }
  })

  it('puts every tile back when All is chosen again', async () => {
    const user = userEvent.setup()
    await renderScreen(<YearTogetherScreen />)

    await user.press(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done')}`),
    )
    await user.press(screen.getByLabelText(`${YEAR_COPY.filters.all}, ${TOTAL}`))

    for (const tile of TILES) {
      expect(screen.getByLabelText(labelFor(tile.title, tile.state))).toBeTruthy()
    }
  })

  it('marks the chip in view as selected, and only that one', async () => {
    const user = userEvent.setup()
    await renderScreen(<YearTogetherScreen />)

    await user.press(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done')}`),
    )

    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.completed}, ${countOf('done')}`).props
        .accessibilityState,
    ).toMatchObject({ selected: true })
    expect(
      screen.getByLabelText(`${YEAR_COPY.filters.all}, ${TOTAL}`).props.accessibilityState,
    ).toMatchObject({ selected: false })
  })
})

/**
 * The seed is a designed board and never leaves a filter empty, which is exactly
 * why these states need a board built for them. When the backend lands the seed
 * becomes `[]` (see the header of `plansStore`) and this is the first view a new
 * couple gets — so it is tested now, while it is cheap.
 */
describe('M06-S04 Our Year Together — empty states', () => {
  it('says nothing is stamped yet when no tile is done', async () => {
    const user = userEvent.setup()
    const tiles = TILES.map((tile) => ({ ...tile, state: 'todo' as const }))

    putTiles(tiles)
    await renderScreen(<YearTogetherScreen />)

    await user.press(screen.getByLabelText(`${YEAR_COPY.filters.completed}, 0`))

    expect(screen.getByText(YEAR_COPY.empty.completed)).toBeTruthy()
  })

  it('says nothing is on the go when no tile is in progress', async () => {
    const user = userEvent.setup()
    const tiles = TILES.map((tile) => ({ ...tile, state: 'todo' as const }))

    putTiles(tiles)
    await renderScreen(<YearTogetherScreen />)

    await user.press(screen.getByLabelText(`${YEAR_COPY.filters.inProgress}, 0`))

    expect(screen.getByText(YEAR_COPY.empty['in-progress'])).toBeTruthy()
  })

  it('says the board itself is empty when there are no tiles at all', async () => {
    putTiles([])
    await renderScreen(<YearTogetherScreen />)

    expect(screen.getByText(YEAR_COPY.empty.all)).toBeTruthy()
    // A 0/0 board must not divide by zero into a NaN progress line.
    expect(screen.getByText(YEAR_COPY.progress(0, 0))).toBeTruthy()
    expect(screen.getByText(YEAR_COPY.completed(0))).toBeTruthy()
  })
})

describe('M06-S04 Our Year Together — progress', () => {
  it('prints the stamped figure over the whole board, not over the filtered view', async () => {
    const stamped = countOf('done')

    await renderScreen(<YearTogetherScreen />)

    expect(screen.getByText(YEAR_COPY.progress(stamped, TOTAL))).toBeTruthy()
    expect(
      screen.getByText(YEAR_COPY.completed(Math.round((stamped / TOTAL) * 100))),
    ).toBeTruthy()
    expect(screen.getByText(YEAR_COPY.toGo(TOTAL - stamped))).toBeTruthy()
  })

  it('counts a newly stamped tile into the progress line', async () => {
    const user = userEvent.setup()
    const stamped = countOf('done')
    const tile = firstTile('in-progress')

    await renderScreen(<YearTogetherScreen />)

    await user.press(screen.getByLabelText(labelFor(tile.title, 'in-progress')))

    expect(screen.getByText(YEAR_COPY.progress(stamped + 1, TOTAL))).toBeTruthy()
    expect(screen.getByText(YEAR_COPY.toGo(TOTAL - stamped - 1))).toBeTruthy()
    expect(screen.queryByText(YEAR_COPY.progress(stamped, TOTAL))).toBeNull()
  })

  it('drops the figure again when a stamped tile is cleared', async () => {
    const user = userEvent.setup()
    const stamped = countOf('done')
    const tile = firstTile('done')

    await renderScreen(<YearTogetherScreen />)

    // `done` cycles round to `todo`, so stamping is undoable without a
    // separate "unstamp" control.
    await user.press(screen.getByLabelText(labelFor(tile.title, 'done')))

    expect(screen.getByText(YEAR_COPY.progress(stamped - 1, TOTAL))).toBeTruthy()
  })
})

describe('M06-S04 Our Year Together — the frame around the board', () => {
  it('draws the intro, the year, and the encouragement the board was seeded with', async () => {
    await renderScreen(<YearTogetherScreen />)

    expect(screen.getByText(YEAR_COPY.title)).toBeTruthy()
    expect(screen.getByText(YEAR_COPY.eyebrow)).toBeTruthy()
    expect(screen.getByText(String(SAMPLE_YEAR_BOARD.year))).toBeTruthy()
    expect(screen.getByText(`“${SAMPLE_YEAR_BOARD.encouragement}”`)).toBeTruthy()
    expect(screen.getByText(String(SAMPLE_YEAR_BOARD.daysRemaining))).toBeTruthy()
  })

  it('marks Plans as the tab in view', async () => {
    await renderScreen(<YearTogetherScreen />)

    expect(screen.getByLabelText('Plans').props.accessibilityState).toMatchObject({
      selected: true,
    })
  })
})
