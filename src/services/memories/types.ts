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
  /** A local (or, once uploaded, remote) video clip — same honesty as `photoUri`. */
  videoUri?: string
  /** A recorded voice note attached to this memory. */
  voiceUri?: string
  /** Required alongside `voiceUri` — a player needs a length before the clip loads. */
  voiceDurationMs?: number
  /** Private to the couple — the design calls it "Our Note". */
  note?: string
  /** The signed-in member's private reciprocal note. */
  myPrivateNote?: string
  /** Present only after both members have submitted a private note. */
  partnerPrivateNote?: string
  reciprocalNotesRevealed?: boolean
  /** Drives the collections on the Memories home screen. */
  tags: string[]
  favorite: boolean
  /** Display name of whoever added it. */
  addedBy?: string
}

export type NewMemory = Omit<
  Memory,
  'id' | 'favorite' | 'myPrivateNote' | 'partnerPrivateNote' | 'reciprocalNotesRevealed'
> & { favorite?: boolean }

/** Every field but `id` optional — an edit only sends what actually changed. */
export type MemoryEdit = Partial<NewMemory>

export type MemoriesService = {
  list: () => Promise<Result<Memory[]>>
  get: (input: { id: string }) => Promise<Result<Memory>>
  create: (input: NewMemory) => Promise<Result<Memory>>
  update: (input: { id: string } & MemoryEdit) => Promise<Result<Memory>>
  delete: (input: { id: string }) => Promise<Result<void>>
  updatePrivateNote: (input: { id: string; note: string }) => Promise<Result<Memory>>
  withdrawPrivateNote: (input: { id: string }) => Promise<Result<Memory>>
  toggleFavorite: (input: { id: string }) => Promise<Result<Memory>>
  search: (input: { query: string }) => Promise<Result<Memory[]>>
}
