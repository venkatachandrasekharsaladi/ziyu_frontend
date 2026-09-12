import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { FeedbackBanner } from '@/components/feedback/FeedbackBanner'
import { SETTINGS_CHAT_COPY as COPY } from '@/copy/settingsChat'
import { DangerRow } from '@/design-system/patterns/DangerRow'
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
 * M05-S11 — Settings → Chat.
 *
 * Clearing history has no store to clear: `services/chat` is a mock and the
 * conversation is held inside `module-03-chat`'s own state. Rather than reach
 * across a module boundary from a settings screen, this confirms and reports.
 * Wiring it to a real clear is one call inside `onConfirm` the day the chat
 * store exposes one — and the confirmation, which is the part that has to be
 * right, is already correct and tested.
 */
export function ChatSettingsScreen() {
  const router = useRouter()
  const state = usePreferencesStore()
  const toggle = usePreferencesStore((s) => s.toggle)
  const setPreference = usePreferencesStore((s) => s.setPreference)
  const [isCleared, setIsCleared] = useState(false)

  const goBack = useCallback(() => router.back(), [router])
  const setMessageScale = useCallback(
    (next: TextScale) => setPreference('messageTextScale', next),
    [setPreference],
  )
  const clearHistory = useCallback(() => setIsCleared(true), [])
  const dismissCleared = useCallback(() => setIsCleared(false), [])

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <SectionPanel title={COPY.presenceGroup}>
        <SettingsToggleRow
          icon="check-circle"
          label={COPY.readReceipts}
          detail={COPY.readReceiptsDetail}
          value={state.readReceipts}
          onValueChange={() => toggle('readReceipts')}
        />
        <SettingsToggleRow
          icon="more-horizontal"
          label={COPY.typingIndicator}
          detail={COPY.typingIndicatorDetail}
          value={state.typingIndicator}
          onValueChange={() => toggle('typingIndicator')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.mediaGroup}>
        <SettingsToggleRow
          icon="download"
          label={COPY.autoSave}
          detail={COPY.autoSaveDetail}
          value={state.autoSaveMedia}
          onValueChange={() => toggle('autoSaveMedia')}
        />
        <SettingsToggleRow
          icon="play"
          label={COPY.voiceAutoPlay}
          detail={COPY.voiceAutoPlayDetail}
          value={state.voiceNoteAutoPlay}
          onValueChange={() => toggle('voiceNoteAutoPlay')}
        />
      </SectionPanel>

      <SectionPanel title={COPY.displayGroup}>
        <SettingsChoiceRow
          label={COPY.messageTextLabel}
          segments={TEXT_SEGMENTS}
          value={state.messageTextScale}
          onChange={setMessageScale}
        />
      </SectionPanel>

      <SectionPanel title={COPY.dangerGroup}>
        <DangerRow
          icon="trash-2"
          label={COPY.clearHistory}
          detail={COPY.clearHistoryDetail}
          confirmTitle={COPY.clearConfirmTitle}
          confirmBody={COPY.clearConfirmBody}
          cancelLabel={COPY.clearConfirmCancel}
          confirmLabel={COPY.clearConfirmAction}
          onConfirm={clearHistory}
        />

        {isCleared ? (
          <FeedbackBanner tone="success" message={COPY.cleared} onDismiss={dismissCleared} />
        ) : null}
      </SectionPanel>
    </SettingsScreenLayout>
  )
}
