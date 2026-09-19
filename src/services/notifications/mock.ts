import type { NotificationPreferences, NotificationService } from '@/services/notifications/types'

export function createMockNotificationService(): NotificationService {
  let preferences: NotificationPreferences = {
    enabled: true,
    messages: true,
    occasions: true,
    memories: true,
    timezone: 'UTC',
  }
  return {
    async getPreferences() { return { ok: true, value: preferences } },
    async updatePreferences(input) {
      preferences = { ...input }
      return { ok: true, value: preferences }
    },
    async registerDevice({ platform }) {
      return { ok: true, value: { id: 'mock-device', platform: platform.toLowerCase() as Lowercase<typeof platform>, active: true } }
    },
    async unregisterDevice() { return { ok: true, value: undefined } },
  }
}
