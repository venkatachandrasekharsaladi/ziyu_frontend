import { requireApiUrl } from '@/config/env'
import { get, put } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type {
  DailyQuestion,
  DailyQuestionResult,
  DailyQuestionService,
} from '@/services/dailyQuestions/types'

const fail = (error: unknown): DailyQuestionResult<never> => {
  if (isApiError(error)) {
    const code = error.code
    if (code === 'NO_COUPLE' || code === 'FORBIDDEN'
      || code === 'VALIDATION_ERROR' || code === 'NETWORK') {
      return { ok: false, error: { code } }
    }
  }
  return { ok: false, error: { code: 'UNKNOWN' } }
}

export function createHttpDailyQuestionService(): DailyQuestionService {
  requireApiUrl()
  return {
    async getToday() {
      try { return { ok: true, value: await get<DailyQuestion>('/daily-question') } }
      catch (error) { return fail(error) }
    },
    async answer(answer) {
      try {
        return { ok: true, value: await put<DailyQuestion>('/daily-question/answer', { answer }) }
      } catch (error) { return fail(error) }
    },
  }
}
