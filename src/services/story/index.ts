import { isMockMode } from '@/config/env'
import { createHttpStoryService } from '@/services/story/http'
import { createMockStoryService } from '@/services/story/mock'

export type * from '@/services/story/types'

/**
 * The swap point. `EXPO_PUBLIC_API_URL` selects the implementation; both sides
 * satisfy `StoryService`, so no screen changes either way.
 */
export const storyService = isMockMode ? createMockStoryService() : createHttpStoryService()
