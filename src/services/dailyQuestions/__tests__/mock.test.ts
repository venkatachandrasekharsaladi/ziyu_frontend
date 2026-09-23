import { createMockDailyQuestionService } from '@/services/dailyQuestions/mock'

describe('daily question mock', () => {
  it('keeps the partner answer absent while reciprocity is incomplete', async () => {
    const service = createMockDailyQuestionService()

    const result = await service.answer('Coffee together')

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      value: expect.objectContaining({
        status: 'waiting',
        myAnswer: 'Coffee together',
        partnerAnswer: null,
      }),
    }))
  })

  it('reveals both answers and links a memory after reciprocity', async () => {
    const service = createMockDailyQuestionService({ partnerAnswer: 'Our evening walk' })

    const result = await service.answer('Coffee together')

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      value: expect.objectContaining({
        status: 'complete',
        partnerAnswer: 'Our evening walk',
        memoryId: 'mock-daily-memory',
      }),
    }))
  })

  it('rejects blank answers', async () => {
    const result = await createMockDailyQuestionService().answer('   ')
    expect(result).toEqual({ ok: false, error: { code: 'VALIDATION_ERROR' } })
  })
})
