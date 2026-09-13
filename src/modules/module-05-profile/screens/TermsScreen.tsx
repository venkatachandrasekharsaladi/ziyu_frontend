import { useRouter } from 'expo-router'
import { useCallback } from 'react'

import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { LegalDocument } from '@/modules/module-05-profile/components/LegalDocument'
import { LEGAL_TERMS } from '@/modules/module-05-profile/data/legal'

/** M05-S20 — Settings → Terms & Conditions. */
export function TermsScreen() {
  const router = useRouter()
  const goBack = useCallback(() => router.back(), [router])

  return (
    <SettingsScreenLayout title={LEGAL_TERMS.title} onBack={goBack}>
      <LegalDocument document={LEGAL_TERMS} />
    </SettingsScreenLayout>
  )
}
