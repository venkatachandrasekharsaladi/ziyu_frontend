import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { SETTINGS_VERIFY_PHONE_COPY as COPY } from '@/copy/settingsVerifyPhone'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { CodeGate } from '@/modules/module-05-profile/components/CodeGate'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M05-S03 — Settings → Verify Phone.
 *
 * Reached from Personal Details, and reused by the delete flow's phone gate in
 * spirit — the shared part is `CodeGate`, not this screen.
 *
 * With no number on file this screen has nothing to verify, so it says so and
 * offers the way back rather than rendering an empty field somebody can type
 * six digits into for no reason.
 */
export function VerifyPhoneScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const setProfile = useRelationshipStore((state) => state.setProfile)
  const [isVerified, setIsVerified] = useState(Boolean(profile?.phoneVerified))

  const goBack = useCallback(() => router.back(), [router])
  const goToDetails = useCallback(
    () => router.push('/(app)/settings/personal-details'),
    [router],
  )

  const onVerified = useCallback(() => {
    if (!profile) return

    setProfile({ ...profile, phoneVerified: true })
    setIsVerified(true)
  }, [profile, setProfile])

  if (!profile?.phone) {
    return (
      <SettingsScreenLayout title={COPY.title} onBack={goBack}>
        <SectionPanel title={COPY.title}>
          <Text variant="body" tone="body">
            {COPY.noNumber}
          </Text>

          <SettingsRow icon="user" label={COPY.goToDetails} onPress={goToDetails} />
        </SectionPanel>
      </SettingsScreenLayout>
    )
  }

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      {isVerified ? (
        <Text variant="body" tone="success">
          {COPY.verified}
        </Text>
      ) : (
        <CodeGate
          label={COPY.codeLabel}
          sentTo={`${COPY.sentToPrefix} ${profile.phone}`}
          submitLabel={COPY.submit}
          resendLabel={COPY.resend}
          resendPendingLabel={(seconds) => `${COPY.resendIn} ${seconds}s`}
          errorMessage={COPY.wrongCode}
          onVerified={onVerified}
        />
      )}
    </SettingsScreenLayout>
  )
}
