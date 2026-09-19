import { isMockMode } from '@/config/env'
import { createHttpHomeService } from '@/services/home/http'
import { createMockHomeService } from '@/services/home/mock'

export type * from '@/services/home/types'

export const homeService = isMockMode ? createMockHomeService() : createHttpHomeService()
