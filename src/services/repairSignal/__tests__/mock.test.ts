import { createMockRepairSignalService } from '@/services/repairSignal/mock'

describe('repair signal mock', () => {
  afterEach(() => jest.useRealTimers())

  it('creates one idempotent low-pressure signal', async () => {
    const service = createMockRepairSignalService()

    const first = await service.send()
    const retry = await service.send()

    expect(first).toEqual(expect.objectContaining({
      ok: true,
      value: expect.objectContaining({
        status: 'open',
        sentByMe: true,
        mutual: false,
      }),
    }))
    expect(retry).toEqual(first)
  })

  it('cancels without creating a negative response state', async () => {
    const service = createMockRepairSignalService()
    await service.send()

    expect(await service.cancel()).toEqual({ ok: true, value: undefined })
    expect(await service.current()).toEqual({ ok: true, value: null })
  })

  it('expires quietly after 24 hours', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-18T12:00:00Z'))
    const service = createMockRepairSignalService()
    await service.send()

    jest.setSystemTime(new Date('2026-09-19T12:00:01Z'))
    expect(await service.current()).toEqual({ ok: true, value: null })
  })
})
