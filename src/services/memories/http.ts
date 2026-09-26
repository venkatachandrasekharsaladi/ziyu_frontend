/**
 * MEMORIES OVER HTTP.
 *
 * TWO DELIBERATE NARROWINGS.
 *
 * 1. THE SERVER RETURNS MORE THAN THE CLIENT TYPE DECLARES — `photos[]`,
 *    `createdAt`, `updatedAt`, album membership. `toMemory` projects the
 *    response onto the exact `Memory` shape the screens were written against.
 *    Spreading the response instead would work today and rot tomorrow: a field
 *    added on the server would silently appear in objects the UI believes it
 *    fully describes, and the first bug would be a rendered `[object Object]`.
 *
 * 2. `list()` TAKES NO CURSOR, BUT THE ENDPOINT PAGINATES. The interface
 *    predates the server and the screens genuinely want the whole collection —
 *    they group by tag and by year, which cannot be done a page at a time. So
 *    this walks the cursor internally, with a hard page cap: an unbounded
 *    `while` against a paginating endpoint is one server bug away from an
 *    infinite loop on someone's phone. When the archive outgrows the cap the
 *    right fix is a paginated screen, not a bigger number.
 */
import { requireApiUrl } from '@/config/env'
import { del, get, post, put, request } from '@/services/http/client'
import { toMemoryErrorCode } from '@/services/http/errors'
import { ensureRemoteUri } from '@/services/media'
import type {
  MemoriesService,
  Memory,
  NewMemory,
  Result,
} from '@/services/memories/types'

/** 100 is the server's maximum page size; 10 pages is the safety stop. */
const PAGE_SIZE = 100
const MAX_PAGES = 10

type MemoryResponse = {
  id: string
  title: string
  date: string
  caption?: string | null
  location?: string | null
  photoUri?: string | null
  videoUri?: string | null
  voiceUri?: string | null
  voiceDurationMs?: number | null
  note?: string | null
  myPrivateNote?: string | null
  partnerPrivateNote?: string | null
  reciprocalNotesRevealed?: boolean
  tags?: string[] | null
  favorite: boolean
  addedBy?: string | null
}

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: toMemoryErrorCode(error) },
})

/**
 * `null` is how a database says "not set"; the client type says `undefined`.
 * Collapsing them here means no screen ever has to write `?? undefined`, and
 * `caption == null` checks keep working unchanged.
 */
const optional = (value: string | null | undefined): string | undefined => value ?? undefined

function toMemory(row: MemoryResponse): Memory {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    caption: optional(row.caption),
    location: optional(row.location),
    photoUri: optional(row.photoUri),
    videoUri: optional(row.videoUri),
    voiceUri: optional(row.voiceUri),
    voiceDurationMs: row.voiceDurationMs ?? undefined,
    note: optional(row.note),
    myPrivateNote: optional(row.myPrivateNote),
    partnerPrivateNote: optional(row.partnerPrivateNote),
    reciprocalNotesRevealed: row.reciprocalNotesRevealed ?? false,
    tags: row.tags ?? [],
    favorite: row.favorite,
    addedBy: optional(row.addedBy),
  }
}

export function createHttpMemoriesService(): MemoriesService {
  requireApiUrl()

  return {
    async list(): Promise<Result<Memory[]>> {
      try {
        const items: Memory[] = []
        let cursor: string | undefined

        for (let page = 0; page < MAX_PAGES; page += 1) {
          const response = await request<MemoryResponse[]>('/memories', {
            query: { cursor, limit: PAGE_SIZE },
          })

          items.push(...response.data.map(toMemory))

          const next = response.meta.nextCursor
          if (!next) break
          cursor = next
        }

        return ok(items)
      } catch (error) {
        return fail(error)
      }
    },

    async get(input: { id: string }): Promise<Result<Memory>> {
      try {
        return ok(toMemory(await get<MemoryResponse>(`/memories/${encodeURIComponent(input.id)}`)))
      } catch (error) {
        return fail(error)
      }
    },

    async create(input: NewMemory): Promise<Result<Memory>> {
      try {
        const photoUri = await ensureRemoteUri(input.photoUri)
        const videoUri = await ensureRemoteUri(input.videoUri)
        const voiceUri = await ensureRemoteUri(input.voiceUri)
        const created = await post<MemoryResponse>('/memories', {
          ...input,
          photoUri,
          videoUri,
          voiceUri,
        })
        return ok(toMemory(created))
      } catch (error) {
        return fail(error)
      }
    },

    async update(input): Promise<Result<Memory>> {
      try {
        const { id, ...edit } = input
        const photoUri = await ensureRemoteUri(edit.photoUri)
        const videoUri = await ensureRemoteUri(edit.videoUri)
        const voiceUri = await ensureRemoteUri(edit.voiceUri)
        const updated = await put<MemoryResponse>(`/memories/${encodeURIComponent(id)}`, {
          ...edit,
          photoUri,
          videoUri,
          voiceUri,
        })
        return ok(toMemory(updated))
      } catch (error) {
        return fail(error)
      }
    },

    async delete(input: { id: string }): Promise<Result<void>> {
      try {
        await del(`/memories/${encodeURIComponent(input.id)}`)
        return ok(undefined)
      } catch (error) {
        return fail(error)
      }
    },

    async updatePrivateNote(input): Promise<Result<Memory>> {
      try {
        return ok(toMemory(await put<MemoryResponse>(
          `/memories/${encodeURIComponent(input.id)}/private-note`,
          { note: input.note },
        )))
      } catch (error) {
        return fail(error)
      }
    },

    async withdrawPrivateNote(input): Promise<Result<Memory>> {
      try {
        return ok(toMemory(await del<MemoryResponse>(
          `/memories/${encodeURIComponent(input.id)}/private-note`,
        )))
      } catch (error) {
        return fail(error)
      }
    },

    /**
     * A toggle, not a setter. The client does not send the desired value
     * because it may be stale — the partner may have favourited the same
     * memory a second earlier. The server flips whatever is actually stored
     * and returns the result, so the two devices cannot fight.
     */
    async toggleFavorite(input: { id: string }): Promise<Result<Memory>> {
      try {
        const updated = await post<MemoryResponse>(
          `/memories/${encodeURIComponent(input.id)}/favorite`,
        )
        return ok(toMemory(updated))
      } catch (error) {
        return fail(error)
      }
    },

    async search(input: { query: string }): Promise<Result<Memory[]>> {
      const query = input.query.trim()
      // The mock returns nothing for an empty query; a bare `?q=` would 422.
      if (!query) return ok([])

      try {
        const rows = await get<MemoryResponse[]>('/memories/search', {
          q: query,
          limit: PAGE_SIZE,
        })
        return ok(rows.map(toMemory))
      } catch (error) {
        return fail(error)
      }
    },
  }
}
