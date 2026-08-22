import { screen, userEvent } from '@testing-library/react-native'

import { CALENDAR_COPY as COPY } from '@/copy/calendar'
import { CalendarScreen, monthGrid } from '@/modules/module-02-home/screens/CalendarScreen'
import { dateInDays } from '@/modules/module-02-home/comingUp'
import { SAMPLE_HOME } from '@/sample/home'
import { useStoryStore } from '@/state/storyStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  useStoryStore.getState().reset()
})

describe('monthGrid', () => {
  it('pads so the 1st lands on its real weekday', () => {
    // 1 March 2026 is a Sunday — no leading blanks.
    expect(monthGrid(2026, 2).slice(0, 1)).toEqual([1])

    // 1 April 2026 is a Wednesday — three blanks ahead of it.
    const april = monthGrid(2026, 3)
    expect(april.slice(0, 4)).toEqual([null, null, null, 1])
  })

  it('ends on the right day for months of every length', () => {
    const days = (cells: (number | null)[]) => cells.filter((c) => c !== null).length
    expect(days(monthGrid(2026, 0))).toBe(31) // January
    expect(days(monthGrid(2026, 3))).toBe(30) // April
    expect(days(monthGrid(2026, 1))).toBe(28) // February, common year
    expect(days(monthGrid(2024, 1))).toBe(29) // February, leap year
  })

  it('produces whole weeks worth of leading blanks only', () => {
    for (let m = 0; m < 12; m += 1) {
      const cells = monthGrid(2026, m)
      const blanks = cells.filter((c) => c === null).length
      expect(blanks).toBeLessThan(7)
    }
  })
})

/**
 * The calendar behind a "Little things" reminder. No Figma frame — the pinned
 * feature note in the file asks for a calendar, and this is it.
 */
describe('Calendar screen', () => {
  it('opens on the current month', async () => {
    const now = new Date()
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    await renderScreen(<CalendarScreen />)

    expect(
      screen.getByText(COPY.monthLabel(months[now.getMonth()], now.getFullYear())),
    ).toBeTruthy()
  })

  it('marks the days that carry an event', async () => {
    await renderScreen(<CalendarScreen />)

    // Sample rows are placed by their countdown, so they land near today.
    const soon = SAMPLE_HOME.comingUp.reduce((a, b) => (a.days < b.days ? a : b))
    const on = dateInDays(soon.days)
    const sameMonth = on.getMonth() === new Date().getMonth()

    if (sameMonth) {
      expect(screen.getByTestId(`calendar-dot-${on.getDate()}`)).toBeTruthy()
    } else {
      // It fell into next month — then it must NOT be dotted in this one.
      expect(screen.queryByTestId(`calendar-dot-${on.getDate()}`)).toBeNull()
    }
  })

  it('walks to the next month and back', async () => {
    const user = userEvent.setup()
    await renderScreen(<CalendarScreen />)

    const before = screen.getByLabelText(COPY.next)
    await user.press(before)
    await user.press(screen.getByLabelText(COPY.prev))

    const now = new Date()
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    // Back where we started.
    expect(
      screen.getByText(COPY.monthLabel(months[now.getMonth()], now.getFullYear())),
    ).toBeTruthy()
  })

  it('shows the pinned reminders', async () => {
    await renderScreen(<CalendarScreen />)

    expect(screen.getByText(COPY.remindersLabel)).toBeTruthy()
    expect(screen.getByText(SAMPLE_HOME.littleThings[0].text)).toBeTruthy()
  })

  it('opens the occasion behind an agenda row', async () => {
    const user = userEvent.setup()
    // Anchor a real date on today so the agenda is guaranteed to hold a row.
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    useStoryStore.getState().setKeyDates({ anniversary: iso })

    await renderScreen(<CalendarScreen />)

    await user.press(screen.getByLabelText('Anniversary'))

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/occasions/[key]',
      params: { key: 'anniversary' },
    })
  })
})
