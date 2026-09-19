import { isMockMode } from '@/config/env'
import { createHttpDailyQuestionService } from '@/services/dailyQuestions/http'
import { createMockDailyQuestionService } from '@/services/dailyQuestions/mock'

export type * from '@/services/dailyQuestions/types'

export const dailyQuestionService = isMockMode
  ? createMockDailyQuestionService()
  : createHttpDailyQuestionService()
