import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { LegalDocument } from '@/modules/module-05-profile/components/LegalDocument'
import { LEGAL_PRIVACY } from '@/modules/module-05-profile/data/legal'

/** M05-S21 — Settings → Privacy Policy. */
export function PrivacyPolicyScreen() {
  const router = useRouter()
  const goBack = useCallback(() => router.back(), [router])

  return (
    <SettingsScreenLayout title={LEGAL_PRIVACY.title} onBack={goBack}>
      <LegalDocument document={LEGAL_PRIVACY} />
    </SettingsScreenLayout>
  )
}
