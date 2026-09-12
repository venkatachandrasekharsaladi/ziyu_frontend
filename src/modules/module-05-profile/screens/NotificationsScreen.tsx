import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_NOTIFICATIONS_COPY as COPY } from '@/copy/settingsNotifications'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { usePreferencesStore } from '@/state/preferencesStore'

/**
 * M05-S10 — Settings → Notifications.
 *
 * The master switch DISABLES the categories, it does not hide them. A list
 * that changes length under the finger moves the next row into the place the
 * thumb is already travelling to, and the categories are also the answer to
 * "what would I get if I turned this back on" — which is worth being able to
 * read while it is off.
 */
export function NotificationsScreen() {
  const router = useRouter()
  const state = usePreferencesStore()
  const toggle = usePreferencesStore((s) => s.toggle)

  const goBack = useCallback(() => router.back(), [router])
  const off = !state.notificationsEnabled

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.masterGroup}>
        <SettingsToggleRow
          icon="bell"
          label={COPY.masterLabel}
          detail={COPY.masterDetail}
          value={state.notificationsEnabled}
          onValueChange={() => toggle('notificationsEnabled')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.categoryGroup}>
        <SettingsToggleRow
          icon="message-circle"
          label={COPY.messages}
          detail={COPY.messagesDetail}
          value={state.notifyMessages}
          onValueChange={() => toggle('notifyMessages')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="mic"
          label={COPY.voiceNotes}
          detail={COPY.voiceNotesDetail}
          value={state.notifyVoiceNotes}
          onValueChange={() => toggle('notifyVoiceNotes')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="image"
          label={COPY.newMemories}
          detail={COPY.newMemoriesDetail}
          value={state.notifyNewMemories}
          onValueChange={() => toggle('notifyNewMemories')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="sunrise"
          label={COPY.onThisDay}
          detail={COPY.onThisDayDetail}
          value={state.notifyOnThisDay}
          onValueChange={() => toggle('notifyOnThisDay')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="calendar"
          label={COPY.occasions}
          detail={COPY.occasionsDetail}
          value={state.notifyOccasions}
          onValueChange={() => toggle('notifyOccasions')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="activity"
          label={COPY.partnerActivity}
          detail={COPY.partnerActivityDetail}
          value={state.notifyPartnerActivity}
          onValueChange={() => toggle('notifyPartnerActivity')}
          disabled={off}
        />
      </SectionPanel>

      <SectionPanel title={COPY.quietGroup}>
        <SettingsToggleRow
          icon="moon"
          label={COPY.quietLabel}
          detail={COPY.quietDetail}
          value={state.quietHoursEnabled}
          onValueChange={() => toggle('quietHoursEnabled')}
          disabled={off}
        />

        {/*
          The two times appear only when quiet hours are on. This is the one
          place in the cluster where a row is hidden rather than disabled, and
          the reason is the opposite of the master switch above: "from 22:00
          until 07:00" is meaningless while the feature is off, where "Messages,
          on" still tells you something.
        */}
        {state.quietHoursEnabled ? (
          <>
            <SettingsRow icon="sunset" label={COPY.quietFrom} value={state.quietHoursFrom} />
            <SettingsRow icon="sunrise" label={COPY.quietTo} value={state.quietHoursTo} />
          </>
        ) : null}
      </SectionPanel>

      <SectionPanel title={COPY.soundGroup}>
        <SettingsToggleRow
          icon="volume-2"
          label={COPY.sound}
          value={state.notificationSound}
          onValueChange={() => toggle('notificationSound')}
          disabled={off}
        />
        <SettingsToggleRow
          icon="smartphone"
          label={COPY.vibration}
          value={state.notificationVibration}
          onValueChange={() => toggle('notificationVibration')}
          disabled={off}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
