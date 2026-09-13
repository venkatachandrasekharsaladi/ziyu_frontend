import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { SETTINGS_SECURITY_COPY as COPY } from '@/copy/settingsSecurity'
import { DangerRow } from '@/design-system/patterns/DangerRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { Text } from '@/design-system/primitives/Text'
import { MOCK_SESSIONS } from '@/modules/module-05-profile/data/mock'

/**
 * M05-S08 — Settings → Security & Sessions.
 *
 * The session list is local state seeded from `MOCK_SESSIONS`, so signing the
 * others out actually removes them from the list. A confirmation that leaves
 * the list unchanged teaches the user their action did nothing.
 *
 * Change password and two-factor are rows without destinations in this plan.
 * Both are auth operations, `services/auth` is a mock, and inventing a
 * password-change screen that changes nothing would be the one place in this
 * cluster where the UI lies about what happened.
 */
export function SecurityScreen() {
  const router = useRouter()
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [twoFactor, setTwoFactor] = useState(false)
  const [signedOutOthers, setSignedOutOthers] = useState(false)

  const goBack = useCallback(() => router.back(), [router])

  const signOutOthers = useCallback(() => {
    setSessions((current) => current.filter((session) => session.isCurrent))
    setSignedOutOthers(true)
  }, [])

  const hasOthers = sessions.some((session) => !session.isCurrent)

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.credentialsGroup}>
        <SettingsRow
          icon="key"
          label={COPY.changePassword}
          detail={COPY.changePasswordDetail}
        />
        <SettingsToggleRow
          icon="shield"
          label={COPY.twoFactor}
          detail={COPY.twoFactorDetail}
          value={twoFactor}
          onValueChange={setTwoFactor}
        />
      </SectionPanel>

      <SectionPanel title={COPY.sessionsGroup}>
        {sessions.map((session) => (
          <SettingsRow
            key={session.id}
            icon={session.isCurrent ? 'smartphone' : 'monitor'}
            label={session.device}
            detail={`${session.location} · ${COPY.lastActivePrefix} ${session.lastActive}`}
            value={session.isCurrent ? COPY.thisDevice : undefined}
          />
        ))}
      </SectionPanel>

      {hasOthers ? (
        <SectionPanel title={COPY.dangerGroup}>
          <DangerRow
            icon="log-out"
            label={COPY.signOutAll}
            detail={COPY.signOutAllDetail}
            confirmTitle={COPY.signOutAllTitle}
            confirmBody={COPY.signOutAllBody}
            cancelLabel={COPY.signOutAllCancel}
            confirmLabel={COPY.signOutAllConfirm}
            onConfirm={signOutOthers}
          />
        </SectionPanel>
      ) : null}

      {signedOutOthers ? (
        <Text variant="footnote" tone="success">
          {COPY.signedOutAll}
        </Text>
      ) : null}
    </SettingsScreenLayout>
  )
}
