import { create } from 'zustand'

import type { DeletionStatus } from '@/services/account'
import type { CoupleLifecycle } from '@/services/pairing'

type AccountState = {
  lifecycle?: CoupleLifecycle
  deletion?: DeletionStatus
  hydrated: boolean
  hydrate: (lifecycle: CoupleLifecycle, deletion: DeletionStatus) => void
  setLifecycle: (lifecycle: CoupleLifecycle) => void
  setDeletion: (deletion: DeletionStatus) => void
  reset: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
  hydrated: false,
  hydrate: (lifecycle, deletion) => set({ lifecycle, deletion, hydrated: true }),
  setLifecycle: (lifecycle) => set({ lifecycle }),
  setDeletion: (deletion) => set({ deletion }),
  reset: () => set({ lifecycle: undefined, deletion: undefined, hydrated: false }),
}))
