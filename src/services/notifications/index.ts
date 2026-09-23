import { isMockMode } from '@/config/env'
import { createHttpNotificationService } from '@/services/notifications/http'
import { createMockNotificationService } from '@/services/notifications/mock'

export type * from '@/services/notifications/types'

export const notificationService = isMockMode
  ? createMockNotificationService()
  : createHttpNotificationService()
