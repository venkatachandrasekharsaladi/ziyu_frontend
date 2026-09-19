import type { RepairSignal, RepairSignalService } from '@/services/repairSignal/types'
import { instantEpochMillis } from '@/utils/dateUtils'

export function createMockRepairSignalService(): RepairSignalService {
  let signal: RepairSignal | null = null

  return {
    async current() {
      const expiresAt = instantEpochMillis(signal?.expiresAt)
      if (signal && expiresAt !== null && expiresAt <= Date.now()) signal = null
      return { ok: true, value: signal }
    },
    async send() {
      if (!signal) {
        const now = new Date()
        signal = {
          id: 'mock-repair-signal',
          status: 'open',
          sentByMe: true,
          mutual: false,
          createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        }
      }
      return { ok: true, value: signal }
    },
    async cancel() {
      signal = null
      return { ok: true, value: undefined }
    },
  }
}
