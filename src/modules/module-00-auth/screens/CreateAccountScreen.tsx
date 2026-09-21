import { zodResolver } from '@hookform/resolvers/zod'
import { useSessionStore } from '@/state/sessionStore'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { FormField } from '@/components/forms/FormField'
import { CREATE_ACCOUNT_COPY as COPY } from '@/copy/createAccount'
import { authErrorMessage } from '@/copy/errors'
import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'
import { SocialButton } from '@/design-system/patterns/SocialButton'
import { Button } from '@/design-system/primitives/Button'
import { Divider } from '@/design-system/primitives/Divider'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { PasswordRequirements } from '@/modules/module-00-auth/components/PasswordRequirements'
import { signUpSchema, type SignUpValues } from '@/modules/module-00-auth/state/authSchemas'
import { authService } from '@/services/auth'

/**
 * M00-S03 — Create Account. Figma 522:154.
 *
 * The largest normalisation in the cluster: Figma draws a cream page and
 * floating inset labels. Both are replaced — see spec D17 and D18.
 */
export function CreateAccountScreen() {
  const router = useRouter()
  const signedIn = useSessionStore((state) => state.signedIn)
  const back = useBackTo('/(auth)/welcome')

  const { control, handleSubmit, setError, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  const submit = handleSubmit(async (values) => {
    const result = await authService.signUp(values)

    if (result.ok) {
      // A brand-new account is never verified yet, so this always goes to the
      // mail step — but the session is kept so `(auth)/verify-email` and the
      // onboarding group behind it have something to stand on.
      signedIn(result.value)
      router.push('/(auth)/verify-email')
      return
    }

    // A taken address belongs on the field that caused it, not in a form-level
    // banner the user has to connect back to an input themselves.
    setError(result.error.code === 'EMAIL_ALREADY_EXISTS' ? 'email' : 'root', {
      message: authErrorMessage(result.error.code),
    })
  })

  const goToSignIn = useCallback(() => router.push('/(auth)/sign-in'), [router])

  return (
    <AuthScreenLayout onBack={back}>
      <View style={styles.copy}>
        {/*
          One Text with a newline, NOT one Text per line. As separate children of
          a gapped container the two lines sat 52pt apart (40pt line height plus
          the 12pt gap), which read as two headings rather than one wrapped over
          two lines. Joined, the line height alone governs the leading.
        */}
        <Text variant="h2" tone="heading">
          {COPY.headingLines.join('\n')}
        </Text>
        <Text variant="body" tone="body">
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
          autoComplete="new-password"
        />

        <PasswordRequirements value={password} />

        {formState.errors.root?.message ? (
          <Text variant="footnote" tone="error" align="center">
            {formState.errors.root.message}
          </Text>
        ) : null}

        <Button label={COPY.submit} onPress={submit} loading={formState.isSubmitting} />
      </View>

      <View style={styles.divider}>
        <Divider label={COPY.dividerLabel} />
      </View>

      {/* OAuth is out of scope (spec §17) — see `SignInScreen`'s matching
          social row for why these carry `disabled` (and its dimmed wrapper)
          instead of a live-looking `onPress={() => {}}` no-op. */}
      <View style={[styles.social, styles.socialDisabled]}>
        <SocialButton provider="google" onPress={() => {}} disabled />
        <SocialButton provider="apple" onPress={() => {}} disabled />
      </View>

      <FooterPrompt text={COPY.footerText} linkLabel={COPY.footerLink} onPress={goToSignIn} />
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
  divider: {
    paddingVertical: theme.spacing.xxxl,
  },
  social: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialDisabled: {
    opacity: 0.6,
  },
}))
