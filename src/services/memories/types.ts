/**
 * THE MEMORIES BOUNDARY.
 *
 * Mirrors `services/auth`, `pairing` and `story`: a typed interface, errors as
 * codes rather than strings, and a mock until a provider exists.
 */
export type MemoryErrorCode = 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN'

export type MemoryError = {
  code: MemoryErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: MemoryError }

export type Memory = {
  id: string
  title: string
  /** `YYYY-MM-DD`. */
  date: string
  caption?: string
  location?: string
  photoUri?: string
  /** Private to the couple — the design calls it "Our Note". */
  note?: string
  /** Drives the collections on the Memories home screen. */
  tags: string[]
  favorite: boolean
  /** Display name of whoever added it. */
  addedBy?: string
}

export type NewMemory = Omit<Memory, 'id' | 'favorite'> & { favorite?: boolean }

export type MemoriesService = {
  list: () => Promise<Result<Memory[]>>
  get: (input: { id: string }) => Promise<Result<Memory>>
  create: (input: NewMemory) => Promise<Result<Memory>>
  toggleFavorite: (input: { id: string }) => Promise<Result<Memory>>
  search: (input: { query: string }) => Promise<Result<Memory[]>>
}
