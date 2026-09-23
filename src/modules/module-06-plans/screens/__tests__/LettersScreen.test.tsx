import { screen, userEvent } from '@testing-library/react-native'

import { LETTERS_COPY } from '@/copy/letters'
import { LettersScreen } from '@/modules/module-06-plans/screens/LettersScreen'
import { SAMPLE_LETTERS } from '@/sample/plans'
import type { Letter } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: jest.fn(), back: mockBack }),
}))

/**
 * The three filters, derived from the seed rather than typed out.
 *
 * Every count and every membership assertion below is computed from
 * `SAMPLE_LETTERS` with the SAME predicate the screen uses. Hardcoding "2, 1, 3"
 * would have meant a test that has to be edited every time someone adds a letter
 * to the sample — and one that could go on passing while the filter drifted.
 */
const waiting = SAMPLE_LETTERS.filter((l) => l.to === 'me' && l.state !== 'opened')
const fromMe = SAMPLE_LETTERS.filter((l) => l.from === 'me')
const opened = SAMPLE_LETTERS.filter((l) => l.state === 'opened')

/** How the vault names a card for a screen reader — title, then state. */
const cardName = (letter: Letter) => `${letter.title}. ${LETTERS_COPY.states[letter.state]}`

/** …and how it names an archive tile, which is a different control entirely. */
const archiveName = (letter: Letter) => `${letter.title}. ${LETTERS_COPY.readLetter}`

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

