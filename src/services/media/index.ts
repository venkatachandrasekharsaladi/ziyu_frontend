import { createExpoMediaService } from '@/services/media/expoMedia'

export type * from '@/services/media/types'

/**
 * The swap point, same as every other service — every screen imports
 * `mediaService` from here, never from `expoMedia`.
 *
 * Unlike the others this is NOT a mock: the implementation behind it is real,
 * because picking a photo needs a device rather than a server. The indirection
 * still pays for itself — it is what lets a test pick a photo without one.
 */
export const mediaService = createExpoMediaService()
