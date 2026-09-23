import { isMockMode } from '@/config/env'
import { createHttpPairingService } from '@/services/pairing/http'
import { createMockPairingService } from '@/services/pairing/mock'

export type * from '@/services/pairing/types'

/**
 * The swap point. `EXPO_PUBLIC_API_URL` selects the implementation; both sides
 * satisfy `PairingService`, so no screen changes either way.
 */
export const pairingService = isMockMode ? createMockPairingService() : createHttpPairingService()
