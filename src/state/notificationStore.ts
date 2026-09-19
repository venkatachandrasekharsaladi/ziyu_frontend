import { create } from 'zustand'

import type { NotificationPreferences } from '@/services/notifications'

type NotificationState = {
  preferences?: NotificationPreferences
  hydrated: boolean
  hydrate: (preferences: NotificationPreferences) => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  hydrated: false,
  hydrate: (preferences) => set({ preferences, hydrated: true }),
  reset: () => set({ preferences: undefined, hydrated: false }),
}))
