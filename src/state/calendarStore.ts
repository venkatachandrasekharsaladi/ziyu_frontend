import { create } from 'zustand'

import type { CalendarEvent, ComingUp } from '@/services/calendar/types'

type CalendarState = {
  events: CalendarEvent[]
  comingUp: ComingUp[]
  hydrated: boolean
  hydrate: (events: CalendarEvent[], comingUp?: ComingUp[]) => void
  add: (event: CalendarEvent) => void
  replace: (event: CalendarEvent) => void
  remove: (id: string) => void
  reset: () => void
}

export const useCalendarStore = create<CalendarState>((set) => ({
  events: [],
  comingUp: [],
  hydrated: false,
  hydrate: (events, comingUp = []) => set({ events, comingUp, hydrated: true }),
  add: (event) => set((state) => ({ events: [...state.events, event] })),
  replace: (event) => set((state) => ({
    events: state.events.map((item) => (item.id === event.id ? event : item)),
  })),
  remove: (id) => set((state) => ({
    events: state.events.filter((event) => event.id !== id),
    comingUp: state.comingUp.filter((event) => event.key !== id),
  })),
  reset: () => set({ events: [], comingUp: [], hydrated: false }),
}))
