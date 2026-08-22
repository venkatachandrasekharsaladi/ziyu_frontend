import { createMockMemoriesService } from '@/services/memories/mock'

export type * from '@/services/memories/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `memoriesService` from here, never from
 * `mock`.
 */
export const memoriesService = createMockMemoriesService()
