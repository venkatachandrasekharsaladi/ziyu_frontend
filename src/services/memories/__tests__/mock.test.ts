import { createMockMemoriesService } from '@/services/memories/mock'
import type { Memory } from '@/services/memories/types'

const SEED: Memory[] = [
  {
    id: 'memory-1',
    title: "Rome '23",
    date: '2023-10-14',
    caption: 'Coffee, sunshine, and nowhere to be.',
    location: 'Rome, Italy',
    tags: ['Trips'],
    favorite: false,
  },
  {
    id: 'memory-2',
    title: 'First coffee',
    date: '2024-02-02',
    location: 'Seattle',
    tags: ['Dates'],
    favorite: true,
  },
]

describe('mock memories service', () => {
  it('starts empty, because a new couple has no memories', async () => {
    const service = createMockMemoriesService({ latencyMs: 0 })

    const result = await service.list()

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual([])
  })

  it('lists newest first', async () => {
    const service = createMockMemoriesService({ latencyMs: 0, seed: SEED })

    const result = await service.list()

    if (!result.ok) throw new Error('expected ok')
    expect(result.value.map((m) => m.id)).toEqual(['memory-2', 'memory-1'])
  })

  it('creates a memory and returns it with an id', async () => {
    const service = createMockMemoriesService({ latencyMs: 0 })

    const result = await service.create({ title: 'Picnic', date: '2025-05-01', tags: [] })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.id).toBeTruthy()
      expect(result.value.favorite).toBe(false)
    }
  })

  it('reports a network failure through the reserved location', async () => {
    const service = createMockMemoriesService({ latencyMs: 0 })

    const result = await service.create({ title: 'x', date: '2025-01-01', tags: [], location: 'offline' })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('reports a missing memory distinctly', async () => {
    const service = createMockMemoriesService({ latencyMs: 0 })

    expect(await service.get({ id: 'nope' })).toEqual({ ok: false, error: { code: 'NOT_FOUND' } })
  })

  it('toggles favourite both ways', async () => {
    const service = createMockMemoriesService({ latencyMs: 0, seed: SEED })

    const on = await service.toggleFavorite({ id: 'memory-1' })
    if (!on.ok) throw new Error('expected ok')
    expect(on.value.favorite).toBe(true)

    const off = await service.toggleFavorite({ id: 'memory-1' })
    if (!off.ok) throw new Error('expected ok')
    expect(off.value.favorite).toBe(false)
  })

  it('searches across title, caption, location and tags', async () => {
    const service = createMockMemoriesService({ latencyMs: 0, seed: SEED })

    for (const [q, id] of [['rome', 'memory-1'], ['seattle', 'memory-2'], ['trips', 'memory-1']]) {
      const r = await service.search({ query: q })
      if (!r.ok) throw new Error('expected ok')
      expect(r.value.map((m) => m.id)).toContain(id)
    }
  })

  it('returns nothing for an empty query rather than everything', async () => {
    const service = createMockMemoriesService({ latencyMs: 0, seed: SEED })

    const r = await service.search({ query: '   ' })

    if (!r.ok) throw new Error('expected ok')
    expect(r.value).toEqual([])
  })
})
