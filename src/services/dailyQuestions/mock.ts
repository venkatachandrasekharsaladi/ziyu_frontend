import type { DailyQuestion, DailyQuestionService } from '@/services/dailyQuestions/types'

type MockOptions = { partnerAnswer?: string }

export function createMockDailyQuestionService(
  { partnerAnswer }: MockOptions = {},
): DailyQuestionService {
  let question: DailyQuestion = {
    id: 'mock-daily-question',
    date: '2026-09-18',
    prompt: 'What small thing made you smile today?',
    status: 'unanswered',
    partnerHasAnswered: partnerAnswer !== undefined,
  }

  return {
    async getToday() {
      return { ok: true, value: question }
    },
    async answer(answer) {
      const value = answer.trim()
      if (!value || value.length > 1500) {
        return { ok: false, error: { code: 'VALIDATION_ERROR' } }
      }
      question = {
        ...question,
        status: question.partnerHasAnswered ? 'complete' : 'waiting',
        myAnswer: value,
        answeredAt: '2026-09-18T12:00:00Z',
        partnerAnswer: question.partnerHasAnswered ? partnerAnswer : null,
        partnerAnsweredAt: question.partnerHasAnswered ? '2026-09-18T11:00:00Z' : null,
        memoryId: question.partnerHasAnswered ? 'mock-daily-memory' : null,
      }
      return { ok: true, value: question }
    },
  }
}
