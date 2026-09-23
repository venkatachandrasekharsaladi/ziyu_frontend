import { create } from 'zustand'

import type { KeyDates, Moment, Story, StoryDate } from '@/services/story/types'

type StoryState = Story & {
  setMet: (met: StoryDate) => void
  setFirstDate: (moment: Moment) => void
  setBecameUs: (moment: Moment) => void
  setFirstMemory: (moment: Moment) => void
  setKeyDates: (dates: KeyDates) => void
  hydrate: (story: Story) => void
  /** The plain data, for handing to the service. */
  toStory: () => Story
  reset: () => void
}

const EMPTY: Story = {}

/**
 * The couple's story, accumulated across M01-S12…S16.
 *
 * Each screen writes its own slice and moves on; nothing is sent anywhere until
 * M01-S17, where the user sees the whole timeline and commits. That is why this
 * store exists rather than a save per screen — a half-entered story that the
 * user abandons should leave nothing behind.
 *
 * Like `relationshipStore`, only the RESULT lives here. Every form on the way
 * stays in `react-hook-form`.
 */
export const useStoryStore = create<StoryState>((set, get) => ({
  ...EMPTY,

  setMet: (met) => set({ met }),
  setFirstDate: (firstDate) => set({ firstDate }),
  setBecameUs: (becameUs) => set({ becameUs }),
  setFirstMemory: (firstMemory) => set({ firstMemory }),
  setKeyDates: (keyDates) => set({ keyDates }),
  hydrate: ({ met, firstDate, becameUs, firstMemory, keyDates }) =>
    set({ met, firstDate, becameUs, firstMemory, keyDates }),

  toStory: () => {
    const { met, firstDate, becameUs, firstMemory, keyDates } = get()

    return { met, firstDate, becameUs, firstMemory, keyDates }
  },

  reset: () => set({ ...EMPTY, met: undefined, firstDate: undefined, becameUs: undefined, firstMemory: undefined, keyDates: undefined }),
}))
