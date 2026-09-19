import { isMockMode } from '@/config/env'
import { createHttpTimelineService } from '@/services/timeline/http'
import { createMockTimelineService } from '@/services/timeline/mock'

export type * from '@/services/timeline/types'

export const timelineService = isMockMode
  ? createMockTimelineService()
  : createHttpTimelineService()
