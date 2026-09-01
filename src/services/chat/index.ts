import { createMockChatService } from '@/services/chat/mock'

export type * from '@/services/chat/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `chatService` from here, never from `mock`.
 */
export const chatService = createMockChatService()
