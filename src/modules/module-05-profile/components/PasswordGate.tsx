import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { z } from 'zod'

import { SETTINGS_DELETE_COPY as COPY } from '@/copy/settingsDeleteAccount'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { MOCK_PASSWORD } from '@/modules/module-05-profile/data/mock'

const MAX_ATTEMPTS = 5

const schema = z.object({
  password: z.string().min(1, COPY.passwordRequired),
})

type FormValues = z.infer<typeof schema>

type PasswordGateProps = {
  onPassed: () => void
}

/**
 * Gate 1 of 3 on account deletion.
 *
 * Checked against `MOCK_PASSWORD` — see that constant's own note on why a
 * single known value is what makes the rejection path real.
 *
 * THE LOCKOUT IS PER-MOUNT, and that is deliberate rather than a shortcut. A
 * client-side counter cannot enforce anything: backing out and re-entering
 * resets it, and it would reset if the attacker force-quit the app. Storing it
 * would only imply a protection that is not there. What this actually buys is
 * the honest thing a client can buy — it stops a casual guesser holding
 * somebody's unlocked phone, and it makes the failure path exist and be tested.
 */
export function PasswordGate({ onPassed }: PasswordGateProps) {
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | undefined>(undefined)

  const isLockedOut = attempts >= MAX_ATTEMPTS

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  })

  const onSubmit = useCallback(
    (values: FormValues) => {
      if (isLockedOut) return

      if (values.password !== MOCK_PASSWORD) {
        setAttempts((current) => current + 1)
        setError(COPY.passwordWrong)
        return
      }

      setError(undefined)
      onPassed()
    },
    [isLockedOut, onPassed],
  )

  return (
    <>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.passwordHeading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.passwordLede}
        </Text>
      </View>

      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <Input
            label={COPY.passwordLabel}
            value={field.value}
            onChangeText={(next) => {
              field.onChange(next)
              // Cleared on edit, not on submit — leaving the error up while
              // somebody retypes says the thing they are fixing is still wrong.
              setError(undefined)
            }}
            onBlur={field.onBlur}
            error={fieldState.error?.message ?? error}
            secure
            autoComplete="current-password"
            autoCapitalize="none"
            editable={!isLockedOut}
          />
        )}
      />

      {isLockedOut ? (
        <Text variant="footnote" tone="error">
          {COPY.passwordLockedOut}
        </Text>
      ) : null}

      <Button
        label={COPY.verify}
        onPress={handleSubmit(onSubmit)}
        variant="outline"
        disabled={isLockedOut}
      />
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
}))
