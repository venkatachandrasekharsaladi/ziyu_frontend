import type { StoryDate } from '@/services/story/types'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** `1994-07-21` -> `July 21, 1994`. Returns `''` for anything malformed. */
export function formatDate(value: string | undefined): string {
  if (!value) return ''

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return ''

  const month = MONTHS[Number(match[2]) - 1]
  if (!month) return ''

  return `${month} ${Number(match[3])}, ${match[1]}`
}

/**
 * Formats a date to the precision it was actually given.
 *
 * A date entered as "sometime in 2019" is stored as `2019-01-01`, and printing
 * that back as "January 1, 2019" would invent a day the user never claimed.
 * The precision is what stops it.
 */
export function formatStoryDate(date: StoryDate | undefined): string {
  if (!date) return ''

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.value)
  if (!match) return ''

  const year = match[1]
  const month = MONTHS[Number(match[2]) - 1]

  if (date.precision === 'yearOnly') return year
  if (date.precision === 'monthYear') return month ? `${month} ${year}` : year

  return formatDate(date.value)
}
