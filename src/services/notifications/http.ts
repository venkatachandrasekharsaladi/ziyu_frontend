import { requireApiUrl } from '@/config/env'
import { get, post, put, request } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type {
  NotificationPreferences,
  NotificationResult,
  NotificationService,
  RegisteredDevice,
} from '@/services/notifications/types'

const fail = (error: unknown): NotificationResult<never> => ({
  ok: false,
  error: {
    code: isApiError(error) && (error.code === 'NETWORK' || error.code === 'VALIDATION_ERROR')
      ? error.code : 'UNKNOWN',
  },
})

export function createHttpNotificationService(): NotificationService {
  requireApiUrl()
  return {
    async getPreferences() {
      try { return { ok: true, value: await get<NotificationPreferences>('/notifications/preferences') } }
      catch (error) { return fail(error) }
    },
    async updatePreferences(input) {
      try { return { ok: true, value: await put<NotificationPreferences>('/notifications/preferences', input) } }
      catch (error) { return fail(error) }
    },
    async registerDevice(input) {
      try { return { ok: true, value: await post<RegisteredDevice>('/notifications/devices', input) } }
      catch (error) { return fail(error) }
    },
    async unregisterDevice(token) {
      try {
        await request('/notifications/devices', { method: 'DELETE', body: { token } })
        return { ok: true, value: undefined }
      } catch (error) { return fail(error) }
    },
  }
}
