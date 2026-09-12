import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_DATES_COPY as COPY } from '@/copy/settingsDates'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { usePreferencesStore, type ReminderLead } from '@/state/preferencesStore'

const LEAD_SEGMENTS: { value: ReminderLead; label: string }[] = [
  { value: 'sameDay', label: COPY.sameDay },
  { value: 'dayBefore', label: COPY.dayBefore },
  { value: 'weekBefore', label: COPY.weekBefore },
]

/**
 * M05-S13 — Settings → Dates & Reminders.
 *
 * Managing the dates themselves is NOT here — it is the calendar's job, and
 * this row navigates there rather than growing a second editor for the same
 * data. This screen answers only "how much warning", which the calendar does
 * not ask.
 */
export function DatesSettingsScreen() {
  const router = useRouter()
  const anniversaryLead = usePreferencesStore((s) => s.anniversaryLead)
  const birthdayLead = usePreferencesStore((s) => s.birthdayLead)
  const occasionLead = usePreferencesStore((s) => s.occasionLead)
  const setPreference = usePreferencesStore((s) => s.setPreference)

  const goBack = useCallback(() => router.back(), [router])
  const goToCalendar = useCallback(() => router.push('/(app)/calendar'), [router])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.leadGroup}>
        <SettingsChoiceRow
          label={COPY.anniversary}
          segments={LEAD_SEGMENTS}
          value={anniversaryLead}
          onChange={(next) => setPreference('anniversaryLead', next)}
        />

        <SettingsChoiceRow
          label={COPY.birthday}
          segments={LEAD_SEGMENTS}
          value={birthdayLead}
          onChange={(next) => setPreference('birthdayLead', next)}
        />

        <SettingsChoiceRow
          label={COPY.occasion}
          segments={LEAD_SEGMENTS}
          value={occasionLead}
          onChange={(next) => setPreference('occasionLead', next)}
        />
      </SectionPanel>

      <SectionPanel title={COPY.datesGroup}>
        <SettingsRow
          icon="calendar"
          label={COPY.manageDates}
          detail={COPY.manageDatesDetail}
          onPress={goToCalendar}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
