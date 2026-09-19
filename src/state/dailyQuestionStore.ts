import { create } from 'zustand'

import type { DailyQuestion } from '@/services/dailyQuestions'

type DailyQuestionState = {
  question?: DailyQuestion
  hydrated: boolean
  hydrate: (question: DailyQuestion) => void
  reset: () => void
}

export const useDailyQuestionStore = create<DailyQuestionState>((set) => ({
  hydrated: false,
  hydrate: (question) => set({ question, hydrated: true }),
  reset: () => set({ question: undefined, hydrated: false }),
}))
