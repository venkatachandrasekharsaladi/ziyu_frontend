import { isMockMode } from '@/config/env'
import { createHttpMemoriesService } from '@/services/memories/http'
import { createMockMemoriesService } from '@/services/memories/mock'

export type * from '@/services/memories/types'

/**
 * The swap point. `EXPO_PUBLIC_API_URL` selects the implementation; both sides
 * satisfy `MemoriesService`, so no screen changes either way.
 */
export const memoriesService = isMockMode
  ? createMockMemoriesService()
  : createHttpMemoriesService()
