import { isMockMode } from '@/config/env'
import { createHttpAuthService } from '@/services/auth/http'
import { createMockAuthService } from '@/services/auth/mock'

export type * from '@/services/auth/types'
export {
	getCachedSession,
	markCachedSessionVerified,
	setCachedSession,
	subscribeToSession,
} from '@/services/auth/session'

/**
 * The swap point — now a choice rather than a constant.
 *
 * WHY A CONDITIONAL AND NOT A STRAIGHT REPLACEMENT: the committed, default
 * state of this repo is mock-only, and the entire test suite runs in it.
 * Hard-wiring the HTTP service would make every test require a live server and
 * would break `npm start` for anyone who has not stood up a database. So the
 * presence of `EXPO_PUBLIC_API_URL` decides: set it and the app talks to the
 * server, leave it unset and nothing changes.
 *
 * Both branches implement `AuthService`, so no screen can tell which one it
 * received. That is the property this boundary was designed for, and it is what
 * makes this a one-line integration rather than a refactor.
 */
export const authService = isMockMode ? createMockAuthService() : createHttpAuthService()
