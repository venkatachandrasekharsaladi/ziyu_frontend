import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { SETTINGS_BILLING_COPY as COPY } from '@/copy/settingsBilling'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { PlanCard } from '@/modules/module-05-profile/components/PlanCard'
import { MOCK_INVOICES, MOCK_PLAN, MOCK_PREMIUM } from '@/modules/module-05-profile/data/mock'

/**
 * M05-S17 — Settings → Billing & Subscription.
 *
 * There is no paid tier and no payment integration. Every element on this
 * screen is built so that is visible rather than hidden: the preview note, the
 * disabled upgrade control, the empty-invoice sentence, and a Restore that
 * says there is nothing to restore instead of spinning and claiming success.
 */
export function BillingScreen() {
  const router = useRouter()
  const [didRestore, setDidRestore] = useState(false)

  const goBack = useCallback(() => router.back(), [router])
  const restore = useCallback(() => setDidRestore(true), [])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.currentGroup}>
        <PlanCard
          plan={MOCK_PLAN}
          currentLabel={COPY.currentLabel}
          freeLabel={COPY.freeForever}
          periodLabel={COPY.perYear}
          upgradeLabel={COPY.upgrade}
        />
      </SectionPanel>

      <SectionPanel title={COPY.previewGroup}>
        <Text variant="footnote" tone="body">
          {COPY.previewNote}
        </Text>

        <PlanCard
          plan={MOCK_PREMIUM}
          currentLabel={COPY.currentLabel}
          freeLabel={COPY.free}
          periodLabel={COPY.perYear}
          upgradeLabel={COPY.upgrade}
        />
      </SectionPanel>

      <SectionPanel title={COPY.paymentGroup}>
        <SettingsRow icon="credit-card" label={COPY.paymentMethod} value={COPY.paymentNone} />
        <SettingsRow icon="refresh-cw" label={COPY.restore} onPress={restore} />

        {didRestore ? (
          <Text variant="footnote" tone="body">
            {COPY.restoreNothing}
          </Text>
        ) : null}
      </SectionPanel>

      <SectionPanel title={COPY.invoicesGroup}>
        {MOCK_INVOICES.length === 0 ? (
          <Text variant="footnote" tone="body">
            {COPY.invoicesEmpty}
          </Text>
        ) : (
          MOCK_INVOICES.map((invoice) => (
            <SettingsRow key={invoice.id} icon="file-text" label={invoice.date} />
          ))
        )}
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
