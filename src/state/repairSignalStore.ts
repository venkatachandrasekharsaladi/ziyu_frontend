import { create } from 'zustand'

import { repairSignalService, type RepairSignal } from '@/services/repairSignal'

type RepairSignalState = {
  signal: RepairSignal | null
  hydrated: boolean
  loading: boolean
  error?: 'NO_COUPLE' | 'FORBIDDEN' | 'NETWORK' | 'UNKNOWN'
  hydrate: (signal: RepairSignal | null) => void
  refresh: () => Promise<void>
  send: () => Promise<boolean>
  cancel: () => Promise<boolean>
  reset: () => void
}

export const useRepairSignalStore = create<RepairSignalState>((set) => ({
  signal: null,
  hydrated: false,
  loading: false,
  hydrate: (signal) => set({ signal, hydrated: true, error: undefined }),
  refresh: async () => {
    set({ loading: true, error: undefined })
    const result = await repairSignalService.current()
    if (result.ok) set({ signal: result.value, hydrated: true, loading: false })
    else set({ error: result.error.code, hydrated: true, loading: false })
  },
  send: async () => {
    set({ loading: true, error: undefined })
    const result = await repairSignalService.send()
    if (result.ok) {
      set({ signal: result.value, hydrated: true, loading: false })
      return true
    }
    set({ error: result.error.code, loading: false })
    return false
  },
  cancel: async () => {
    set({ loading: true, error: undefined })
    const result = await repairSignalService.cancel()
    if (result.ok) {
      set({ signal: null, hydrated: true, loading: false })
      return true
    }
    set({ error: result.error.code, loading: false })
    return false
  },
  reset: () => set({
    signal: null, hydrated: false, loading: false, error: undefined,
  }),
}))
