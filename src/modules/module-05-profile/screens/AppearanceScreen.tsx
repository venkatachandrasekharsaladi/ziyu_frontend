import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_APPEARANCE_COPY as COPY } from '@/copy/settingsAppearance'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsChoiceRow } from '@/design-system/patterns/SettingsChoiceRow'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import type { ThemeChoice } from '@/design-system/themes/themeChoiceStore'
import { useThemeMode } from '@/design-system/themes/useThemeMode'
import { useSpaceStore } from '@/state/spaceStore'

const COVER_LABEL: Record<'dawn' | 'dusk' | 'night', string> = {
  dawn: 'Dawn',
  dusk: 'Dusk',
  night: 'Night',
}

/**
 * M05-S07 — Settings → Appearance.
 *
 * Text size and reduce motion are NOT here; they are on Accessibility, which
 * is where someone looks for them and where they sit beside haptics and
 * contrast. This screen is only about how the app looks by choice, not about
 * making it usable.
 *
 * `choice` and `setChoice` come only from `useThemeMode` — the theme layer
 * owns the choice (`themeChoiceStore`), and this screen has no reason to
 * import that store directly when the hook already hands over what it needs.
 */
export function AppearanceScreen() {
  const router = useRouter()
  const { choice, setChoice } = useThemeMode()
  const coverStyle = useSpaceStore((state) => state.coverStyle)

  const goToSpace = useCallback(() => router.push('/(app)/settings/our-space'), [router])
  const goBack = useCallback(() => router.back(), [router])

  const segments: { value: ThemeChoice; label: string }[] = [
    { value: 'light', label: COPY.light },
    { value: 'dark', label: COPY.dark },
    { value: 'auto', label: COPY.auto },
  ]

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.themeLabel}>
        <SettingsChoiceRow
          label={COPY.themeLabel}
          detail={COPY.themeDetail}
          segments={segments}
          value={choice}
          onChange={setChoice}
        />
      </SectionPanel>

      <SectionPanel title={COPY.coverLabel}>
        <SettingsRow
          icon="image"
          label={COPY.coverAction}
          detail={COPY.coverDetail}
          value={COVER_LABEL[coverStyle]}
          onPress={goToSpace}
        />
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
