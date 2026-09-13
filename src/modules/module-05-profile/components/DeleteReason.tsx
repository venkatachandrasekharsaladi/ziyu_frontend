import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_DELETE_COPY as COPY } from '@/copy/settingsDeleteAccount'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'

export type DeleteReasonKey = 'notUsing' | 'broke' | 'privacy' | 'breakup' | 'other'

type DeleteReasonProps = {
  onChoose: (reason: DeleteReasonKey) => void
  onSkip: () => void
}

const REASONS: { key: DeleteReasonKey; label: string }[] = [
  { key: 'notUsing', label: COPY.reasonNotUsing },
  { key: 'broke', label: COPY.reasonBroke },
  { key: 'privacy', label: COPY.reasonPrivacy },
  { key: 'breakup', label: COPY.reasonBreakup },
  { key: 'other', label: COPY.reasonOther },
]

/**
 * Why someone is leaving. Optional, and the screen says so.
 *
 * "We are no longer together" is on this list because it is the most likely
 * true answer in this particular product, and leaving it off would force
 * somebody at the worst moment of their year to file themselves under
 * "Another reason".
 *
 * Choosing a reason ADVANCES the flow — no separate Continue. A skippable
 * question with its own confirm button is two taps for something that changes
 * nothing.
 */
export function DeleteReason({ onChoose, onSkip }: DeleteReasonProps) {
  return (
    <>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.reasonHeading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.reasonLede}
        </Text>
      </View>

      <SectionPanel title={COPY.reasonHeading}>
        {REASONS.map((reason) => (
          <SettingsRow
            key={reason.key}
            icon="message-square"
            label={reason.label}
            onPress={() => onChoose(reason.key)}
          />
        ))}
      </SectionPanel>

      <Button label={COPY.reasonSkip} onPress={onSkip} variant="link" />
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
}))
