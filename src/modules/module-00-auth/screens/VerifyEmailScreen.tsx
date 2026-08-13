import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { VERIFY_EMAIL_COPY as COPY } from '@/copy/verifyEmail'
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
  const [remaining, setRemaining] = useState(COPY.resendCooldownSeconds)
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
      setError(COPY.errors[result.error.code])
      return
    }

    setRemaining(COPY.resendCooldownSeconds)
  }, [])

  const isCoolingDown = remaining > 0

  return (
    <AuthScreenLayout onBack={router.back} centred>
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

        <Button label={COPY.changeEmail} onPress={router.back} variant="soft" />
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
