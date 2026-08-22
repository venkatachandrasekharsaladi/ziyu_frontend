import { HOME_DASHBOARD_COPY as COPY } from '@/copy/homeDashboard'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_HOME } from '@/sample/home'
import { daysUntilNextOccurrence } from '@/utils/daysUntil'

export type ComingUpRow = {
  key: string
  label: string
  days: number
  detail?: string
  /** True when the row came from `src/sample`, not from the couple's own dates. */
  sample?: boolean
}

type DateKey = keyof typeof COPY.dates

/**
 * The "Coming up" list, in one place.
 *
 * Built here rather than inline in the dashboard because the occasion screen
 * has to resolve the SAME row from a route key. Two copies of this logic would
 * drift the moment one of them learned about a new kind of date.
 *
 * Real dates always win; sample rows fill in only when the couple has entered
 * nothing at all.
 */
export function buildComingUp(keyDates: Record<string, string> | undefined): ComingUpRow[] {
  const rows: ComingUpRow[] = []

  for (const [key, value] of Object.entries(keyDates ?? {})) {
    const days = daysUntilNextOccurrence(value)

    if (days !== null) {
      rows.push({ key, label: COPY.dates[key as DateKey], days })
    }
  }

  // Soonest first — an anniversary next week matters more than one in eleven
  // months.
  rows.sort((a, b) => a.days - b.days)

  if (rows.length > 0) return rows

  return USE_SAMPLE_CONTENT
    ? SAMPLE_HOME.comingUp.map((row) => ({ ...row, sample: true as const }))
    : []
}

export function findComingUp(
  keyDates: Record<string, string> | undefined,
  key: string,
): ComingUpRow | undefined {
  return buildComingUp(keyDates).find((row) => row.key === key)
}

/** `18` -> the real calendar date 18 days from `from`. */
export function dateInDays(days: number, from = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate())

  d.setDate(d.getDate() + days)

  return d
}

/** True when this row is somebody's birthday, which unlocks the card actions. */
export function isBirthday(row: ComingUpRow): boolean {
  return /birthday/i.test(row.key) || /birthday/i.test(row.label)
}
