import type { AppBootstrapState } from '@/state/appBootstrapStore'
import { useAppBootstrapStore } from '@/state/appBootstrapStore'
import { useRelationshipStore, type RelationshipState } from '@/state/relationshipStore'
import { useSpaceStore, type SpaceState } from '@/state/spaceStore'

import type { GuardSnapshot } from '@/navigation/routePolicy'

export { destinationFor, redirectFor } from '@/navigation/routePolicy'

export function useRouteGuardSnapshot(): GuardSnapshot {
  const phase = useAppBootstrapStore((state: AppBootstrapState) => state.phase)
  const serverSpace = useAppBootstrapStore((state: AppBootstrapState) => state.space)
  const status = useRelationshipStore((state: RelationshipState) => state.status)
  const partner = useRelationshipStore((state: RelationshipState) => state.partner)
  const name = useSpaceStore((state: SpaceState) => state.name)
  const shortName = useSpaceStore((state: SpaceState) => state.shortName)
  const coverStyle = useSpaceStore((state: SpaceState) => state.coverStyle)

  if (phase !== 'ready') return { phase, space: serverSpace }
  return {
    phase,
    space: {
      coupleId: status === 'none' ? undefined : (serverSpace?.coupleId ?? 'pending-couple'),
      name: name ?? serverSpace?.name,
      shortName: shortName ?? serverSpace?.shortName,
      coverStyle,
      status,
      partner: partner ?? serverSpace?.partner,
    },
  }
}

