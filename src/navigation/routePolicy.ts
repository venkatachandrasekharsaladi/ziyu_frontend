import type { SpaceStatus } from '@/services/pairing/types'
import type { BootstrapPhase } from '@/state/appBootstrapStore'

export type RouteGroup = 'root' | 'auth' | 'onboarding' | 'app'
export type GuardDestination =
  | '/(auth)/welcome'
  | '/(auth)/verify-email'
  | '/(onboarding)/setup'
  | '/(onboarding)/invitation-sent'
  | '/(onboarding)/confirm-partner'
  | '/(app)/home'

export type GuardSnapshot = {
  phase: BootstrapPhase
  space: SpaceStatus | null
}

const AUTH: GuardDestination = '/(auth)/welcome'
const VERIFY: GuardDestination = '/(auth)/verify-email'
const SETUP: GuardDestination = '/(onboarding)/setup'
const HOME: GuardDestination = '/(app)/home'

export function destinationFor(snapshot: GuardSnapshot): GuardDestination | null {
  if (snapshot.phase === 'unauthenticated') return AUTH
  if (snapshot.phase === 'unverified') return VERIFY
  if (snapshot.phase !== 'ready' || !snapshot.space) return null

  switch (snapshot.space.status) {
    case 'inviting':
      return '/(onboarding)/invitation-sent'
    case 'pending':
      return '/(onboarding)/confirm-partner'
    case 'connected':
    case 'paused':
    case 'archived':
      return HOME
    case 'none':
    default:
      return SETUP
  }
}

export function redirectFor(group: RouteGroup, snapshot: GuardSnapshot): GuardDestination | null {
  const destination = destinationFor(snapshot)
  if (!destination) return null

  if (group === 'root') return destination
  if (group === 'auth') {
    return snapshot.phase === 'unauthenticated' || snapshot.phase === 'unverified'
      ? null
      : destination
  }
  if (group === 'onboarding') {
    if (snapshot.phase !== 'ready') return destination
    return snapshot.space?.status === 'connected'
      || snapshot.space?.status === 'paused'
      || snapshot.space?.status === 'archived'
      ? HOME
      : null
  }

  return snapshot.phase === 'ready'
    && (snapshot.space?.status === 'connected'
      || snapshot.space?.status === 'paused'
      || snapshot.space?.status === 'archived')
    ? null
    : destination
}
