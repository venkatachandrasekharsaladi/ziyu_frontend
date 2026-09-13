import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Button } from '@/design-system/primitives/Button'
import { CodeInput } from '@/design-system/primitives/CodeInput'
import { Text } from '@/design-system/primitives/Text'
import { VERIFICATION_CODE } from '@/modules/module-05-profile/data/mock'

const RESEND_SECONDS = 30

type CodeGateProps = {
  label: string
  /** Shown above the field: where the code went. */
  sentTo: string
  submitLabel: string
  resendLabel: string
  /** Rendered while the countdown runs, e.g. `(s) => \`Ask again in \${s}s\``. */
  resendPendingLabel: (seconds: number) => string
  errorMessage: string
  onVerified: () => void
  testID?: string
}

/**
 * A six-digit code someone has to get right.
 *
 * Used three times: verifying a phone number in Settings, and both the phone
 * and email gates on account deletion. Extracted rather than repeated, because
 * the part that is easy to get subtly different each time is the resend
 * countdown, and three near-identical countdowns is three places for it to
 * drift.
 *
 * NO BACKEND. The code is checked against `VERIFICATION_CODE` from the
 * cluster's mock data. That is what makes the wrong-code path real: anything
 * that is not the known value is rejected here, exactly as a server would, so
 * the error state is behaviour rather than a drawing.
 *
 * The resend countdown starts immediately on mount. A resend button that is
 * live the instant the screen appears invites a double-send from anyone who
 * did not see the first message arrive.
 */
export function CodeGate({
  label,
  sentTo,
  submitLabel,
  resendLabel,
  resendPendingLabel,
  errorMessage,
  onVerified,
  testID,
}: CodeGateProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setTimeout(() => setSecondsLeft((current) => current - 1), 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  const onChangeCode = useCallback((next: string) => {
    setCode(next)
    // Clearing on edit, not on submit: leaving the error up while someone
    // retypes tells them the thing they are currently fixing is still wrong.
    setError(undefined)
  }, [])

  const submit = useCallback(() => {
    if (code !== VERIFICATION_CODE) {
      setError(errorMessage)
      return
    }

    setError(undefined)
    onVerified()
  }, [code, errorMessage, onVerified])

  const resend = useCallback(() => {
    setSecondsLeft(RESEND_SECONDS)
    setCode('')
    setError(undefined)
  }, [])

  return (
    <View style={styles.gate} testID={testID}>
      <Text variant="footnote" tone="body">
        {sentTo}
      </Text>

      <CodeInput label={label} value={code} onChangeText={onChangeCode} error={error} />

      <Button label={submitLabel} onPress={submit} disabled={code.length < 6} />

      {secondsLeft > 0 ? (
        <Text variant="footnote" tone="body">
          {resendPendingLabel(secondsLeft)}
        </Text>
      ) : (
        <Button label={resendLabel} onPress={resend} variant="link" />
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  gate: {
    gap: theme.spacing.lg,
  },
}))
