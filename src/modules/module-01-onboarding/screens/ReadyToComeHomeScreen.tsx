import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { READY_TO_COME_HOME_COPY as COPY } from '@/copy/readyToComeHome'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S21 — Ready to Come Home. Stitch screen 3f147d11.
 *
 * The design previews two memory cards here — a "Paris Trip" and an "Our
 * Beginning" — but both are invented sample content, and rendering fake
 * memories on a real user's screen would be a lie about what the app holds.
 * The screen keeps its copy and its single action.
 */
export function ReadyToComeHomeScreen() {
  const router = useRouter()

  const enter = useCallback(() => router.push('/(onboarding)/welcome-home'), [router])

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
