import { isMockMode } from '@/config/env'
import { createHttpChatService } from '@/services/chat/http'
import { createMockChatService } from '@/services/chat/mock'

export type * from '@/services/chat/types'

/**
 * The swap point. `EXPO_PUBLIC_API_URL` selects the implementation; both sides
 * satisfy `ChatService`, so no screen changes either way.
 */
export const chatService = isMockMode ? createMockChatService() : createHttpChatService()
