import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createMockPersistStorage } from '@/state/mockPersistStorage'
import type { Partner, Profile, SpaceStatus } from '@/services/pairing/types'

export type RelationshipStatus =
  | 'none'
  | 'inviting'
  | 'pending'
  | 'connected'
  | 'paused'
  | 'archived'

export type RelationshipState = {
  status: RelationshipStatus
  /** The invite code this user issued, if they are the inviter. */
  code: string | null
  partner: Partner | null
  profile: Profile | null

  setProfile: (profile: Profile) => void
  setInvite: (code: string) => void
  setPartner: (partner: Partner) => void
  connect: () => void
  syncWithServer: (space: SpaceStatus) => void
  reset: () => void
}

type PersistedRelationshipState = Pick<RelationshipState, 'status' | 'code' | 'partner' | 'profile'>

/**
 * Relationship state, shared across the onboarding flow.
 *
 * ONLY relationship state lives here. The profile *form* stays in
 * `react-hook-form` — `ARCHITECTURE.md` is explicit that a form is never lifted
 * into a global store. What lands here is the profile once submitted.
 *
 * PERSISTS IN MOCK MODE ONLY, via `createMockPersistStorage` — see that
 * file's header for why. Against a real backend this stays exactly what the
 * comment above used to say: nothing persists here, because there is no
 * token or record worth keeping until a real provider exists.
 */
export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set) => ({
      status: 'none',
      code: null,
      partner: null,
      profile: null,

      setProfile: (profile) => set({ profile }),
      setInvite: (code) => set({ code, status: 'inviting' }),
      setPartner: (partner) => set({ partner, status: 'pending' }),
      connect: () => set({ status: 'connected' }),
      syncWithServer: (space) => set((current) => ({
        status: space.status,
        code: space.status === 'none' ? null : current.code,
        partner: space.partner ?? (space.status === 'inviting' ? null : current.partner),
      })),
      reset: () => set({ status: 'none', code: null, partner: null, profile: null }),
    }),
    {
      name: 'tales-of-two:relationship',
      storage: createMockPersistStorage<PersistedRelationshipState>(),
      partialize: (state): PersistedRelationshipState => ({
        status: state.status,
        code: state.code,
        partner: state.partner,
        profile: state.profile,
      }),
    },
  ),
)
