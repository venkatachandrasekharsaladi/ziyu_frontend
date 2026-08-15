import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ENTER_CODE_COPY as COPY } from '@/copy/enterPartnerCode'
import { Button } from '@/design-system/primitives/Button'
import { CodeInput } from '@/design-system/primitives/CodeInput'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'

const CODE_LENGTH = 6

/**
 * M01-S04 — Enter Partner Code. Figma 522:461.
 *
 * A failed code is KEPT, not cleared. A six-character code is usually wrong by
 * one character, and clearing it makes the user retype the five they got right.
 */
export function EnterPartnerCodeScreen() {
  const router = useRouter()
  const setPartner = useRelationshipStore((state) => state.setPartner)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onChangeText = useCallback((next: string) => {
    setCode(next)
    // Clearing on edit, not on failure: the message describes the code that was
    // submitted, so it should survive until the user changes something.
    setError(null)
  }, [])

  const submit = useCallback(async () => {
    setSubmitting(true)
    setError(null)

    const result = await pairingService.redeemCode({ code })

    setSubmitting(false)

    if (!result.ok) {
      setError(COPY.errors[result.error.code])
      return
    }

    setPartner(result.value)
    router.push('/(onboarding)/partner-found')
  }, [code, router, setPartner])

  const goToSetup = useCallback(() => router.push('/(onboarding)/setup'), [router])

  return (
    <AuthScreenLayout onBack={router.back} centred>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.field}>
        <CodeInput
          label={COPY.codeLabel}
          value={code}
          onChangeText={onChangeText}
          error={error ?? undefined}
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={COPY.submit}
          onPress={submit}
          loading={submitting}
          disabled={code.length < CODE_LENGTH}
        />
        <Button label={COPY.needInvite} onPress={goToSetup} variant="link" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  field: {
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.md,
  },
}))
