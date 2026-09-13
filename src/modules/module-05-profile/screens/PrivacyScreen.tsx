import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_PRIVACY_COPY as COPY } from '@/copy/settingsPrivacy'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { usePreferencesStore } from '@/state/preferencesStore'

/**
 * M05-S06 — Settings → Privacy & Security.
 *
 * Screenshot alerts default OFF. Telling someone's partner that they took a
 * screenshot is surveillance the moment it is on by default; as a choice
 * somebody made, it is a promise between two people. The difference is entirely
 * in who decided.
 */
export function PrivacyScreen() {
  const router = useRouter()
  const state = usePreferencesStore()
  const toggle = usePreferencesStore((s) => s.toggle)

  const goBack = useCallback(() => router.back(), [router])
  const goToSessions = useCallback(() => router.push('/(app)/settings/security'), [router])
  const goToData = useCallback(() => router.push('/(app)/settings/data'), [router])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.deviceGroup}>
        <SettingsToggleRow
          icon="lock"
          label={COPY.appLock}
          detail={COPY.appLockDetail}
          value={state.appLock}
          onValueChange={() => toggle('appLock')}
        />
        <SettingsToggleRow
          icon="eye-off"
          label={COPY.hidePreviews}
          detail={COPY.hidePreviewsDetail}
          value={state.hideNotificationContent}
          onValueChange={() => toggle('hideNotificationContent')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.partnerGroup}>
        <SettingsToggleRow
          icon="radio"
          label={COPY.onlineStatus}
          detail={COPY.onlineStatusDetail}
          value={state.showOnlineStatus}
          onValueChange={() => toggle('showOnlineStatus')}
        />
        <SettingsToggleRow
          icon="camera"
          label={COPY.screenshotAlerts}
          detail={COPY.screenshotAlertsDetail}
          value={state.screenshotAlerts}
          onValueChange={() => toggle('screenshotAlerts')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.moreGroup}>
        <SettingsRow
          icon="shield"
          label={COPY.sessions}
          detail={COPY.sessionsDetail}
          onPress={goToSessions}
        />
        <SettingsRow
          icon="database"
          label={COPY.data}
          detail={COPY.dataDetail}
          onPress={goToData}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
