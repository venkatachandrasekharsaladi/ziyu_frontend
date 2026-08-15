import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Share, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { INVITATION_SENT_COPY as COPY } from '@/copy/invitationSent'
import { Button } from '@/design-system/primitives/Button'
import { CodeDisplay } from '@/design-system/primitives/CodeDisplay'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M01-S05 — Invitation Sent. Figma 522:655.
 *
 * Shows the code M01-S03 already issued rather than minting a second one: two
 * codes for one invitation is how a partner ends up holding the dead one.
 *
 * Cancelling confirms first (spec §10). The partner may already be looking at
 * the code, so destroying it on a single tap strands them with no explanation.
 */
export function InvitationSentScreen() {
  const router = useRouter()
  const code = useRelationshipStore((state) => state.code)
  const reset = useRelationshipStore((state) => state.reset)
  const [formError, setFormError] = useState<string | null>(null)

  const onShare = useCallback(async () => {
    if (!code) return

    await Share.share({ message: COPY.shareMessage(code) })
  }, [code])

  // See InvitePartnerScreen — expo-clipboard is not installed.
  const onCopy = useCallback(() => {}, [])

  const destroy = useCallback(async () => {
    if (!code) return

    const result = await pairingService.cancelInvite({ code })

    if (!result.ok) {
      setFormError(COPY.errors[result.error.code])
      return
    }

    reset()
    // replace, not push: the invitation this screen describes no longer exists,
    // so there is nothing to come back to.
    router.replace('/(onboarding)/setup')
  }, [code, reset, router])

  const onCancel = useCallback(() => {
    Alert.alert(COPY.confirmTitle, COPY.confirmBody, [
      { text: COPY.confirmKeep, style: 'cancel' },
      { text: COPY.confirmDestroy, style: 'destructive', onPress: () => void destroy() },
    ])
  }, [destroy])

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

      <View style={styles.code}>
        <Text variant="caption" tone="body" align="center">
          {COPY.codeLabel}
        </Text>
        {code ? <CodeDisplay code={code} /> : null}
      </View>

      {formError ? (
        <Text variant="footnote" tone="error" align="center">
          {formError}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button label={COPY.shareAgain} onPress={onShare} disabled={!code} />
        <Button label={COPY.copy} onPress={onCopy} variant="outline" disabled={!code} />
        <Button label={COPY.cancel} onPress={onCancel} variant="link" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  code: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.md,
  },
}))
