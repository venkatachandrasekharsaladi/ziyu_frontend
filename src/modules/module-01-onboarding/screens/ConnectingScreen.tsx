import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

import { CONNECTING_COPY as COPY } from '@/copy/connecting'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M01-S07 — Connecting. Figma 522:738.
 *
 * Commits the relationship, then REPLACES rather than pushes: pushing a
 * progress screen leaves it in the back stack, so a user who presses back lands
 * on a spinner for an operation that already finished.
 *
 * A failure gets a message and a retry rather than an endless spinner — the one
 * outcome a progress screen must never produce is silence.
 */
export function ConnectingScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const partner = useRelationshipStore((state) => state.partner)
  const connect = useRelationshipStore((state) => state.connect)
  const [error, setError] = useState<string | null>(null)

  /**
   * The request outlives the screen when a user backs out mid-connect. Without
   * this guard its late success still fires `replace`, yanking them to a
   * "connected" screen from wherever they had navigated to.
   */
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  const attempt = useCallback(async () => {
    if (!partner) {
      router.replace('/(onboarding)/enter-code')
      return
    }

    setError(null)

    const result = await pairingService.confirmPartner({ partnerId: partner.id })

    if (!mounted.current) return

    if (!result.ok) {
      setError(COPY.errors[result.error.code])
      return
    }

    connect()
    router.replace('/(onboarding)/connected')
  }, [partner, connect, router])

  useEffect(() => {
    void attempt()
    // Runs once. `attempt` is stable for a given partner, and re-running on
    // every render would hammer the service.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthScreenLayout centred>
      <StatusScreen
        illustration={
          error ? null : <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        }
        heading={error ?? COPY.heading}
        lede={error ? undefined : COPY.lede}
        actions={error ? <Button label={COPY.retry} onPress={attempt} /> : undefined}
      />
    </AuthScreenLayout>
  )
}
