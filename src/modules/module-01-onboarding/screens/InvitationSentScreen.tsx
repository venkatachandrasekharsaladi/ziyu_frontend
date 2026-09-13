import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Platform, Share, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { FeedbackBanner } from '@/components/feedback/FeedbackBanner'
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
 * The confirmation is `ConfirmDialog`, not `Alert.alert` — `Alert` has no
 * implementation in react-native-web, so on web the confirmation would never
 * have appeared and Cancel Invitation would have been unreachable, same bug
 * as the sign-out on `SettingsHomeScreen`. See `ConfirmDialog`'s own header
 * comment.
 */
export function InvitationSentScreen() {
  const router = useRouter()
  const back = useBackTo('/(onboarding)/setup')
  const code = useRelationshipStore((state) => state.code)
  const reset = useRelationshipStore((state) => state.reset)
  const [formError, setFormError] = useState<string | null>(null)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)

  /**
   * Screen-local, not the store's — same reasoning as `ConversationScreen`'s
   * Save Memory banner. `key` is bumped per attempt so pressing Share Again
   * twice remounts the banner with a fresh identity instead of the second
   * result being silently absorbed by an instance that already announced and
   * started dismissing.
   */
  const [feedback, setFeedback] = useState<{ key: number; message: string } | null>(null)

  const onShare = useCallback(async () => {
    if (!code) return
    const message = COPY.shareMessage(code)

    if (Platform.OS !== 'web') {
      await Share.share({ message })
      return
    }

    // `Share.share` is native-only — react-native-web ships no
    // implementation, so calling it here on web either throws or resolves
    // having done nothing (there is no OS share sheet inside a browser tab).
    // The Web Share API is the real web equivalent, and where a browser has
    // it (most mobile browsers), it is used exactly like the native call.
    // Read into a local once, rather than re-checking `typeof navigator` at
    // each branch below: this is the one non-obvious environment fact (a
    // React Native module has no `navigator` global at all) worth naming
    // once, instead of three times.
    const nav = typeof navigator === 'undefined' ? undefined : navigator

    if (nav?.share) {
      try {
        await nav.share({ text: message })
      } catch {
        // Includes the user simply dismissing the browser's own share sheet
        // (an `AbortError`) — not a failure worth reporting back.
      }
      return
    }

    // No Web Share API either (most desktop browsers). The next best thing to
    // a share sheet neither this platform nor this browser has is putting the
    // invite text where the person can paste it themselves, and saying so —
    // rather than the button silently doing nothing at all.
    if (nav?.clipboard) {
      await nav.clipboard.writeText(message)
      setFeedback({ key: Date.now(), message: COPY.shareCopied })
    }
  }, [code])

  // Real "Copy" needs `expo-clipboard`, which is not installed (checked —
  // nothing matching "clipboard" in package.json), same gap
  // `MessageContextMenu`'s Copy row has in Chat. Rather than a no-op that
  // still looks pressable, the button below carries `disabled` permanently
  // (not merely `!code`) so this reads as genuinely unavailable, not broken.
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

  const askToCancel = useCallback(() => setIsConfirmingCancel(true), [])
  const keepInvitation = useCallback(() => setIsConfirmingCancel(false), [])
  const confirmCancel = useCallback(() => {
    setIsConfirmingCancel(false)
    void destroy()
  }, [destroy])

  return (
    <AuthScreenLayout onBack={back} centred>
      {/* Rendered in normal flow, same call `ConversationScreen` makes for its
          own Save Memory banner: this is transient enough that it does not
          need its own floating layer, and nudging the content below it down
          for three seconds is the simplest option. */}
      {feedback ? (
        <FeedbackBanner
          key={feedback.key}
          tone="success"
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

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
        <Button label={COPY.copy} onPress={onCopy} variant="outline" disabled />
        <Button label={COPY.cancel} onPress={askToCancel} variant="link" />
      </View>

      <ConfirmDialog
        visible={isConfirmingCancel}
        title={COPY.confirmTitle}
        body={COPY.confirmBody}
        cancelLabel={COPY.confirmKeep}
        confirmLabel={COPY.confirmDestroy}
        onCancel={keepInvitation}
        onConfirm={confirmCancel}
      />
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
