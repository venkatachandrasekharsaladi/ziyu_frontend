import { requireApiUrl } from '@/config/env'
import { del, get, patch, post } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type {
  CalendarEvent,
  CalendarErrorCode,
  CalendarService,
  ComingUp,
  Result,
} from '@/services/calendar/types'

const ok = <T>(value: T): Result<T> => ({ ok: true, value })

function errorCode(error: unknown): CalendarErrorCode {
  if (!isApiError(error)) return 'UNKNOWN'
  if (error.code === 'NOT_FOUND' || error.code === 'NETWORK') return error.code
  return 'UNKNOWN'
}

const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: errorCode(error) },
})

export function createHttpCalendarService(): CalendarService {
  requireApiUrl()

  return {
    async list(input = {}) {
      try {
        return ok(await get<CalendarEvent[]>('/calendar', input))
      } catch (error) {
        return fail(error)
      }
    },

    async upcoming(input = {}) {
      try {
        return ok(await get<ComingUp[]>('/calendar/upcoming', input))
      } catch (error) {
        return fail(error)
      }
    },

    async get({ id }) {
      try {
        return ok(await get<CalendarEvent>(`/calendar/${encodeURIComponent(id)}`))
      } catch (error) {
        return fail(error)
      }
    },

    async create(input) {
      try {
        return ok(await post<CalendarEvent>('/calendar', input))
      } catch (error) {
        return fail(error)
      }
    },

    async update({ id, changes }) {
      try {
        return ok(await patch<CalendarEvent>(`/calendar/${encodeURIComponent(id)}`, changes))
      } catch (error) {
        return fail(error)
      }
    },

    async remove({ id }) {
      try {
        await del<void>(`/calendar/${encodeURIComponent(id)}`)
        return ok(undefined)
      } catch (error) {
        return fail(error)
      }
    },
  }
}
