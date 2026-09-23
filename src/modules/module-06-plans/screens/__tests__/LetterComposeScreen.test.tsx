import { screen, userEvent } from '@testing-library/react-native'

import { LETTER_COMPOSE_COPY as COPY } from '@/copy/letters'
import { LetterComposeScreen } from '@/modules/module-06-plans/screens/LetterComposeScreen'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: mockReplace, back: mockBack }),
}))

/**
 * The same formatting the screen uses for the date it prints, computed here
 * rather than copied as a literal — the expected string has to move when "today"
 * does, and these tests run on whatever day CI happens to be on.
 */
function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** The composer's own arithmetic: today plus N days, as an ISO date. */
function isoInDays(days: number): string {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return date.toISOString().slice(0, 10)
}

/** The default seal on arrival is "On our next anniversary" — 365 days out. */
const ANNIVERSARY_DATE = longDate(isoInDays(365))

/** Short on purpose: `userEvent.type` presses one key at a time. */
const TITLE = 'Open when you land'
const BODY = 'I already miss you and you have not left yet.'

/** The letter the seed puts at the top, so "what was added" is unambiguous. */
const newest = () => usePlansStore.getState().letters[0]

beforeEach(() => {
  mockPush.mockClear()
  mockReplace.mockClear()
  mockBack.mockClear()
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

describe('M06-S09 Letter composer', () => {
  it('refuses to seal an untitled letter with nothing in it, and says so twice', async () => {
    const user = userEvent.setup()
    const before = usePlansStore.getState().letters.length

    await renderScreen(<LetterComposeScreen />)

    await user.press(screen.getByRole('button', { name: COPY.seal }))

    // BOTH errors, not just the first — the user should not discover the second
    // requirement only after satisfying the first.
    expect(await screen.findByText(COPY.titleRequired)).toBeTruthy()
    expect(screen.getByText(COPY.bodyRequired)).toBeTruthy()
    expect(usePlansStore.getState().letters).toHaveLength(before)
    // Nothing was sealed, so the confirmation must not have replaced the form.
    expect(screen.getByLabelText(COPY.bodyLabel)).toBeTruthy()
  })

  it('still refuses when only the title has been written', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.type(screen.getByLabelText(COPY.titleLabel), TITLE)
    await user.press(screen.getByRole('button', { name: COPY.seal }))

    expect(await screen.findByText(COPY.bodyRequired)).toBeTruthy()
    expect(screen.queryByText(COPY.titleRequired)).toBeNull()
  })

  it('takes the error back down as soon as the field is being fixed', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.press(screen.getByRole('button', { name: COPY.seal }))
    expect(await screen.findByText(COPY.titleRequired)).toBeTruthy()

    await user.type(screen.getByLabelText(COPY.titleLabel), 'A')

    expect(screen.queryByText(COPY.titleRequired)).toBeNull()
    // The body is still empty, so its complaint stands.
    expect(screen.getByText(COPY.bodyRequired)).toBeTruthy()
  })

  it('counts the words in the box, including the singular case', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    // Nothing typed is nothing counted — not "1 word" for an empty string.
    expect(screen.getByText(COPY.wordCount(0))).toBeTruthy()

    await user.type(screen.getByLabelText(COPY.bodyLabel), 'Dearest')
    expect(screen.getByText(COPY.wordCount(1))).toBeTruthy()

    await user.type(screen.getByLabelText(COPY.bodyLabel), ' you are my favourite')
    expect(screen.getByText(COPY.wordCount(5))).toBeTruthy()
  })

  it('seals for the anniversary by default and warns about that date', async () => {
    await renderScreen(<LetterComposeScreen />)

    expect(screen.getByLabelText('On our next anniversary').props.accessibilityState).toMatchObject(
      { selected: true },
    )
    expect(screen.getByText(COPY.sealedFor(ANNIVERSARY_DATE))).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.seal })).toBeTruthy()
    expect(screen.getByText(COPY.sealWarning(ANNIVERSARY_DATE))).toBeTruthy()
  })

  it('stops calling it a seal once the letter is to be readable straight away', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.press(screen.getByLabelText('Whenever they wish'))

    // "Once sealed, neither of you can open this" is untrue of a letter the
    // partner can read the moment it lands, so both the button and the line
    // under it change.
    expect(screen.getByRole('button', { name: COPY.sealNow })).toBeTruthy()
    expect(screen.getByText(COPY.sendWarning)).toBeTruthy()
    expect(screen.queryByRole('button', { name: COPY.seal })).toBeNull()
    expect(screen.queryByText(COPY.sealWarning(ANNIVERSARY_DATE))).toBeNull()
    // No "Sealed until …" strip either, because there is no date to name.
    expect(screen.queryByText(COPY.sealedFor(ANNIVERSARY_DATE))).toBeNull()
  })

  it('writes a ready letter — not a sealed one — for "Whenever they wish"', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.type(screen.getByLabelText(COPY.titleLabel), TITLE)
    await user.type(screen.getByLabelText(COPY.bodyLabel), BODY)
    await user.press(screen.getByLabelText('Whenever they wish'))
    await user.press(screen.getByRole('button', { name: COPY.sealNow }))

    const letter = newest()

    expect(letter.title).toBe(TITLE)
    expect(letter.to).toBe('partner')
    expect(letter.from).toBe('me')
    // THE DISTINCTION THIS SCREEN EXISTS TO MAKE: choosing not to seal is not
    // sealing for zero days.
    expect(letter.state).toBe('ready')
    expect(letter.opensAt).toBe(isoInDays(0))

    // …and the confirmation says so, without naming a date it does not have.
    expect(await screen.findByText(COPY.done.storedOpen('Chandu & Sarah'))).toBeTruthy()
  })

  it('writes a sealed letter for a dated choice, and stores it under that date', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.type(screen.getByLabelText(COPY.titleLabel), TITLE)
    await user.type(screen.getByLabelText(COPY.bodyLabel), BODY)
    await user.press(screen.getByLabelText('In a month'))
    await user.press(screen.getByRole('button', { name: COPY.seal }))

    const letter = newest()

    expect(letter.state).toBe('sealed')
    expect(letter.opensAt).toBe(isoInDays(30))
    expect(
      await screen.findByText(COPY.done.stored('Chandu & Sarah', longDate(isoInDays(30)))),
    ).toBeTruthy()
  })

  it('shows the confirmation in place rather than navigating away from it', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.type(screen.getByLabelText(COPY.titleLabel), TITLE)
    await user.type(screen.getByLabelText(COPY.bodyLabel), BODY)
    await user.press(screen.getByRole('button', { name: COPY.seal }))

    expect(await screen.findByText(COPY.done.title)).toBeTruthy()
    expect(screen.getByText(COPY.done.badge)).toBeTruthy()
    // The composer is gone, but nobody was routed anywhere to make that happen.
    expect(screen.queryByLabelText(COPY.titleLabel)).toBeNull()
    expect(screen.queryByLabelText(COPY.bodyLabel)).toBeNull()
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
    expect(mockBack).not.toHaveBeenCalled()
  })

  it('replaces back to the vault from the confirmation', async () => {
    const user = userEvent.setup()

    await renderScreen(<LetterComposeScreen />)

    await user.type(screen.getByLabelText(COPY.titleLabel), TITLE)
    await user.type(screen.getByLabelText(COPY.bodyLabel), BODY)
    await user.press(screen.getByRole('button', { name: COPY.seal }))

    await user.press(await screen.findByRole('button', { name: COPY.done.back }))

    // Replace, not push: backing into a composer for a letter already sealed
    // would offer to seal it twice.
    expect(mockReplace).toHaveBeenCalledWith('/(app)/plans/letters')
  })

  it('addresses the letter to the real partner once there is one', async () => {
    useRelationshipStore.getState().setProfile({ name: 'Praveen' })
    useRelationshipStore.getState().setPartner({ id: 'partner-chandu', name: 'Chandu' })

    await renderScreen(<LetterComposeScreen />)

    expect(screen.getByText('Chandu')).toBeTruthy()
    expect(screen.getByText('Praveen')).toBeTruthy()
  })
})
