import { createMockStoryService } from '@/services/story/mock'

describe('mock story service', () => {
  const story = createMockStoryService({ latencyMs: 0 })

  it('saves a story and returns it', async () => {
    const result = await story.saveStory({ met: { value: '2019-10-12', precision: 'exact' } })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.met?.value).toBe('2019-10-12')
  })

  it('saves an empty story — every step is skippable', async () => {
    const result = await story.saveStory({})

    expect(result.ok).toBe(true)
  })

  it('reports a network failure through the reserved location', async () => {
    const result = await story.saveStory({ firstDate: { location: 'offline' } })

    expect(result).toEqual({ ok: false, error: { code: 'NETWORK' } })
  })

  it('is not case-sensitive about the reserved location', async () => {
    const result = await story.saveStory({ becameUs: { location: 'Offline' } })

    expect(result.ok).toBe(false)
  })
})
