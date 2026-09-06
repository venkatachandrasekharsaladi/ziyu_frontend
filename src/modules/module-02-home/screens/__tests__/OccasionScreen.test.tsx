import { screen, userEvent } from '@testing-library/react-native'

import { OCCASION_COPY as COPY } from '@/copy/occasion'
import { OccasionScreen } from '@/modules/module-02-home/screens/OccasionScreen'
import { SAMPLE_HOME } from '@/sample/home'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()
let mockKey = 'partnerBirthday'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ key: mockKey }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  mockKey = 'partnerBirthday'
  useStoryStore.getState().reset()
})

/**
 * The screen behind a "Coming up" row. No Figma frame exists for it — these
 * tests pin the behaviour the dashboard promises, not a drawing.
 */
describe('Occasion screen', () => {
  it('titles itself from the row and counts down to it', async () => {
    const row = SAMPLE_HOME.comingUp.find((r) => r.key === 'partnerBirthday')!

    await renderScreen(<OccasionScreen />)

    expect(screen.getByText(row.label)).toBeTruthy()
    expect(screen.getByText(COPY.countdown(row.days).toUpperCase())).toBeTruthy()
  })

  it('offers the birthday actions for a birthday', async () => {
    await renderScreen(<OccasionScreen />)

    // Both lifted from the dashboard spotlight rather than invented here.
    expect(screen.getByRole('button', { name: COPY.planSurprise })).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.createCard })).toBeTruthy()
    expect(screen.getByTestId('occasion-photo')).toBeTruthy()
  })

  it('withholds the birthday treatment from a date that is not one', async () => {
    mockKey = 'anniversary'

    await renderScreen(<OccasionScreen />)

    expect(screen.queryByRole('button', { name: COPY.createCard })).toBeNull()
    // No borrowed birthday portrait on an anniversary.
    expect(screen.queryByTestId('occasion-photo')).toBeNull()
    expect(screen.getByRole('button', { name: COPY.addMemory })).toBeTruthy()
  })

  it('resolves a real key date over the sample rows', async () => {
    const today = new Date()
    const iso = `${today.getFullYear() + 1}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    useStoryStore.getState().setKeyDates({ firstDate: iso })
    mockKey = 'firstDate'

    await renderScreen(<OccasionScreen />)

    expect(screen.getByText('First Date')).toBeTruthy()
  })

  it('says so for a key that resolves to nothing, and offers a way back', async () => {
    mockKey = 'not-a-date'
    const user = userEvent.setup()

    await renderScreen(<OccasionScreen />)

    expect(screen.getByText(COPY.missing)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: COPY.back }))
    expect(mockBack).toHaveBeenCalled()
  })

  it('offers the whole calendar as a way out', async () => {
    const user = userEvent.setup()

    await renderScreen(<OccasionScreen />)

    await user.press(screen.getByRole('button', { name: COPY.calendar }))
    expect(mockPush).toHaveBeenCalledWith('/(app)/calendar')
  })
})
