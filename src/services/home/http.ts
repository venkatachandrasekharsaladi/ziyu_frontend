import { requireApiUrl } from '@/config/env'
import { get } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type { HomeDashboard, HomeService, Result } from '@/services/home/types'

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: isApiError(error) && error.code === 'NETWORK' ? 'NETWORK' : 'UNKNOWN' },
})

export function createHttpHomeService(): HomeService {
  requireApiUrl()

  return {
    async getDashboard() {
      try {
        return ok(await get<HomeDashboard>('/home'))
      } catch (error) {
        return fail(error)
      }
    },
  }
}
