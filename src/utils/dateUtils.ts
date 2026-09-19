const MS_PER_DAY = 24 * 60 * 60 * 1000

export type CalendarDate = Readonly<{
  year: number
  month: number
  day: number
}>

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
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
] as const

function leftPad(value: number, width: number): string {
  let result = String(value)
  while (result.length < width) result = `0${result}`
  return result
}

/** Parses a timezone-free API calendar date without converting it to an instant. */
export function parseCalendarDate(value: string | undefined): CalendarDate | null {
  if (!value) return null

  const match = CALENDAR_DATE_PATTERN.exec(value)
  if (!match) return null

  const result = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  }
  const check = new Date(0)
  check.setUTCHours(0, 0, 0, 0)
  check.setUTCFullYear(result.year, result.month - 1, result.day)

  return check.getUTCFullYear() === result.year &&
    check.getUTCMonth() === result.month - 1 &&
    check.getUTCDate() === result.day
    ? result
    : null
}

/** Converts a Date to its local calendar day; no elapsed-time arithmetic is used. */
export function localCalendarDate(value: Date): CalendarDate {
  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
  }
}

export function formatCalendarDate(value: CalendarDate): string {
  return `${leftPad(value.year, 4)}-${leftPad(value.month, 2)}-${leftPad(value.day, 2)}`
}

export function formatCalendarDateLong(value: string | undefined): string {
  const parsed = parseCalendarDate(value)
  if (!parsed) return ''
  return `${MONTHS[parsed.month - 1]} ${parsed.day}, ${leftPad(parsed.year, 4)}`
}

function epochDay(value: CalendarDate): number {
  const instant = new Date(0)
  instant.setUTCHours(0, 0, 0, 0)
  instant.setUTCFullYear(value.year, value.month - 1, value.day)
  return Math.floor(instant.getTime() / MS_PER_DAY)
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function annualOccurrence(source: CalendarDate, year: number): CalendarDate {
  if (source.month === 2 && source.day === 29 && !isLeapYear(year)) {
    return { year, month: 2, day: 28 }
  }
  return { year, month: source.month, day: source.day }
}

export function daysSinceCalendarDate(
  value: string | undefined,
  today: CalendarDate,
): number | null {
  const start = parseCalendarDate(value)
  return start ? epochDay(today) - epochDay(start) : null
}

export function daysUntilNextAnnualOccurrence(
  value: string | undefined,
  today: CalendarDate,
): number | null {
  const source = parseCalendarDate(value)
  if (!source) return null

  let next = annualOccurrence(source, today.year)
  if (epochDay(next) < epochDay(today)) {
    next = annualOccurrence(source, today.year + 1)
  }
  return epochDay(next) - epochDay(today)
}

/** Parses an absolute ISO-8601 moment. Date-only strings are deliberately rejected. */
export function parseInstant(value: string | undefined): Date | null {
  if (!value || !/[Tt]/.test(value) || !/(?:[Zz]|[+-]\d{2}:\d{2})$/.test(value)) return null
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function instantEpochMillis(value: string | undefined): number | null {
  const parsed = parseInstant(value)
  return parsed ? parsed.getTime() : null
}
