import type { AccountService, DeletionStatus } from '@/services/account/types'

export function createMockAccountService(): AccountService {
  let deletion: DeletionStatus = { pending: false }
  return {
    async getDeletionStatus() { return { ok: true, value: deletion } },
    async requestDeletion() {
      deletion = {
        pending: true,
        requestedAt: '2025-01-01T00:00:00Z',
        executeAfter: '2025-01-31T00:00:00Z',
      }
      return { ok: true, value: deletion }
    },
    async cancelDeletion() {
      deletion = { ...deletion, pending: false, cancelledAt: '2025-01-02T00:00:00Z' }
      return { ok: true, value: deletion }
    },
    async exportData() {
      return { ok: true, value: { generatedAt: '2025-01-01T00:00:00Z', data: {} } }
    },
  }
}
