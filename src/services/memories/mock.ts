import type {
  MemoriesService,
  Memory,
  MemoryErrorCode,
  NewMemory,
  Result,
} from '@/services/memories/types'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function fail(code: MemoryErrorCode): Result<never> {
  return { ok: false, error: { code } }
}

/** Reserved, so the failure path is reachable by hand and in tests. */
const OFFLINE_MARKER = 'offline'

type MockOptions = {
  latencyMs?: number
  /**
   * Seed memories. Empty by DEFAULT — a new couple genuinely has none, and the
   * home screen's empty state is the first thing they should see rather than
   * invented content belonging to someone else.
   */
  seed?: Memory[]
}

export function createMockMemoriesService({
  latencyMs = 600,
  seed = [],
}: MockOptions = {}): MemoriesService {
  const store = new Map<string, Memory>(seed.map((m) => [m.id, m]))
  let counter = seed.length

  return {
    async list() {
      await wait(latencyMs)

      // Newest first — the design's grid leads with the most recent.
      const all = [...store.values()].sort((a, b) => b.date.localeCompare(a.date))

      return { ok: true, value: all }
    },

    async get({ id }) {
      await wait(latencyMs)

      const found = store.get(id)

      return found ? { ok: true, value: found } : fail('NOT_FOUND')
    },

    async create(input: NewMemory) {
      await wait(latencyMs)

      if (input.location?.trim().toLowerCase() === OFFLINE_MARKER) return fail('NETWORK')

      counter += 1
      const memory: Memory = { ...input, id: `memory-${counter}`, favorite: input.favorite ?? false }
      store.set(memory.id, memory)

      return { ok: true, value: memory }
    },

    async toggleFavorite({ id }) {
      await wait(latencyMs)

      const found = store.get(id)
      if (!found) return fail('NOT_FOUND')

      const next = { ...found, favorite: !found.favorite }
      store.set(id, next)

      return { ok: true, value: next }
    },

    async search({ query }) {
      await wait(latencyMs)

      const q = query.trim().toLowerCase()
      if (!q) return { ok: true, value: [] }

      const hits = [...store.values()].filter((m) =>
        [m.title, m.caption, m.location, m.note, ...m.tags]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      )

      return { ok: true, value: hits }
    },
  }
}
