import { isMockMode } from '@/config/env'
import { createHttpRepairSignalService } from '@/services/repairSignal/http'
import { createMockRepairSignalService } from '@/services/repairSignal/mock'

export type * from '@/services/repairSignal/types'

export const repairSignalService = isMockMode
  ? createMockRepairSignalService()
  : createHttpRepairSignalService()
