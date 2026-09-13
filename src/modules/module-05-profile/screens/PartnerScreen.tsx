import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Platform, Share, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { INVITE_PARTNER_COPY } from '@/copy/invitePartner'
import { SETTINGS_PARTNER_COPY as COPY } from '@/copy/settingsPartner'
import { DangerRow } from '@/design-system/patterns/DangerRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Button } from '@/design-system/primitives/Button'
import { CodeDisplay } from '@/design-system/primitives/CodeDisplay'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M05-S04 — Settings → Partner & Pairing.
 *
 * UNLINK IS NOT OFFERED WHEN THERE IS NO PARTNER. A destructive control for a
 * relationship that does not exist is the "honestly unavailable" rule broken in
 * the worst place — it would ask someone to confirm ending something they never
 * started.
 *
 * Unlinking calls `reset()` on the relationship store, which is the same clear
 * sign-out performs. It does NOT navigate: you stay in settings, and the screen
 * re-renders into its unpaired state, which is the honest picture of what just
 * happened.
 *
 * SHARE AND COPY ARE M01-S05's, not new ones. The share text is
 * `INVITE_PARTNER_COPY.shareMessage` rather than a second wording of the same
 * sentence, and the platform ladder below — native share sheet, then the Web
 * Share API, then the clipboard with a line saying so — is the one
 * `InvitationSentScreen` already walks. Two invite screens that word the invite
 * differently is the drift this import exists to prevent.
 *
 * COPY IS DISABLED WHERE THERE IS NO CLIPBOARD. `expo-clipboard` is not
 * installed, so on a device the button has nothing to write to; it renders
 * disabled with a line saying why, rather than looking pressable and doing
 * nothing. On web `navigator.clipboard` is real and the button works.
 */
export function PartnerScreen() {
  const router = useRouter()
  const partner = useRelationshipStore((state) => state.partner)
  const code = useRelationshipStore((state) => state.code)
  const reset = useRelationshipStore((state) => state.reset)

  const goBack = useCallback(() => router.back(), [router])
  const invite = useCallback(() => router.push('/(onboarding)/invite'), [router])

  const [notice, setNotice] = useState<string | null>(null)

  // Read once. A React Native runtime has no `navigator` global at all, so
  // every use has to be guarded; naming the fact here keeps the guard from
  // being repeated at each branch.
  const nav = typeof navigator === 'undefined' ? undefined : navigator
  const canCopy = Boolean(nav?.clipboard)

  const onShare = useCallback(async () => {
    if (!code) return

    const message = INVITE_PARTNER_COPY.shareMessage(code)

    if (Platform.OS !== 'web') {
      await Share.share({ message })
      return
    }

    if (nav?.share) {
      try {
        await nav.share({ text: message })
      } catch {
        // Includes the person simply dismissing the browser's share sheet
        // (an `AbortError`) — not a failure worth reporting back.
      }
      return
    }

    if (nav?.clipboard) {
      await nav.clipboard.writeText(message)
      setNotice(COPY.shareCopied)
    }
  }, [code, nav])

  const onCopy = useCallback(async () => {
    if (!code || !nav?.clipboard) return

    await nav.clipboard.writeText(code)
    setNotice(COPY.copied)
  }, [code, nav])

  const share = useCallback(() => void onShare(), [onShare])
  const copy = useCallback(() => void onCopy(), [onCopy])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.partnerGroup}>
        {partner ? (
          <View style={styles.partner}>
            <Avatar name={partner.name} uri={partner.photoUri} size={56} ring />

            <Text variant="h3" tone="heading">
              {partner.name}
            </Text>
          </View>
        ) : (
          <>
            <Text variant="body" tone="body">
              {COPY.noPartner}
            </Text>

            <SettingsRow icon="user-plus" label={COPY.invitePartner} onPress={invite} />
          </>
        )}
      </SectionPanel>

      {code ? (
        <SectionPanel title={COPY.codeGroup}>
          <CodeDisplay code={code} />

          <Text variant="footnote" tone="body">
            {COPY.codeHint}
          </Text>

          <View style={styles.actions}>
            <Button label={COPY.shareCode} onPress={share} />
            <Button
              label={COPY.copyCode}
              onPress={copy}
              variant="outline"
              disabled={!canCopy}
            />
          </View>

          {!canCopy ? (
            <Text variant="footnote" tone="body">
              {COPY.copyUnavailable}
            </Text>
          ) : null}

          {notice ? (
            <Text variant="footnote" tone="success">
              {notice}
            </Text>
          ) : null}
        </SectionPanel>
      ) : null}

      {partner ? (
        <SectionPanel title={COPY.dangerGroup}>
          <DangerRow
            icon="user-minus"
            label={COPY.unlink}
            detail={COPY.unlinkDetail}
            confirmTitle={COPY.unlinkTitle}
            confirmBody={COPY.unlinkBody}
            cancelLabel={COPY.unlinkCancel}
            confirmLabel={COPY.unlinkConfirm}
            onConfirm={reset}
          />
        </SectionPanel>
      ) : null}
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  partner: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.sm,
  },
}))
