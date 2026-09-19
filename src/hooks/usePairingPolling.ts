import { useCallback, useEffect, useRef } from 'react'

import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'

/** Polling is intentionally scoped to waiting screens until Realtime exists. */
export function usePairingPolling(intervalMs = 2_000) {
  const syncRelationship = useRelationshipStore((state) => state.syncWithServer)
  const syncSpace = useSpaceStore((state) => state.syncWithServer)
  const running = useRef(false)

  const poll = useCallback(async () => {
    if (running.current) return
    running.current = true
    try {
      const result = await pairingService.getSpace()
      if (result.ok) {
        syncRelationship(result.value)
        syncSpace(result.value)
      }
    } finally {
      running.current = false
    }
  }, [syncRelationship, syncSpace])

  useEffect(() => {
    void poll()
    const timer = setInterval(() => void poll(), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs, poll])

  return poll
}