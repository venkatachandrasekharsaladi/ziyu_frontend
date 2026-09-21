import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { LETTERS_COPY, LETTER_READ_COPY as COPY } from '@/copy/letters'
import { LetterReadScreen } from '@/modules/module-06-plans/screens/LetterReadScreen'
import { SAMPLE_LETTERS, SAMPLE_OPENED_LETTER } from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()
let mockId = 'l-004'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ id: mockId }),
}))

/** The screen's own date formatting, so the expectation moves with the copy. */
function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * A sentence that lives ONLY in the body, past the 120 characters `sealLetter`
 * lifts into the teaser. A sealed view that rendered the teaser would still be
 * correct; one that rendered this would have broken the seal.
 */
const SECRET = 'I have already booked the flight to Lisbon for your birthday'

const BODY = `${'Dearest, this is the sort of thing that deserves paper rather than a chat window. '.repeat(2)}${SECRET}`

/** The sealed sample letter — the one the vault opens on. */
const SEALED = SAMPLE_LETTERS.find((letter) => letter.state === 'sealed')!

/** Unlocked but unread: the state whose whole job is to become `opened`. */
const READY = SAMPLE_LETTERS.find((letter) => letter.state === 'ready')!

/**
 * Writes a letter through the store and points the route at it.
 *
 * `sealLetter` is used rather than a hand-built object because it is the only
 * producer that puts a real body next to a non-`opened` state, which is exactly
 * the combination the privacy assertions need to be meaningful.
 */
function writeLetter(opensAt: string | null) {
  usePlansStore.getState().sealLetter({
    to: 'partner',
    title: 'Open when you land',
    body: BODY,
    opensAt,
  })

  const letter = usePlansStore.getState().letters[0]

  mockId = letter.id

  return letter
}

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  mockId = 'l-004'
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

describe('M06-S10 Reading a letter · still sealed', () => {
  it('shows the wait and the teaser instead of the letter', async () => {
    mockId = SEALED.id

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText(COPY.stillSealed.heading)).toBeTruthy()
    expect(screen.getByText(COPY.stillSealed.lede(longDate(SEALED.opensAt)))).toBeTruthy()
    expect(screen.getByText(`“${SEALED.teaser}”`)).toBeTruthy()

    // None of the reading furniture: no title, no keepsake buttons.
    expect(screen.queryByText(COPY.title)).toBeNull()
    expect(screen.queryByRole('button', { name: COPY.keep })).toBeNull()
  })

  it('renders none of the body of a sealed letter that happens to have one', async () => {
    // A letter written minutes ago, dated a year out. Its body is sitting in the
    // store; this screen must still refuse to show a word of it.
    const letter = writeLetter('2027-05-14')

    expect(letter.state).toBe('sealed')

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText(COPY.stillSealed.heading)).toBeTruthy()
    // THE PRIVACY INVARIANT.
    expect(screen.queryByText(new RegExp(SECRET))).toBeNull()
    expect(screen.queryByText(BODY)).toBeNull()
  })

  it('leaves a sealed letter sealed — arriving does not open it', async () => {
    mockId = SEALED.id

    await renderScreen(<LetterReadScreen />)

    expect(usePlansStore.getState().letters.find((l) => l.id === SEALED.id)?.state).toBe('sealed')
  })
})

describe('M06-S10 Reading a letter · reading it', () => {
  it('marks a ready letter opened on arrival, in an effect rather than in render', async () => {
    /**
     * A store write DURING render is what this guards against. React reports
     * one as "Cannot update a component while rendering a different component",
     * and the matcher looks for that line specifically rather than asserting
     * `console.error` was silent — unrelated warnings from the render tree
     * would make a blanket assertion flaky without making it stricter.
     */
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {})

    mockId = READY.id

    await renderScreen(<LetterReadScreen />)

    await waitFor(() =>
      expect(usePlansStore.getState().letters.find((l) => l.id === READY.id)?.state).toBe('opened'),
    )

    expect(errors.mock.calls.flat().join('\n')).not.toMatch(/Cannot update a component/)

    errors.mockRestore()
  })

  it('shows the letter itself once it has been opened', async () => {
    const letter = writeLetter(null)

    // "Whenever they wish" produced a `ready` letter, which is the state this
    // screen unlocks on arrival.
    expect(letter.state).toBe('ready')

    await renderScreen(<LetterReadScreen />)

    await waitFor(() =>
      expect(usePlansStore.getState().letters.find((l) => l.id === letter.id)?.state).toBe(
        'opened',
      ),
    )

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(letter.title)).toBeTruthy()
    // The body — all of it, in one node, so the writer's line breaks survive.
    expect(screen.getByText(BODY)).toBeTruthy()
    expect(screen.getByText(COPY.brand(letter.number).toUpperCase())).toBeTruthy()
  })

  it('swaps in the fully written sample for the one letter that has one', async () => {
    usePlansStore.getState().openLetter(SAMPLE_OPENED_LETTER.id)

    mockId = SAMPLE_OPENED_LETTER.id

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText(String(SAMPLE_OPENED_LETTER.body))).toBeTruthy()
    // …and the enclosure that only the written version carries.
    expect(screen.getByText(COPY.enclosed)).toBeTruthy()
    expect(screen.getByText(String(SAMPLE_OPENED_LETTER.photoCaption))).toBeTruthy()
  })

  it('leaves out the enclosure section for a letter with no photograph', async () => {
    const opened = SAMPLE_LETTERS.find(
      (letter) => letter.state === 'opened' && letter.photoUri === null,
    )!

    mockId = opened.id

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText(String(opened.body))).toBeTruthy()
    expect(screen.queryByText(COPY.enclosed)).toBeNull()
  })

  it('credits the writer by name rather than by "partner"', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Praveen' })
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })

    const fromPartner = SAMPLE_LETTERS.find(
      (letter) => letter.state === 'opened' && letter.from === 'partner',
    )!

    mockId = fromPartner.id

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText('Chandu')).toBeTruthy()
    expect(screen.queryByText('partner')).toBeNull()
  })

  it('keeps the letter by going back, and sends the moment to memories', async () => {
    const user = userEvent.setup()
    const opened = SAMPLE_LETTERS.find((letter) => letter.state === 'opened')!

    mockId = opened.id

    await renderScreen(<LetterReadScreen />)

    await user.press(screen.getByRole('button', { name: COPY.keep }))
    expect(mockBack).toHaveBeenCalled()

    await user.press(screen.getByRole('button', { name: COPY.addToStory }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/memories')
  })
})

describe('M06-S10 Reading a letter · a letter that is not there', () => {
  it('falls back to a line of copy rather than crashing on an unknown id', async () => {
    mockId = 'l-does-not-exist'

    await renderScreen(<LetterReadScreen />)

    expect(screen.getByText(LETTERS_COPY.empty.opened)).toBeTruthy()
    // Nothing was opened on the way past, either — an id nobody recognises must
    // not unseal whatever happens to be first in the vault.
    expect(usePlansStore.getState().letters.map((l) => l.state)).toEqual(
      SAMPLE_LETTERS.map((l) => l.state),
    )
  })
})
