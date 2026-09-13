import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SETTINGS_DELETE_COPY as COPY } from '@/copy/settingsDeleteAccount'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'

type DeleteWarningProps = {
  onContinue: () => void
  onExport: () => void
}

const ERASED = [
  COPY.goesMemories,
  COPY.goesChat,
  COPY.goesSpace,
  COPY.goesDates,
  COPY.goesAccount,
]

/**
 * The first step: what actually happens.
 *
 * Continue is `outline`, not `primary`. The primary weight on this screen
 * belongs to nothing — there is no action here anybody should be nudged
 * towards, and a filled brand button under a list of everything you are about
 * to lose is the interface arguing for one answer.
 */
export function DeleteWarning({ onContinue, onExport }: DeleteWarningProps) {
  const { theme } = useUnistyles()

  return (
    <>
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.warningHeading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.warningLede}
        </Text>
      </View>

      <SectionPanel title={COPY.goesGroup}>
        {ERASED.map((line) => (
          <View key={line} style={styles.line}>
            <Feather name="x" size={16} color={theme.colors.feedback.error} />

            <Text variant="footnote" tone="body">
              {line}
            </Text>
          </View>
        ))}
      </SectionPanel>

      <SectionPanel title={COPY.partnerGroup}>
        <Text variant="body" tone="body">
          {COPY.partnerLine}
        </Text>
      </SectionPanel>

      <SectionPanel title={COPY.exportGroup}>
        <SettingsRow
          icon="download"
          label={COPY.exportAction}
          detail={COPY.exportDetail}
          onPress={onExport}
        />
      </SectionPanel>

      <Button label={COPY.continue} onPress={onContinue} variant="outline" />
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
}))
