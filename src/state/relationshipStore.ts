import { create } from 'zustand'

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

/**
 * Relationship state, shared across the onboarding flow.
 *
 * ONLY relationship state lives here. The profile *form* stays in
 * `react-hook-form` — `ARCHITECTURE.md` is explicit that a form is never lifted
 * into a global store. What lands here is the profile once submitted.
 *
 * Nothing persists. There is no token or record to keep until a real provider
 * exists, which is why `expo-secure-store` and MMKV are still not installed.
 */
export const useRelationshipStore = create<RelationshipState>((set) => ({
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
}))
