import { zodResolver } from '@hookform/resolvers/zod'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FormField } from '@/components/forms/FormField'
import { authErrorMessage } from '@/copy/errors'
import { RESET_PASSWORD_COPY as COPY } from '@/copy/resetPassword'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { PasswordStrength } from '@/modules/module-00-auth/components/PasswordStrength'
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S06 — Reset Password. Stitch screen c2f89424.
 *
 * Three states, of which the design draws two.
 *
 * The token arrives as a route parameter. It is opaque, single-use, and reaches
 * the device only by email — `VALIDATION.md` is explicit that no endpoint ever
 * returns one. Until the backend publishes the deep-link format (blocker B4)
 * nothing can actually route here from an inbox, so the third state exists: a
 * screen opened without a token offers an explanation and a way back rather than
 * a form whose submit could never succeed.
 *
 * On success the screen swaps state IN PLACE, the same shape M00-S05 uses, and
 * then leaves for sign in rather than the app. The design's heading says
 * "You're back in", but `POST /auth/password/reset` returns no tokens and
 * revokes every existing refresh session, so the user is definitively signed
 * out. Sending them anywhere else would mean inventing a session the contract
 * does not grant.
 */
export function ResetPasswordScreen() {
  const router = useRouter()
  const { token } = useLocalSearchParams<{ token?: string }>()
  const [isReset, setIsReset] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  })

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? ''

  const submit = handleSubmit(async (values) => {
    if (!token) return

    setFormError(null)

    const result = await authService.resetPassword({
      token,
      // `confirmPassword` deliberately does not travel: it is a client-side
      // guard and the contract has no field for it.
      newPassword: values.newPassword,
    })

    if (!result.ok) {
      setFormError(authErrorMessage(result.error.code, COPY.errors))
      return
    }

    setIsReset(true)
  })

  const goToSignIn = useCallback(() => router.replace('/(auth)/sign-in'), [router])
  const goToForgot = useCallback(() => router.replace('/(auth)/forgot-password'), [router])

  if (!token) {
    return (
      <AuthScreenLayout onBack={router.back} centred>
        <StatusScreen
          heading={COPY.errors.TOKEN_INVALID}
          actions={<Button label={COPY.missingTokenAction} onPress={goToForgot} />}
        />
      </AuthScreenLayout>
    )
  }

  if (isReset) {
    return (
      <AuthScreenLayout centred>
        <StatusScreen
          illustration={<AuthMedallion />}
          heading={COPY.successHeading}
          lede={COPY.successLede}
          actions={<Button label={COPY.successAction} onPress={goToSignIn} />}
        />
      </AuthScreenLayout>
    )
  }

  return (
    <AuthScreenLayout onBack={router.back}>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="newPassword"
          label={COPY.newPasswordLabel}
          placeholder={COPY.passwordPlaceholder}
          secure
          autoComplete="new-password"
        />

        <PasswordStrength value={newPassword} />

        <FormField
          control={control}
          name="confirmPassword"
          label={COPY.confirmLabel}
          placeholder={COPY.passwordPlaceholder}
          secure
          autoComplete="new-password"
        />

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button label={COPY.submit} onPress={submit} loading={formState.isSubmitting} />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.xxl,
  },
}))
