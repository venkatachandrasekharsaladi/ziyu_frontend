import {
  SAMPLE_CAPSULES,
  SAMPLE_LETTERS,
  SAMPLE_LIFETIME,
  SAMPLE_PLACES,
  SAMPLE_YEAR_BOARD,
} from '@/sample/plans'
import {
  selectPromisesLived,
  selectSealedCapsules,
  selectTilesInProgress,
  selectTilesStamped,
  selectWaitingLetters,
  usePlansStore,
} from '@/state/plansStore'

/** Today, in the `YYYY-MM-DD` shape the store stamps onto whatever it seals. */
const TODAY = new Date().toISOString().slice(0, 10)

/** A tile the sample leaves untouched, so the cycle can be walked from its start. */
const TODO_TILE = SAMPLE_YEAR_BOARD.tiles.find((tile) => tile.state === 'todo')!

describe('plansStore', () => {
  beforeEach(() => {
    usePlansStore.getState().reset()
  })

  /*
   * THE SEED, asserted against `@/sample/plans` rather than against literal
   * numbers. The sample is a design being built ahead of a backend and is still
   * being edited — a test that wrote "25 tiles" would fail the next time the
   * board gains a row, which is not a regression in anything.
   */
  it('opens on the sample content rather than empty', () => {
    const state = usePlansStore.getState()

    expect(state.yearBoard.tiles).toHaveLength(SAMPLE_YEAR_BOARD.tiles.length)
    expect(state.promises).toHaveLength(SAMPLE_LIFETIME.promises.length)
    expect(state.lifetimeTarget).toBe(SAMPLE_LIFETIME.target)
    expect(state.capsules).toHaveLength(SAMPLE_CAPSULES.length)
    expect(state.letters).toHaveLength(SAMPLE_LETTERS.length)
    expect(state.selectedDay).toBe(1)
    expect(state.sharingWindow).toBe(SAMPLE_PLACES.activeWindow)
    expect(state.minutesRemaining).toBe(SAMPLE_PLACES.minutesRemaining)
  })

  it('seeds a clone, so playing the board does not rewrite the sample itself', () => {
    const first = SAMPLE_YEAR_BOARD.tiles[0]
    const seeded = first.state

    usePlansStore.getState().cycleTile(first.id)

    // The module-level sample is what every `reset()` reads from. Were the store
    // holding a reference rather than a clone, cycling a tile here would leave
    // every later test — in this file and in every screen suite — starting from
    // a board somebody else had already played.
    expect(SAMPLE_YEAR_BOARD.tiles[0].state).toBe(seeded)
    expect(usePlansStore.getState().yearBoard.tiles[0].state).not.toBe(seeded)
  })

  describe('cycleTile', () => {
    it('walks todo to in progress to done and back, because the board draws three states', () => {
      const { cycleTile } = usePlansStore.getState()
      const stateOf = () =>
        usePlansStore.getState().yearBoard.tiles.find((tile) => tile.id === TODO_TILE.id)!.state

      expect(stateOf()).toBe('todo')

      cycleTile(TODO_TILE.id)
      expect(stateOf()).toBe('in-progress')

      cycleTile(TODO_TILE.id)
      expect(stateOf()).toBe('done')

      // Back to the start. The third tap is how a mis-stamped tile is undone,
      // and there is no other way to reach `todo` from the board.
      cycleTile(TODO_TILE.id)
      expect(stateOf()).toBe('todo')
    })

    it('moves only the tile it was given', () => {
      const before = usePlansStore.getState().yearBoard.tiles.map((tile) => tile.state)

      usePlansStore.getState().cycleTile(TODO_TILE.id)

      usePlansStore.getState().yearBoard.tiles.forEach((tile, index) => {
        if (tile.id === TODO_TILE.id) return
        expect(tile.state).toBe(before[index])
      })
    })

    it('ignores a tile id that is not on the board', () => {
      const before = usePlansStore.getState().yearBoard.tiles

      usePlansStore.getState().cycleTile('y-does-not-exist')

      expect(usePlansStore.getState().yearBoard.tiles).toEqual(before)
    })

    it('carries the counts the hub reads with it', () => {
      const stamped = selectTilesStamped(usePlansStore.getState())
      const inProgress = selectTilesInProgress(usePlansStore.getState())

      usePlansStore.getState().cycleTile(TODO_TILE.id)

      // todo to in-progress: one more amber card, the stamped total untouched.
      expect(selectTilesInProgress(usePlansStore.getState())).toBe(inProgress + 1)
      expect(selectTilesStamped(usePlansStore.getState())).toBe(stamped)

      usePlansStore.getState().cycleTile(TODO_TILE.id)

      // in-progress to done: the amber card is spent on the stamp.
      expect(selectTilesStamped(usePlansStore.getState())).toBe(stamped + 1)
      expect(selectTilesInProgress(usePlansStore.getState())).toBe(inProgress)
    })
  })

  describe('sealCapsule', () => {
    const draft = {
      kinds: ['photos', 'letter'] as const,
      opensAt: '2030-05-01',
      sealNote: '  Open this when the flat feels quiet.  ',
    }

    it('returns the capsule it sealed, so the confirmation can print its code', () => {
      const capsule = usePlansStore.getState().sealCapsule({ ...draft, kinds: [...draft.kinds] })

      expect(capsule.opensAt).toBe('2030-05-01')
      expect(capsule.createdAt).toBe(TODAY)
      expect(capsule.sealedBy).toBe('both')
      expect(capsule.opened).toBe(false)
      // The year on the code is the year it OPENS, not the year it was written
      // — that is the figure the couple will be searching the vault for in 2030.
      expect(capsule.vaultCode).toBe('TOT-2030-CS')
    })

    it('trims the seal note, and keeps nothing rather than an empty string', () => {
      const withNote = usePlansStore.getState().sealCapsule({ ...draft, kinds: [...draft.kinds] })

      expect(withNote.sealNote).toBe('Open this when the flat feels quiet.')

      const blank = usePlansStore
        .getState()
        .sealCapsule({ ...draft, kinds: [...draft.kinds], sealNote: '   ' })

      // `null`, not `''` — the sealed card renders the note only when there is
      // one, and an empty string would draw a pair of empty quotation marks.
      expect(blank.sealNote).toBeNull()
    })

    it('counts one of each kind the draft chose', () => {
      const capsule = usePlansStore
        .getState()
        .sealCapsule({ ...draft, kinds: ['photos', 'promise', 'question'] })

      expect(capsule.contents).toEqual({ photos: 1, promise: 1, question: 1 })
    })

    it('puts the newest capsule first and raises the sealed count', () => {
      const sealed = selectSealedCapsules(usePlansStore.getState())

      const capsule = usePlansStore.getState().sealCapsule({ ...draft, kinds: [...draft.kinds] })

      expect(usePlansStore.getState().capsules[0]).toEqual(capsule)
      expect(usePlansStore.getState().capsules).toHaveLength(SAMPLE_CAPSULES.length + 1)
      expect(selectSealedCapsules(usePlansStore.getState())).toBe(sealed + 1)
    })
  })

  describe('sealLetter', () => {
    const draft = {
      to: 'partner' as const,
      title: '  For a Tuesday  ',
      body: 'x'.repeat(200),
      opensAt: '2029-02-14',
    }

    it('seals a letter that has a date on it', () => {
      const letter = usePlansStore.getState().sealLetter(draft)

      expect(letter.state).toBe('sealed')
      expect(letter.opensAt).toBe('2029-02-14')
      expect(letter.from).toBe('me')
      expect(letter.to).toBe('partner')
      expect(letter.writtenAt).toBe(TODAY)
      expect(letter.title).toBe('For a Tuesday')
    })

    it('leaves a letter with no date readable straight away', () => {
      const letter = usePlansStore.getState().sealLetter({ ...draft, opensAt: null })

      // "Whenever they wish" is a choice NOT to seal, so the letter is `ready`
      // and dated today — not `sealed` with a missing date the reading view
      // would then have to guess at.
      expect(letter.state).toBe('ready')
      expect(letter.opensAt).toBe(TODAY)
    })

    it('numbers the letter after the highest one already written', () => {
      const highest = Math.max(...SAMPLE_LETTERS.map((letter) => letter.number))

      expect(usePlansStore.getState().sealLetter(draft).number).toBe(highest + 1)
      // Twice, because numbering off `letters.length` instead of off the highest
      // number would repeat "No. 006" the moment the two disagree.
      expect(usePlansStore.getState().sealLetter(draft).number).toBe(highest + 2)
    })

    it('takes the teaser off the top of the body, and never the whole letter', () => {
      const letter = usePlansStore.getState().sealLetter(draft)

      expect(letter.teaser).toHaveLength(120)
      expect(letter.body).toBe(draft.body)
    })

    it('puts the newest letter first', () => {
      const letter = usePlansStore.getState().sealLetter(draft)

      expect(usePlansStore.getState().letters[0]).toEqual(letter)
      expect(usePlansStore.getState().letters).toHaveLength(SAMPLE_LETTERS.length + 1)
    })

    it('does not make a letter written TO the partner something waiting for me', () => {
      const waiting = selectWaitingLetters(usePlansStore.getState())

      usePlansStore.getState().sealLetter(draft)

      // The envelope figure on the hub reads "waiting for YOU". A letter the
      // user has just written to their partner is the opposite of that.
      expect(selectWaitingLetters(usePlansStore.getState())).toBe(waiting)
    })
  })

  describe('openLetter', () => {
    it('opens the letter and takes it off the waiting count', () => {
      const sealed = SAMPLE_LETTERS.find(
        (letter) => letter.to === 'me' && letter.state !== 'opened',
      )!
      const waiting = selectWaitingLetters(usePlansStore.getState())

      usePlansStore.getState().openLetter(sealed.id)

      expect(usePlansStore.getState().letters.find((l) => l.id === sealed.id)!.state).toBe('opened')
      expect(selectWaitingLetters(usePlansStore.getState())).toBe(waiting - 1)
    })
  })

  describe('setSharingWindow', () => {
    it.each([
      ['1h', 60],
      ['tonight', 480],
    ] as const)('starts a %s window with %i minutes on the clock', (window, minutes) => {
      usePlansStore.getState().setSharingWindow(window)

      expect(usePlansStore.getState().sharingWindow).toBe(window)
      expect(usePlansStore.getState().minutesRemaining).toBe(minutes)
    })

    it('runs "until I turn it off" without a countdown', () => {
      usePlansStore.getState().setSharingWindow('until-off')

      // Zero minutes here is not "expired", it is the absence of a deadline —
      // which is why the screen prints a state rather than a timer for it.
      expect(usePlansStore.getState().sharingWindow).toBe('until-off')
      expect(usePlansStore.getState().minutesRemaining).toBe(0)
    })

    it('stops sharing, and clears the clock with it', () => {
      usePlansStore.getState().setSharingWindow('1h')
      usePlansStore.getState().setSharingWindow(null)

      // A stale "42 minutes left" sitting under a switch that is off is the one
      // thing a location feature must never show.
      expect(usePlansStore.getState().sharingWindow).toBeNull()
      expect(usePlansStore.getState().minutesRemaining).toBe(0)
    })
  })

  /*
   * EVERY field, in one block, for the same reason `preferencesStore`'s reset
   * test asserts the whole defaults object: naming three of the nine checks a
   * third of the store, and every test in every plans suite that follows a
   * mutating one depends on this being total.
   */
  it('resets everything it remembers, not only what a screen last touched', () => {
    const store = usePlansStore.getState()
    store.cycleTile(TODO_TILE.id)
    store.selectDay(3)
    store.togglePromiseLived(SAMPLE_LIFETIME.promises[0].id)
    store.addPromise({ title: 'Learn to sail', detail: 'Somewhere warm', category: 'adventure' })
    store.createTrip({ destination: 'Lisbon', nights: 2, budgetBand: 250, styles: ['foodie'] })
    store.sealCapsule({ kinds: ['photos'], opensAt: '2031-01-01', sealNote: '' })
    store.sealLetter({ to: 'me', title: 'Hello', body: 'Hello', opensAt: null })
    store.openLetter(SAMPLE_LETTERS[0].id)
    store.setSharingWindow('until-off')

    store.reset()

    const after = usePlansStore.getState()
    expect(after.yearBoard).toEqual(SAMPLE_YEAR_BOARD)
    expect(after.promises).toEqual(SAMPLE_LIFETIME.promises)
    expect(after.lifetimeTarget).toBe(SAMPLE_LIFETIME.target)
    expect(after.capsules).toEqual(SAMPLE_CAPSULES)
    expect(after.letters).toEqual(SAMPLE_LETTERS)
    expect(after.trip.destination).toBe('Paris, France')
    expect(after.selectedDay).toBe(1)
    expect(after.sharingWindow).toBe(SAMPLE_PLACES.activeWindow)
    expect(after.minutesRemaining).toBe(SAMPLE_PLACES.minutesRemaining)
  })

  /*
   * THE DERIVED READS the hub is assembled out of. Each one is pinned to the
   * sample AND then moved by an action, because a selector that filtered the
   * wrong field would still agree with a test that only restated the sample.
   */
  describe('selectors', () => {
    it('counts stamped and in-progress tiles apart from each other', () => {
      expect(selectTilesStamped(usePlansStore.getState())).toBe(
        SAMPLE_YEAR_BOARD.tiles.filter((tile) => tile.state === 'done').length,
      )
      expect(selectTilesInProgress(usePlansStore.getState())).toBe(
        SAMPLE_YEAR_BOARD.tiles.filter((tile) => tile.state === 'in-progress').length,
      )
    })

    it('follows a promise being lived, and un-lived again', () => {
      const unlived = usePlansStore.getState().promises.find((promise) => !promise.lived)!
      const lived = selectPromisesLived(usePlansStore.getState())

      usePlansStore.getState().togglePromiseLived(unlived.id)
      expect(selectPromisesLived(usePlansStore.getState())).toBe(lived + 1)

      usePlansStore.getState().togglePromiseLived(unlived.id)
      expect(selectPromisesLived(usePlansStore.getState())).toBe(lived)
    })

    it('counts a promise the couple added themselves, which starts unlived', () => {
      const lived = selectPromisesLived(usePlansStore.getState())

      usePlansStore
        .getState()
        .addPromise({ title: 'Swim at dawn', detail: 'Anywhere', category: 'wild' })

      expect(selectPromisesLived(usePlansStore.getState())).toBe(lived)
      expect(usePlansStore.getState().promises.at(-1)!.lived).toBe(false)
    })

    it('counts only capsules still sealed', () => {
      expect(selectSealedCapsules(usePlansStore.getState())).toBe(
        SAMPLE_CAPSULES.filter((capsule) => !capsule.opened).length,
      )
    })

    it('counts only unopened letters addressed to me', () => {
      expect(selectWaitingLetters(usePlansStore.getState())).toBe(
        SAMPLE_LETTERS.filter((letter) => letter.to === 'me' && letter.state !== 'opened').length,
      )
    })
  })
})
