export type DailyQuestionStatus = 'unanswered' | 'waiting' | 'complete'

export type DailyQuestion = {
  id: string
  /** UTC assignment day in `YYYY-MM-DD` form. */
  date: string
  prompt: string
  status: DailyQuestionStatus
  partnerHasAnswered: boolean
  myAnswer?: string | null
  /** Present only after both partners answer. */
  partnerAnswer?: string | null
  answeredAt?: string | null
  partnerAnsweredAt?: string | null
  memoryId?: string | null
}

export type DailyQuestionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: 'NO_COUPLE' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NETWORK' | 'UNKNOWN' } }

export type DailyQuestionService = {
  getToday: () => Promise<DailyQuestionResult<DailyQuestion>>
  answer: (answer: string) => Promise<DailyQuestionResult<DailyQuestion>>
}
