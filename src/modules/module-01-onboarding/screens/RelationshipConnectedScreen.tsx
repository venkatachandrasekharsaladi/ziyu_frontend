import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { RELATIONSHIP_CONNECTED_COPY as COPY } from '@/copy/relationshipConnected'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S08 — Relationship Connected. Figma 522:802.
 *
 * M01-S10 Relationship Confirmation was retired as a duplicate of this screen
 * (D30). Its ID is never reused.
 */
export function RelationshipConnectedScreen() {
  const router = useRouter()

  const goToStoryBegins = useCallback(
    // replace: pairing is done, so every screen behind this one is spent and
    // going back to a confirmation for a committed relationship is nonsense.
    () => router.replace('/(onboarding)/story-begins'),
    [router],
  )

  return (
    <AuthScreenLayout centred>
      <StatusScreen
        heading={COPY.heading}
        lede={COPY.lede}
        actions={<Button label={COPY.confirm} onPress={goToStoryBegins} />}
      />
    </AuthScreenLayout>
  )
}
