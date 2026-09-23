import { Feather } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSessionStore } from '@/state/sessionStore'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { FormField } from '@/components/forms/FormField'
import { authErrorMessage } from '@/copy/errors'
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
  const signedIn = useSessionStore((state) => state.signedIn)
  const back = useBackTo('/(auth)/welcome')
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
      /*
       * The session is KEPT now — `(app)` and `(onboarding)` are guarded on it,
       * and before this store existed the `Session` this call returns was
       * thrown away, which is why nothing could be guarded.
       *
       * The old note here said branching on `emailVerified` would push into
       * `(app)`, "which has no routes yet and would throw". It has routes now,
       * so the branch is real: a verified account goes on, an unverified one
       * still has a mail to open first.
       */
      signedIn(result.value)

      router.replace(result.value.emailVerified ? '/(onboarding)/setup' : '/(auth)/verify-email')

      return
    }

    setFormError(authErrorMessage(result.error.code))
    // The email is kept — retyping a correct address is pure friction.
    setValue('password', '')
  })

  const goToForgot = useCallback(() => router.push('/(auth)/forgot-password'), [router])
  const goToSignUp = useCallback(() => router.push('/(auth)/sign-up'), [router])

  return (
    <AuthScreenLayout onBack={back}>
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
        />

        <View style={styles.forgot}>
          <Text
            variant="captionAction"
            tone="brand"
            onPress={goToForgot}
            accessibilityRole="link"
          >
            {COPY.forgotLink}
          </Text>
        </View>

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

      {/* OAuth is out of scope (spec §17) — real Google/Apple sign-in needs
          `expo-auth-session` plus provider credentials, neither of which
          exist here. These used to render pressable with an `onPress={() =>
          {}}` no-op, which looked live and did nothing; `disabled` is what
          `SocialButton` already exposes for exactly this (it flags
          `accessibilityState.disabled` and blocks the press), so the layout
          stays real while honestly reading as not-yet-available instead of
          silently dead. The wrapping `View`'s opacity is the visual half —
          `SocialButton` itself does not dim on `disabled` (design-system is
          out of scope for this task), so it happens here instead, same 0.6
          `BottomNav` reaches for on its own unbuilt tab. */}
      <View style={[styles.social, styles.socialDisabled]}>
        <SocialButton provider="google" onPress={() => {}} disabled />
        <SocialButton provider="apple" onPress={() => {}} disabled />
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
    // Was `huge` (48) top and bottom around the medallion + heading — the
    // single biggest contributor to this screen needing to scroll on a
    // typical phone. `xxl` still gives the block room to breathe.
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  form: {
    gap: theme.spacing.md,
  },
  forgot: {
    alignItems: 'flex-end',
  },
  divider: {
    paddingVertical: theme.spacing.lg,
  },
  social: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialDisabled: {
    opacity: 0.6,
  },
}))