describe('M06-S08 Letters vault', () => {
  it('opens on the letters waiting for the reader, and nothing else', async () => {
    await renderScreen(<LettersScreen />)

    for (const letter of waiting) {
      expect(screen.getByRole('button', { name: cardName(letter) })).toBeTruthy()
    }

    // The opened ones are further down the page as ARCHIVE tiles — what must
    // not be here is their card, which is why the role name is the assertion.
    for (const letter of opened) {
      expect(screen.queryByRole('button', { name: cardName(letter) })).toBeNull()
    }
  })

  it('counts each tab on its own chip, and the counts agree with the filters', async () => {
    await renderScreen(<LettersScreen />)

    // The chip appends its count to its own accessible name, so the badge is
    // readable as well as visible.
    expect(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.waiting}, ${waiting.length}` }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.fromMe}, ${fromMe.length}` }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.opened}, ${opened.length}` }),
    ).toBeTruthy()
  })

  it('switches to the letters this user wrote', async () => {
    const user = userEvent.setup()
    await renderScreen(<LettersScreen />)

    await user.press(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.fromMe}, ${fromMe.length}` }),
    )

    for (const letter of fromMe) {
      expect(screen.getByRole('button', { name: cardName(letter) })).toBeTruthy()
    }

    // A letter addressed TO this user is not one they wrote, however new it is.
    for (const letter of waiting) {
      expect(screen.queryByRole('button', { name: cardName(letter) })).toBeNull()
    }
  })

  it('switches to everything already read', async () => {
    const user = userEvent.setup()
    await renderScreen(<LettersScreen />)

    await user.press(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.opened}, ${opened.length}` }),
    )

    for (const letter of opened) {
      expect(screen.getByRole('button', { name: cardName(letter) })).toBeTruthy()
    }

    for (const letter of waiting) {
      expect(screen.queryByRole('button', { name: cardName(letter) })).toBeNull()
    }
  })

  it('marks the tab in view rather than leaving the row ambiguous', async () => {
    const user = userEvent.setup()
    await renderScreen(<LettersScreen />)

    const openedTab = screen.getByRole('button', {
      name: `${LETTERS_COPY.tabs.opened}, ${opened.length}`,
    })

    expect(openedTab.props.accessibilityState).toMatchObject({ selected: false })

    await user.press(openedTab)

    expect(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.opened}, ${opened.length}` }).props
        .accessibilityState,
    ).toMatchObject({ selected: true })
    expect(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.waiting}, ${waiting.length}` }).props
        .accessibilityState,
    ).toMatchObject({ selected: false })
  })

  it('never puts a sealed letter’s words on a card', async () => {
    /**
     * Written through the store rather than hand-placed, because `sealLetter`
     * is the one code path that ever holds a body and a `sealed` state at the
     * same moment. If the vault were ever to render `body`, this is the letter
     * it would render it from.
     */
    const secret = 'I have already booked the flight to Lisbon for your birthday'
    const body = `${'Dearest, this is the sort of thing that deserves paper rather than a chat window. '.repeat(2)}${secret}`

    usePlansStore
      .getState()
      .sealLetter({ to: 'partner', title: 'Open when you land', body, opensAt: '2027-05-14' })

    const sealed = usePlansStore.getState().letters[0]
    expect(sealed.state).toBe('sealed')

    const user = userEvent.setup()
    await renderScreen(<LettersScreen />)

    await user.press(
      screen.getByRole('button', { name: `${LETTERS_COPY.tabs.fromMe}, ${fromMe.length + 1}` }),
    )

    expect(screen.getByRole('button', { name: cardName(sealed) })).toBeTruthy()
    // THE PRIVACY INVARIANT: the card carries a teaser, never the letter.
    expect(screen.queryByText(new RegExp(secret))).toBeNull()
    expect(screen.queryByText(body)).toBeNull()
  })

  it('says what is missing rather than showing a blank tab', async () => {
    const user = userEvent.setup()

    // An empty vault is what a real couple starts with; the seed is a design
    // stand-in. See the header of `plansStore`.
    usePlansStore.setState({ letters: [] })

    await renderScreen(<LettersScreen />)

    expect(screen.getByText(LETTERS_COPY.empty.waiting)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: `${LETTERS_COPY.tabs.fromMe}, 0` }))
    // "From me" is the tab; "From you" is how the empty state addresses the
    // person reading it.
    expect(screen.getByText(LETTERS_COPY.empty.fromYou)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: `${LETTERS_COPY.tabs.opened}, 0` }))
    expect(screen.getByText(LETTERS_COPY.empty.opened)).toBeTruthy()
  })

  it('keeps the archives to letters that have actually been opened', async () => {
    await renderScreen(<LettersScreen />)

    expect(screen.getByText(LETTERS_COPY.archivesLabel)).toBeTruthy()
    expect(screen.getByText(LETTERS_COPY.viewAll(opened.length))).toBeTruthy()

    for (const letter of opened) {
      expect(screen.getByRole('button', { name: archiveName(letter) })).toBeTruthy()
    }

    for (const letter of waiting) {
      expect(screen.queryByRole('button', { name: archiveName(letter) })).toBeNull()
    }
  })

  it('drops the archives section entirely when nothing has been opened', async () => {
    usePlansStore.setState({ letters: SAMPLE_LETTERS.filter((l) => l.state !== 'opened') })

    await renderScreen(<LettersScreen />)

    // An empty "From our shared archives" heading is a promise of nothing.
    expect(screen.queryByText(LETTERS_COPY.archivesLabel)).toBeNull()
  })

  it('opens the letter behind a card, and behind its archive tile', async () => {
    const user = userEvent.setup()
    const [first] = waiting
    const [archived] = opened

    await renderScreen(<LettersScreen />)

    await user.press(screen.getByRole('button', { name: cardName(first) }))
    expect(mockPush).toHaveBeenCalledWith(`/(app)/plans/letters/${first.id}`)

    await user.press(screen.getByRole('button', { name: archiveName(archived) }))
    expect(mockPush).toHaveBeenCalledWith(`/(app)/plans/letters/${archived.id}`)
  })

  it('sends "Write a letter" to the composer', async () => {
    const user = userEvent.setup()
    await renderScreen(<LettersScreen />)

    await user.press(screen.getByRole('button', { name: LETTERS_COPY.write }))

    expect(mockPush).toHaveBeenCalledWith('/(app)/plans/letters/new')
  })

  it('addresses the couple by their own names once it knows them', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Praveen' })
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })

    await renderScreen(<LettersScreen />)

    expect(screen.getByText(LETTERS_COPY.privateTo('Praveen & Chandu'))).toBeTruthy()
    expect(screen.getByText(LETTERS_COPY.sectionWaiting('Chandu'))).toBeTruthy()
  })
})
