import {
  daysSinceCalendarDate,
  daysUntilNextAnnualOccurrence,
  formatCalendarDate,
  instantEpochMillis,
  parseCalendarDate,
  parseInstant,
} from '@/utils/dateUtils'

describe('calendar dates', () => {
  it('strictly validates real ISO calendar dates', () => {
    expect(parseCalendarDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 })
    expect(parseCalendarDate('2026-02-29')).toBeNull()
    expect(parseCalendarDate('2026-04-31')).toBeNull()
    expect(parseCalendarDate('2026-2-03')).toBeNull()
  })

  it('round-trips without constructing a local or UTC instant', () => {
    const value = parseCalendarDate('2026-01-02')
    expect(value && formatCalendarDate(value)).toBe('2026-01-02')
  })

  it('uses pure epoch-day arithmetic, including across the date line', () => {
    expect(daysSinceCalendarDate('2011-12-29', { year: 2011, month: 12, day: 31 })).toBe(2)
  })

  it('maps February 29 to February 28 in non-leap recurrence years', () => {
    expect(daysUntilNextAnnualOccurrence(
      '2024-02-29',
      { year: 2026, month: 2, day: 27 },
    )).toBe(1)
  })
})

describe('absolute instants', () => {
  it('requires an explicit timezone and normalizes offsets', () => {
    expect(parseInstant('2026-01-01')).toBeNull()
    expect(parseInstant('2026-01-01T00:00:00')).toBeNull()
    expect(parseInstant('2026-01-01T14:00:00+14:00')?.toISOString())
      .toBe('2026-01-01T00:00:00.000Z')
    expect(instantEpochMillis('not-an-instant')).toBeNull()
  })
})
