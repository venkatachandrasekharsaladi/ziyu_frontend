import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { WELCOME_HOME_COPY as COPY } from '@/copy/welcomeHome'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S22 — Welcome Home. Stitch screen 0aaf557c.
 *
 * The threshold between onboarding and the app itself, so it REPLACES rather
 * than pushes: once someone is home, backing into the setup flow they just
 * finished is nonsense.
 *
 * The design's "Assistant Ready" line is dropped — no assistant exists, and
 * announcing one that does nothing is a promise the app cannot keep.
 */
export function WelcomeHomeScreen() {
  const router = useRouter()

  const enter = useCallback(() => router.replace('/(app)/home'), [router])

  return (
    <AuthScreenLayout centred>
      <StatusScreen
        illustration={<AuthMedallion />}
        heading={COPY.heading}
        lede={COPY.lede}
        actions={<Button label={COPY.submit} onPress={enter} />}
      />
    </AuthScreenLayout>
  )
}
