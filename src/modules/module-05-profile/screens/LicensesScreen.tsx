import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SETTINGS_LEGAL_COPY as COPY } from '@/copy/settingsLegal'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { LICENSES } from '@/modules/module-05-profile/data/legal'

/**
 * M05-S22 — Settings → Licenses.
 *
 * No placeholder banner: unlike the two documents, these licences are real
 * facts about real packages. The list is hand-maintained — see the note in
 * `data/legal.ts`.
 */
export function LicensesScreen() {
  const router = useRouter()
  const goBack = useCallback(() => router.back(), [router])

  return (
    <SettingsScreenLayout title={COPY.licensesTitle} lede={COPY.licensesLede} onBack={goBack}>
      <SectionPanel title={COPY.licensesTitle}>
        {LICENSES.map((entry) => (
          <SettingsRow
            key={entry.name}
            icon="package"
            label={entry.name}
            detail={`v${entry.version}`}
            value={entry.license}
          />
        ))}
      </SectionPanel>

      <Text variant="footnote" tone="body">
        {COPY.licensesThanks}
      </Text>
    </SettingsScreenLayout>
  )
}
