import { formatDate, formatStoryDate } from '@/utils/formatStoryDate'

describe('formatDate', () => {
  it('formats a full date', () => {
    expect(formatDate('1994-07-21')).toBe('July 21, 1994')
  })

  it('drops a leading zero from the day', () => {
    expect(formatDate('1994-07-05')).toBe('July 5, 1994')
  })

  it('returns empty for anything malformed', () => {
    expect(formatDate('not-a-date')).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('1994-13-01')).toBe('')
  })
})

describe('formatStoryDate', () => {
  it('prints an exact date in full', () => {
    expect(formatStoryDate({ value: '2019-10-12', precision: 'exact' })).toBe('October 12, 2019')
  })

  it('prints only month and year when that is all that was claimed', () => {
    expect(formatStoryDate({ value: '2019-10-01', precision: 'monthYear' })).toBe('October 2019')
  })

  it('prints only the year, rather than inventing a day', () => {
    // Stored as 2019-01-01 because the store always holds a real date. Printing
    // "January 1, 2019" would claim a day the user never gave.
    expect(formatStoryDate({ value: '2019-01-01', precision: 'yearOnly' })).toBe('2019')
  })

  it('returns empty when there is no date', () => {
    expect(formatStoryDate(undefined)).toBe('')
  })
})
