import { isMockMode } from '@/config/env'
import { createHttpCalendarService } from '@/services/calendar/http'
import { createMockCalendarService } from '@/services/calendar/mock'

export type * from '@/services/calendar/types'

export const calendarService = isMockMode
  ? createMockCalendarService()
  : createHttpCalendarService()
