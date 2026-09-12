import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { LANGUAGE_NAMES, SETTINGS_LANGUAGE_COPY as COPY } from '@/copy/settingsLanguage'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import {
  usePreferencesStore,
  type Clock,
  type DateFormat,
  type LanguageCode,
  type WeekStart,
} from '@/state/preferencesStore'

const LANGUAGES = Object.keys(LANGUAGE_NAMES) as LanguageCode[]

const DATE_SEGMENTS: { value: DateFormat; label: string }[] = [
  { value: 'dmy', label: COPY.dmy },
  { value: 'mdy', label: COPY.mdy },
  { value: 'ymd', label: COPY.ymd },
]

const CLOCK_SEGMENTS: { value: Clock; label: string }[] = [
  { value: '12h', label: COPY.twelveHour },
  { value: '24h', label: COPY.twentyFourHour },
]

const WEEK_SEGMENTS: { value: WeekStart; label: string }[] = [
  { value: 'monday', label: COPY.monday },
  { value: 'sunday', label: COPY.sunday },
]

/**
 * M05-S15 — Settings → Language & Region.
 *
 * Language is a LIST, not a segmented control: five options do not fit across
 * 320pt, and the three-choice ceiling is written into `SettingsChoiceRow`'s own
 * comment. The chosen one carries a tick in its value slot — and announces the
 * word behind it (`valueLabel`), because the tick is the only confirmation the
 * tap registered and a bare '✓' is not something every screen reader speaks.
 *
 * NOTHING HERE PROMPTS A RESTART. A language change is the canonical reason an
 * app asks, and this app must not: settings do not persist, so a restart would
 * throw away every choice the user just made. See the spec, §2.
 */
export function LanguageScreen() {
  const router = useRouter()
  const language = usePreferencesStore((s) => s.language)
  const dateFormat = usePreferencesStore((s) => s.dateFormat)
  const clock = usePreferencesStore((s) => s.clock)
  const weekStart = usePreferencesStore((s) => s.weekStart)
  const setPreference = usePreferencesStore((s) => s.setPreference)

  const goBack = useCallback(() => router.back(), [router])
  const choose = useCallback(
    (code: LanguageCode) => () => setPreference('language', code),
    [setPreference],
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.languageGroup}>
        {LANGUAGES.map((code) => (
          <SettingsRow
            key={code}
            icon="globe"
            label={LANGUAGE_NAMES[code]}
            value={code === language ? COPY.chosen : undefined}
            valueLabel={COPY.chosenLabel}
            onPress={choose(code)}
          />
        ))}

        <Text variant="footnote" tone="body">
          {COPY.notTranslated}
        </Text>
      </SectionPanel>

      <SectionPanel title={COPY.dateGroup}>
        <SettingsChoiceRow
          label={COPY.dateFormatLabel}
          segments={DATE_SEGMENTS}
          value={dateFormat}
          onChange={(next) => setPreference('dateFormat', next)}
        />
        <SettingsChoiceRow
          label={COPY.clockLabel}
          segments={CLOCK_SEGMENTS}
          value={clock}
          onChange={(next) => setPreference('clock', next)}
        />
        <SettingsChoiceRow
          label={COPY.weekStartLabel}
          segments={WEEK_SEGMENTS}
          value={weekStart}
          onChange={(next) => setPreference('weekStart', next)}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
