import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { authErrorMessage } from '@/copy/errors'
import { VERIFY_EMAIL_COPY as COPY } from '@/copy/verifyEmail'
import { useSessionStore } from '@/state/sessionStore'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { EnvelopeIllustration } from '@/modules/module-00-auth/components/EnvelopeIllustration'
import { authService } from '@/services/auth'

/** mm:ss. At 60 this reads 01:00; Figma's 00:59 is one tick later. */
function formatCooldown(seconds: number): string {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const rest = String(seconds % 60).padStart(2, '0')

  return `${minutes}:${rest}`
}

/**
 * M00-S04 — Verify Email. Figma 522:226.
 *
 * "Change Email" returns to Create Account rather than pushing a new screen:
 * there is no change-email design, and inventing one would add a sixth screen
 * ID, which `SCREENS.md` rules 2 and 3 forbid without approval.
 */
export function VerifyEmailScreen() {
  const router = useRouter()
  const emailVerified = useSessionStore((state) => state.emailVerified)
  const back = useBackTo('/(auth)/welcome')
  // Explicit `number`: COPY is `as const`, so inference would narrow this to the
  // literal 60 and reject every decrement.
  const [remaining, setRemaining] = useState<number>(COPY.resendCooldownSeconds)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (remaining <= 0) return

    const timer = setInterval(() => {
      setRemaining((previous) => (previous <= 1 ? 0 : previous - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [remaining])

  const resend = useCallback(async () => {
    setIsSending(true)
    setError(null)

    // The address belongs to the session, which does not exist yet. The mock
    // ignores it; a real provider will read it from the session.
    const result = await authService.resendVerification({ email: '' })

    setIsSending(false)

    if (!result.ok) {
      setError(authErrorMessage(result.error.code))
      return
    }

    setRemaining(COPY.resendCooldownSeconds)
  }, [])

  const goToOnboarding = useCallback(
    () => {
      /*
       * Marks the session verified on the way through.
       *
       * There is no provider to ask, so "I have clicked the link" is the only
       * signal this build has — the same assumption `copy/verifyEmail.ts`
       * already documents. Without it the onboarding guard would hold, but the
       * `(app)` guard behind it never would, and the user would be bounced back
       * to Welcome at the end of onboarding having done everything right.
       */
      emailVerified()
      router.replace('/(onboarding)/setup')
    },
    [router],
  )

  const isCoolingDown = remaining > 0

  return (
    <AuthScreenLayout onBack={back} centred>
      <EnvelopeIllustration />

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.actions}>
        {error ? (
          <Text variant="footnote" tone="error" align="center">
            {error}
          </Text>
        ) : null}

        <Button
          label={COPY.resend}
          onPress={resend}
          disabled={isCoolingDown}
          loading={isSending}
          trailing={
            isCoolingDown ? (
              // `body`, NOT `onPrimary`. The countdown only ever shows while the
              // button is cooling down, which means disabled, which means the
              // fill is grey — white on that pair is 1.70:1. Body ink on it is
              // 5.48:1, the same pair the disabled label uses and the contrast
              // suite asserts.
              <Text variant="countdown" tone="body">
                {formatCooldown(remaining)}
              </Text>
            ) : undefined
          }
        />

        {/*
          The forward exit into M01. This screen used to be a dead end: the
          only way on was backwards. There is still no session reporting
          `emailVerified`, so this is the user asserting they followed the
          link, and it replaces rather than pushes — returning to "check your
          inbox" after pairing has begun is nonsense.
        */}
        <Button label={COPY.continue} onPress={goToOnboarding} />

        {/*
          `outline` — a bordered card, not a flat tint. `soft` was the odd one
          out: every other secondary/back action in this module (Forgot
          Password's "Back to Sign In", Invite Partner/Invitation Sent's
          "Copy") uses `outline`, and this is the only button on this screen
          that isn't already `primary`, so it read as an unrelated third
          colour rather than "the other action" on the same screen.
        */}
        <Button label={COPY.changeEmail} onPress={back} variant="outline" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.xxl,
  },
}))
