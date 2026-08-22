import { createMockStoryService } from '@/services/story/mock'

export type * from '@/services/story/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `storyService` from here, never from `mock`.
 */
export const storyService = createMockStoryService()
