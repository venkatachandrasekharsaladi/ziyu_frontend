import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_ACCESSIBILITY_COPY as COPY } from '@/copy/settingsAccessibility'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SettingsToggleRow } from '@/design-system/patterns/SettingsToggleRow'
import { usePreferencesStore, type TextScale } from '@/state/preferencesStore'

const TEXT_SEGMENTS: { value: TextScale; label: string }[] = [
  { value: 'small', label: COPY.textSmall },
  { value: 'default', label: COPY.textDefault },
  { value: 'large', label: COPY.textLarge },
]

/**
 * M05-S09 — Settings → Accessibility.
 *
 * `reduceMotion` here is the app's OWN switch. It sits alongside, not instead
 * of, the device setting that `useEntrance` already honours through
 * `ReduceMotion.System` — someone may want the app still while the rest of the
 * phone moves.
 */
export function AccessibilityScreen() {
  const router = useRouter()
  const textScale = usePreferencesStore((state) => state.textScale)
  const reduceMotion = usePreferencesStore((state) => state.reduceMotion)
  const haptics = usePreferencesStore((state) => state.haptics)
  const highContrast = usePreferencesStore((state) => state.highContrast)
  const setPreference = usePreferencesStore((state) => state.setPreference)
  const toggle = usePreferencesStore((state) => state.toggle)

  const goBack = useCallback(() => router.back(), [router])
  const setTextScale = useCallback(
    (next: TextScale) => setPreference('textScale', next),
    [setPreference],
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.displayGroup}>
        <SettingsChoiceRow
          label={COPY.textSizeLabel}
          segments={TEXT_SEGMENTS}
          value={textScale}
          onChange={setTextScale}
        />

        <SettingsToggleRow
          icon="sun"
          label={COPY.highContrastLabel}
          detail={COPY.highContrastDetail}
          value={highContrast}
          onValueChange={() => toggle('highContrast')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.motionGroup}>
        <SettingsToggleRow
          icon="wind"
          label={COPY.reduceMotionLabel}
          detail={COPY.reduceMotionDetail}
          value={reduceMotion}
          onValueChange={() => toggle('reduceMotion')}
        />

        <SettingsToggleRow
          icon="smartphone"
          label={COPY.hapticsLabel}
          detail={COPY.hapticsDetail}
          value={haptics}
          onValueChange={() => toggle('haptics')}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
