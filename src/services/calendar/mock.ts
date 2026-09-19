import type {
  CalendarEvent,
  CalendarErrorCode,
  CalendarService,
  ComingUp,
  Result,
} from '@/services/calendar/types'
import { daysUntilNextOccurrence } from '@/utils/daysUntil'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const fail = (code: CalendarErrorCode): Result<never> => ({ ok: false, error: { code } })

type MockOptions = { latencyMs?: number; seed?: CalendarEvent[] }

export function createMockCalendarService({
  latencyMs = 600,
  seed = [],
}: MockOptions = {}): CalendarService {
  const store = new Map(seed.map((event) => [event.id, event]))
  let counter = seed.length

  return {
    async list(input = {}) {
      await wait(latencyMs)
      const from = input.from ?? '0000-00-00'
      const to = input.to ?? '9999-99-99'
      const limit = input.limit ?? 100
      const events = [...store.values()]
        .filter((event) => event.date >= from && event.date <= to)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, limit)
      return { ok: true, value: events }
    },

    async upcoming(input = {}) {
      await wait(latencyMs)
      const withinDays = input.withinDays ?? 365
      const limit = input.limit ?? 10
      const rows: ComingUp[] = [...store.values()]
        .map((event) => ({ event, days: daysUntilNextOccurrence(event.date) }))
        .filter((row): row is { event: CalendarEvent; days: number } =>
          row.days !== null && row.days <= withinDays)
        .sort((a, b) => a.days - b.days)
        .slice(0, limit)
        .map(({ event, days }) => ({
          key: event.id,
          label: event.title,
          detail: event.location,
          days,
          date: event.date,
          kind: event.kind,
          source: 'calendar' as const,
        }))
      return { ok: true, value: rows }
    },

    async get({ id }) {
      await wait(latencyMs)
      const event = store.get(id)
      return event ? { ok: true, value: event } : fail('NOT_FOUND')
    },

    async create(input) {
      await wait(latencyMs)
      counter += 1
      const event: CalendarEvent = {
        ...input,
        id: `calendar-${counter}`,
        createdAt: new Date().toISOString(),
      }
      store.set(event.id, event)
      return { ok: true, value: event }
    },

    async update({ id, changes }) {
      await wait(latencyMs)
      const current = store.get(id)
      if (!current) return fail('NOT_FOUND')
      const event = { ...current, ...changes }
      store.set(id, event)
      return { ok: true, value: event }
    },

    async remove({ id }) {
      await wait(latencyMs)
      return store.delete(id) ? { ok: true, value: undefined } : fail('NOT_FOUND')
    },
  }
}
