import { Feather } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { FormField } from '@/components/forms/FormField'
import { SIGN_IN_COPY as COPY } from '@/copy/signIn'
import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'
import { SocialButton } from '@/design-system/patterns/SocialButton'
import { Button } from '@/design-system/primitives/Button'
import { Divider } from '@/design-system/primitives/Divider'
import { Text } from '@/design-system/primitives/Text'
import { AuthMedallion } from '@/modules/module-00-auth/components/AuthMedallion'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { signInSchema, type SignInValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S02 — Sign In. Figma 522:53.
 *
 * Normalised against the other four M00 screens: heading colour, lede size,
 * label tracking, input height, button height and weight, divider rules and
 * social-button shape all differ from what Figma draws. Every deviation is
 * recorded in the cluster spec.
 */
export function SignInScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, setValue, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const submit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await authService.signIn(values)

    if (result.ok) {
      // Always verify-email for now: branching on `emailVerified` would push to
      // `(app)`, which has no routes yet and would throw. See spec §10.
      router.push('/(auth)/verify-email')
      return
    }

    setFormError(COPY.errors[result.error.code])
    // The email is kept — retyping a correct address is pure friction.
    setValue('password', '')
  })

  const goToForgot = useCallback(() => router.push('/(auth)/forgot-password'), [router])
  const goToSignUp = useCallback(() => router.push('/(auth)/sign-up'), [router])

  return (
    <AuthScreenLayout onBack={router.back}>
      <AuthMedallion />

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="email"
          label={COPY.emailLabel}
          placeholder={COPY.emailPlaceholder}
          keyboardType="email-address"
          autoComplete="email"
        />

        <FormField
          control={control}
          name="password"
          label={COPY.passwordLabel}
          placeholder={COPY.passwordPlaceholder}
          secure
          autoComplete="current-password"
          labelTrailing={
            <Text variant="caption" tone="brand" onPress={goToForgot} accessibilityRole="link">
              {COPY.forgotLink}
            </Text>
          }
        />

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button
          label={COPY.submit}
          onPress={submit}
          loading={formState.isSubmitting}
          trailing={
            <Feather name="arrow-right" size={16} color={theme.colors.text.onPrimary} />
          }
        />
      </View>

      <View style={styles.divider}>
        <Divider label={COPY.dividerLabel} />
      </View>

      {/* OAuth is out of scope (spec §17). These render and are pressable so the
          layout is real, but do nothing yet. */}
      <View style={styles.social}>
        <SocialButton provider="google" onPress={() => {}} />
        <SocialButton provider="apple" onPress={() => {}} />
      </View>

      <FooterPrompt
        text={COPY.footerText}
        linkLabel={COPY.footerLink}
        onPress={goToSignUp}
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.huge,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.md,
  },
  divider: {
    paddingVertical: theme.spacing.xxxl,
  },
  social: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}))
