import { create } from 'zustand'

import type { TimelineItem, TimelinePage } from '@/services/timeline'

type TimelineState = {
  items: TimelineItem[]
  nextCursor?: string
  hydrated: boolean
  hydrate: (page: TimelinePage) => void
  append: (page: TimelinePage) => void
  reset: () => void
}

export const useTimelineStore = create<TimelineState>((set) => ({
  items: [],
  hydrated: false,
  hydrate: ({ items, nextCursor }) => set({ items, nextCursor, hydrated: true }),
  append: ({ items, nextCursor }) => set((state) => ({
    items: [...state.items, ...items.filter(
      (candidate) => !state.items.some((item) => item.id === candidate.id && item.type === candidate.type),
    )],
    nextCursor,
  })),
  reset: () => set({ items: [], nextCursor: undefined, hydrated: false }),
}))
