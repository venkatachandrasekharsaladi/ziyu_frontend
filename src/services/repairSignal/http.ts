import { requireApiUrl } from '@/config/env'
import { del, get, post } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type {
  RepairSignal,
  RepairSignalResult,
  RepairSignalService,
} from '@/services/repairSignal/types'

const fail = (error: unknown): RepairSignalResult<never> => {
  if (isApiError(error)) {
    if (error.code === 'NO_COUPLE' || error.code === 'FORBIDDEN' || error.code === 'NETWORK') {
      return { ok: false, error: { code: error.code } }
    }
  }
  return { ok: false, error: { code: 'UNKNOWN' } }
}

export function createHttpRepairSignalService(): RepairSignalService {
  requireApiUrl()
  return {
    async current() {
      try { return { ok: true, value: await get<RepairSignal | null>('/repair-signal') } }
      catch (error) { return fail(error) }
    },
    async send() {
      try { return { ok: true, value: await post<RepairSignal>('/repair-signal') } }
      catch (error) { return fail(error) }
    },
    async cancel() {
      try {
        await del<void>('/repair-signal')
        return { ok: true, value: undefined }
      } catch (error) { return fail(error) }
    },
  }
}
