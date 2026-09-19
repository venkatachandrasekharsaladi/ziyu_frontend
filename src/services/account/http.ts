import { requireApiUrl } from '@/config/env'
import { get, post, request } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type { AccountExport, AccountResult, AccountService, DeletionStatus } from '@/services/account/types'

const fail = (error: unknown): AccountResult<never> => ({
  ok: false,
  error: { code: isApiError(error) && error.code === 'NETWORK' ? 'NETWORK' : 'UNKNOWN' },
})

export function createHttpAccountService(): AccountService {
  requireApiUrl()
  return {
    async getDeletionStatus() {
      try { return { ok: true, value: await get<DeletionStatus>('/account/deletion') } }
      catch (error) { return fail(error) }
    },
    async requestDeletion() {
      try { return { ok: true, value: await post<DeletionStatus>('/account/deletion') } }
      catch (error) { return fail(error) }
    },
    async cancelDeletion() {
      try {
        const response = await request<DeletionStatus>('/account/deletion', { method: 'DELETE' })
        return { ok: true, value: response.data }
      } catch (error) { return fail(error) }
    },
    async exportData() {
      try { return { ok: true, value: await get<AccountExport>('/account/export') } }
      catch (error) { return fail(error) }
    },
  }
}
