import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { useBackTo } from '@/hooks/useBackTo'
import { STORY_COVER_COPY as COPY } from '@/copy/storyCover'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { Button } from '@/design-system/primitives/Button'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S12 — Our Story Cover. Stitch screen 0fa7b9a6.
 *
 * The cover of the scrapbook. It asks for nothing; it only sets up the five
 * screens that follow, so it reuses `StatusScreen` rather than introducing a
 * layout for a screen with no content of its own.
 */
export function StoryCoverScreen() {
  const router = useRouter()
  const back = useBackTo('/(onboarding)/setup')

  const begin = useCallback(() => router.push('/(onboarding)/when-we-met'), [router])
  // Skipping jumps the whole capture flow, not one step of it.
  const skip = useCallback(() => router.replace('/(onboarding)/story-ready'), [router])

  return (
    <AuthScreenLayout onBack={back} centred>
      <StatusScreen
        illustration={<AuthMedallion />}
        heading={COPY.heading}
        lede={COPY.lede}
        actions={
          <>
            <Button label={COPY.begin} onPress={begin} />
            <Button label={COPY.skip} onPress={skip} variant="link" />
          </>
        }
      />
    </AuthScreenLayout>
  )
}
