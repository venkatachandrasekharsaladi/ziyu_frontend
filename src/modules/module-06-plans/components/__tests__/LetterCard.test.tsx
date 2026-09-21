import { screen, userEvent } from '@testing-library/react-native'

import { LETTERS_COPY } from '@/copy/letters'
import { LetterCard } from '@/modules/module-06-plans/components/LetterCard'
import type { Letter } from '@/services/plans/types'
import { renderScreen } from '@/test/renderScreen'

/**
 * A line that exists ONLY inside `body`, far past the 120 characters the store
 * copies into a teaser. Asserting on this rather than on the whole body is what
 * makes the privacy test honest: a card that leaked the opening sentence would
 * still pass a `queryByText(body)` check, because the full string never appears
 * anywhere as a single node.
 */
const SECRET = 'the spare key is taped under the third plant pot on the balcony'

const BODY = [
  'Dearest, I have been carrying this one around for a while and I want to put it down properly.',
  'It is not urgent and it is not bad news, it is only the sort of thing that deserves paper.',
  SECRET,
].join(' ')

/**
 * The card's own contract, restated as a fixture.
 *
 * `body` is populated DELIBERATELY, although `Letter.body` is documented as null
 * while sealed. The point of these tests is that the card never reads that field
 * at all — handing it a body it could leak is the only way to prove it does not.
 */
const SEALED: Letter = {
  id: 'l-900',
  number: 9,
  title: 'For the day you need a little reminder',
  from: 'partner',
  to: 'me',
  writtenAt: '2026-09-17',
  opensAt: '2026-10-14',
  state: 'sealed',
  teaser: 'Written late on our balcony when Paris was sleeping.',
  body: BODY,
  writtenIn: 'Paris',
  photoUri: null,
  photoCaption: null,
}

/** The same envelope once its date has passed: unlocked, still unread. */
const READY: Letter = { ...SEALED, id: 'l-901', state: 'ready', body: BODY }

describe('LetterCard', () => {
  it('shows the teaser and never the letter itself while it is sealed', async () => {
    await renderScreen(
      <LetterCard
        letter={SEALED}
        daysUntilOpen={27}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(screen.getByText(SEALED.teaser)).toBeTruthy()
    // THE PRIVACY INVARIANT. Not one word of the body reaches the tree.
    expect(screen.queryByText(new RegExp(SECRET))).toBeNull()
    expect(screen.queryByText(new RegExp('deserves paper'))).toBeNull()
  })

  it('withholds the body on a card the reader could open, too', async () => {
    // `ready` is the riskier of the two states — the card changes its chip to
    // "Break Wax Seal", and an implementation that prepared the body for that
    // press would show it here.
    await renderScreen(
      <LetterCard
        letter={READY}
        daysUntilOpen={0}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(screen.queryByText(new RegExp(SECRET))).toBeNull()
  })

  it('counts the wait down and prints the date it opens', async () => {
    await renderScreen(
      <LetterCard
        letter={SEALED}
        daysUntilOpen={27}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(screen.getByText(LETTERS_COPY.unlocksIn(27))).toBeTruthy()
    expect(screen.getByText(LETTERS_COPY.opensOn.toUpperCase())).toBeTruthy()
    expect(screen.getByText(SEALED.opensAt)).toBeTruthy()
    // The days are the screen's arithmetic, not the card's — it prints what it
    // is handed, singular form included.
    expect(screen.queryByText(LETTERS_COPY.breakSeal)).toBeNull()
  })

  it('offers the seal-break the moment the letter is openable', async () => {
    await renderScreen(
      <LetterCard
        letter={READY}
        daysUntilOpen={0}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(screen.getByText(LETTERS_COPY.breakSeal)).toBeTruthy()
    // "Opens on 2026-10-14" would be a lie about a letter that is already open.
    expect(screen.getByText(LETTERS_COPY.unlocked.toUpperCase())).toBeTruthy()
    expect(screen.getByText(LETTERS_COPY.today)).toBeTruthy()
    expect(screen.getByText(LETTERS_COPY.states.ready)).toBeTruthy()
  })

  it('bands a ready letter as the vault and everything else as a keepsake', async () => {
    await renderScreen(
      <LetterCard
        letter={READY}
        daysUntilOpen={0}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(
      screen.getByText(`${LETTERS_COPY.number(READY.number)} · ${LETTERS_COPY.anniversaryVault}`),
    ).toBeTruthy()

    // Awaited: RNTL 14 made `rerender` asynchronous along with `render`, so an
    // un-awaited call asserts against the PREVIOUS tree — here, the ready
    // letter still wearing its vault band.
    await screen.rerender(
      <LetterCard
        letter={SEALED}
        daysUntilOpen={27}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(
      screen.getByText(`${LETTERS_COPY.number(SEALED.number)} · ${LETTERS_COPY.sealedKeepsake}`),
    ).toBeTruthy()
  })

  it('names both people rather than leaving the envelope anonymous', async () => {
    await renderScreen(
      <LetterCard
        letter={SEALED}
        daysUntilOpen={27}
        fromName="Sarah"
        toName="Chandu"
        onPress={jest.fn()}
      />,
    )

    expect(screen.getByText(`${LETTERS_COPY.to}: Chandu`)).toBeTruthy()
    expect(screen.getByText(`${LETTERS_COPY.from}: Sarah`)).toBeTruthy()
    expect(screen.getByText(`“${SEALED.title}”`)).toBeTruthy()
  })

  it('is a button named by its title and its state, and reports the press', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()

    await renderScreen(
      <LetterCard
        letter={SEALED}
        daysUntilOpen={27}
        fromName="Sarah"
        toName="Chandu"
        onPress={onPress}
      />,
    )

    // A screen reader hears whether it can be opened before it is pressed.
    const card = screen.getByRole('button', {
      name: `${SEALED.title}. ${LETTERS_COPY.states.sealed}`,
    })

    await user.press(card)

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
