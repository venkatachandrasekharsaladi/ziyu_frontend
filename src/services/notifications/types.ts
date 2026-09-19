export type NotificationPreferences = {
  enabled: boolean
  messages: boolean
  occasions: boolean
  memories: boolean
  quietStart?: string | null
  quietEnd?: string | null
  timezone: string
}

export type DevicePlatform = 'EXPO' | 'IOS' | 'ANDROID' | 'WEB'
export type RegisteredDevice = { id: string; platform: Lowercase<DevicePlatform>; active: boolean }
export type NotificationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'VALIDATION_ERROR' | 'NETWORK' | 'UNKNOWN' } }

export type NotificationService = {
  getPreferences: () => Promise<NotificationResult<NotificationPreferences>>
  updatePreferences: (input: NotificationPreferences) => Promise<NotificationResult<NotificationPreferences>>
  registerDevice: (input: { token: string; platform: DevicePlatform }) => Promise<NotificationResult<RegisteredDevice>>
  unregisterDevice: (token: string) => Promise<NotificationResult<void>>
}
