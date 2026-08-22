import { createMockAuthService } from '@/services/auth/mock'

export type * from '@/services/auth/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `authService` from here, never from `mock`.
 */
export const authService = createMockAuthService()
