import { daysSince, daysUntilNextOccurrence } from '@/utils/daysUntil'

// Fixed "today" so these never drift.
const TODAY = new Date(2026, 7, 16) // 16 August 2026

describe('daysSince', () => {
  it('counts whole days forward from the date', () => {
    expect(daysSince('2026-08-06', TODAY)).toBe(10)
  })

  it('counts today as zero', () => {
    expect(daysSince('2026-08-16', TODAY)).toBe(0)
  })

  it('returns null when there is no date', () => {
    expect(daysSince(undefined, TODAY)).toBeNull()
    expect(daysSince('nonsense', TODAY)).toBeNull()
  })
})

describe('daysUntilNextOccurrence', () => {
  it('counts to a date later this year', () => {
    expect(daysUntilNextOccurrence('1994-08-26', TODAY)).toBe(10)
  })

  it('rolls to next year once the date has passed', () => {
    // 6 August is behind us; the next one is nearly a year out.
    expect(daysUntilNextOccurrence('1994-08-06', TODAY)).toBe(355)
  })

  it('reports today as zero rather than a year away', () => {
    expect(daysUntilNextOccurrence('1990-08-16', TODAY)).toBe(0)
  })

  it('returns null when there is no date', () => {
    expect(daysUntilNextOccurrence(undefined, TODAY)).toBeNull()
  })
})
