import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { OUR_STORY_BEGINS_COPY as COPY } from '@/copy/ourStoryBegins'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S11 — Our Story Begins. Figma 522:834.
 *
 * The hand-off from pairing into the story cluster. Both exits are live: "Let's
 * Begin" opens the capture flow, and "Skip for now" jumps the whole of it to
 * the summary, since every step inside was optional anyway.
 */
export function OurStoryBeginsScreen() {
  const router = useRouter()

  const begin = useCallback(() => router.push('/(onboarding)/story-cover'), [router])
  const skip = useCallback(() => router.replace('/(onboarding)/story-ready'), [router])

  return (
    <AuthScreenLayout centred>
      <StatusScreen
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
