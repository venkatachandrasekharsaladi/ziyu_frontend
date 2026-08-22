import { createMockPairingService } from '@/services/pairing/mock'

export type * from '@/services/pairing/types'

/**
 * The swap point. Replacing the mock with a real provider is a change to this
 * one line — every screen imports `pairingService` from here, never from `mock`.
 */
export const pairingService = createMockPairingService()
