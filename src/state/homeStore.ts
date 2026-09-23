import { create } from 'zustand'

import type { HomeDashboard } from '@/services/home/types'

type HomeState = {
  dashboard?: HomeDashboard
  hydrated: boolean
  hydrate: (dashboard: HomeDashboard) => void
  reset: () => void
}

export const useHomeStore = create<HomeState>((set) => ({
  dashboard: undefined,
  hydrated: false,
  hydrate: (dashboard) => set({ dashboard, hydrated: true }),
  reset: () => set({ dashboard: undefined, hydrated: false }),
}))
