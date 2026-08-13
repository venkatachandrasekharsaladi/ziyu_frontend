import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FormField } from '@/components/forms/FormField'
import { FORGOT_PASSWORD_COPY as COPY } from '@/copy/forgotPassword'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { emailOnlySchema, type EmailOnlyValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S05 — Forgot Password. Figma 522:127.
 *
 * The roughest frame in the set: its 11px Bold primary label in a 39pt button is
 * the clearest error in the design, and both it and the secondary sat below the
 * 44pt touch minimum.
 *
 * On success the screen swaps state IN PLACE. Figma draws only the form and names
 * the frame "(Default)", implying a second state that was never drawn; an
 * in-place swap is the smallest honest reading, and it avoids inventing a sixth
 * screen ID (`SCREENS.md` rules 2 and 3).
 */
export function ForgotPasswordScreen() {
  const router = useRouter()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const { control, handleSubmit, formState } = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  })

  const send = handleSubmit(async ({ email }) => {
    setFormError(null)

    const result = await authService.requestPasswordReset({ email })

    if (!result.ok) {
      setFormError(COPY.errors[result.error.code])
      return
    }

    // Reports success whether or not the address has an account.
    setSentTo(email)
  })

  const resend = useCallback(async () => {
    if (!sentTo) return

    setIsResending(true)
    setFormError(null)

    const result = await authService.requestPasswordReset({ email: sentTo })

    setIsResending(false)

    if (!result.ok) {
      setFormError(COPY.errors[result.error.code])
    }
  }, [sentTo])

  const goToSignIn = useCallback(() => router.push('/(auth)/sign-in'), [router])

  return (
    <AuthScreenLayout onBack={router.back} centred>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {sentTo ? COPY.sentHeading : COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {sentTo ? COPY.sentLede(sentTo) : COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        {sentTo ? null : (
          <FormField
            control={control}
            name="email"
            label={COPY.emailLabel}
            placeholder={COPY.emailPlaceholder}
            keyboardType="email-address"
            autoComplete="email"
          />
        )}

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {sentTo ? (
            <Button label={COPY.resend} onPress={resend} loading={isResending} />
          ) : (
            <Button label={COPY.submit} onPress={send} loading={formState.isSubmitting} />
          )}

          <Button label={COPY.backToSignIn} onPress={goToSignIn} variant="outline" />
        </View>
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  form: {
    gap: theme.spacing.xxl,
  },
  actions: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
}))
