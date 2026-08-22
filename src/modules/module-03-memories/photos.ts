import type { Memory } from '@/services/memories/types'

/**
 * A memory carrying more than one photo.
 *
 * `Memory` holds a single `photoUri` and that is NOT changed here — this type
 * lives in the UI layer and `services/memories/types.ts` is untouched. When a
 * real provider can return several photos, `photos` moves onto `Memory` and this
 * file collapses to nothing.
 */
export type WithPhotos = Memory & { photos?: string[] }

/**
 * Every photo on a memory, in order, as a plain list.
 *
 * The single place that knows about the UI-only `photos` field, so no screen has
 * to cast. A memory with no photo at all returns an empty list rather than a
 * list holding `undefined`.
 */
export function photosOf(memory: Memory): string[] {
  const extra = (memory as WithPhotos).photos

  if (extra && extra.length > 0) return extra

  return memory.photoUri ? [memory.photoUri] : []
}
