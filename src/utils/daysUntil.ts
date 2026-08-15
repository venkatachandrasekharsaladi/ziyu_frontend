const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Whole days between two dates, ignoring the time of day. */
function atMidnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/**
 * Whole days from `from` up to today. Negative if the date is in the future.
 *
 * Used for "Days Together", which counts forward from the day the couple met.
 */
export function daysSince(value: string | undefined, today = new Date()): number | null {
  if (!value) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(start.getTime())) return null

  return Math.floor((atMidnight(today) - atMidnight(start)) / MS_PER_DAY)
}

/**
 * Days until the NEXT occurrence of a recurring date — an anniversary or a
 * birthday. Returns 0 when it falls today.
 *
 * The year on the stored date is the original year, so it is replaced with this
 * one, and rolled to next year if that has already passed.
 */
export function daysUntilNextOccurrence(
  value: string | undefined,
  today = new Date(),
): number | null {
  if (!value) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const month = Number(match[2]) - 1
  const day = Number(match[3])

  let next = new Date(today.getFullYear(), month, day)

  if (atMidnight(next) < atMidnight(today)) {
    next = new Date(today.getFullYear() + 1, month, day)
  }

  // A 29 February in a non-leap year rolls to 1 March, which is the behaviour
  // most calendars use and is better than skipping the date for three years.
  return Math.round((atMidnight(next) - atMidnight(today)) / MS_PER_DAY)
}
