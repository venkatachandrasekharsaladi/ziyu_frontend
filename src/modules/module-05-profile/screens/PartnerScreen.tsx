import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_PARTNER_COPY as COPY } from '@/copy/settingsPartner'
import { DangerRow } from '@/design-system/patterns/DangerRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Avatar } from '@/design-system/primitives/Avatar'
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
 */
export function PartnerScreen() {
  const router = useRouter()
  const partner = useRelationshipStore((state) => state.partner)
  const code = useRelationshipStore((state) => state.code)
  const reset = useRelationshipStore((state) => state.reset)

  const goBack = useCallback(() => router.back(), [router])
  const invite = useCallback(() => router.push('/(onboarding)/invite'), [router])

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
}))
