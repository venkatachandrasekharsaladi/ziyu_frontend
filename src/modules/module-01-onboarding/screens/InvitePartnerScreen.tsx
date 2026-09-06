import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Share, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { INVITE_PARTNER_COPY as COPY } from '@/copy/invitePartner'
import { Button } from '@/design-system/primitives/Button'
import { CodeDisplay } from '@/design-system/primitives/CodeDisplay'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M01-S03 — Invite Your Partner. Figma 522:422.
 *
 * The code is issued on mount rather than behind a button: the screen has
 * nothing to show without one, so a user would only ever press it.
 *
 * Both actions advance to M01-S05, which shows the same code — sharing does not
 * consume it, and someone who shares still needs somewhere to wait.
 */
export function InvitePartnerScreen() {
  const router = useRouter()
  const back = useBackTo('/(onboarding)/setup')
  const code = useRelationshipStore((state) => state.code)
  const setInvite = useRelationshipStore((state) => state.setInvite)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function issue() {
      const result = await pairingService.createInvite()

      if (cancelled) return

      if (!result.ok) {
        setFormError(COPY.errors[result.error.code])
        return
      }

      setInvite(result.value.code)
    }

    void issue()

    // The screen can unmount mid-request; setting state afterwards would warn
    // and, worse, resurrect an invite the user already navigated away from.
    return () => {
      cancelled = true
    }
  }, [setInvite])

  const onShare = useCallback(async () => {
    if (!code) return

    await Share.share({ message: COPY.shareMessage(code) })
    router.push('/(onboarding)/invitation-sent')
  }, [code, router])

  // expo-clipboard is not installed and is not in this cluster's scope, so the
  // copy action advances without actually writing to the clipboard. Logged as
  // an open item rather than quietly adding a dependency mid-cluster.
  const onCopy = useCallback(() => {
    router.push('/(onboarding)/invitation-sent')
  }, [router])

  return (
    <AuthScreenLayout onBack={back} centred>
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
        <Button label={COPY.share} onPress={onShare} disabled={!code} />
        <Button label={COPY.copy} onPress={onCopy} variant="outline" disabled={!code} />
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
