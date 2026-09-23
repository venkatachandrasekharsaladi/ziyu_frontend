import { create } from 'zustand'

import type { Session } from '@/services/auth'
import type { SpaceStatus } from '@/services/pairing/types'

export type BootstrapPhase =
  | 'hydrating'
  | 'unauthenticated'
  | 'unverified'
  | 'ready'
  | 'offline'

export type AppBootstrapState = {
  phase: BootstrapPhase
  session: Session | null
  space: SpaceStatus | null
  retryKey: number
  begin: () => void
  resolveUnauthenticated: () => void
  resolveUnverified: (session: Session) => void
  resolveReady: (session: Session, space: SpaceStatus) => void
  resolveOffline: (session: Session | null) => void
  retry: () => void
  reset: () => void
}

export const useAppBootstrapStore = create<AppBootstrapState>((set) => ({
  phase: 'hydrating',
  session: null,
  space: null,
  retryKey: 0,
  begin: () => set({ phase: 'hydrating', space: null }),
  resolveUnauthenticated: () => set({ phase: 'unauthenticated', session: null, space: null }),
  resolveUnverified: (session) => set({ phase: 'unverified', session, space: null }),
  resolveReady: (session, space) => set({ phase: 'ready', session, space }),
  resolveOffline: (session) => set({ phase: 'offline', session }),
  retry: () => set((state) => ({ phase: 'hydrating', retryKey: state.retryKey + 1 })),
  reset: () => set({ phase: 'hydrating', session: null, space: null }),
}))
