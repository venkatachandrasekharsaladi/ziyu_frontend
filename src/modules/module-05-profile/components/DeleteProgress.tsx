import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SETTINGS_DELETE_COPY as COPY } from '@/copy/settingsDeleteAccount'
import { Text } from '@/design-system/primitives/Text'

type DeleteProgressProps = {
  /** 1-based. */
  step: number
  total: number
}

/**
 * Where you are in the deletion flow.
 *
 * The count is announced as text, not only drawn as pips. Somebody deciding
 * whether to keep going needs to know how much of this is left, and a row of
 * dots does not answer that for a screen reader.
 */
export function DeleteProgress({ step, total }: DeleteProgressProps) {
  return (
    <View style={styles.row}>
      <Text variant="caption" tone="body">
        {`${COPY.stepPrefix} ${step} ${COPY.stepOf} ${total}`}
      </Text>

      <View style={styles.pips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: total }, (_, index) => (
          <View key={index} style={[styles.pip, index < step && styles.pipDone]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.spacing.sm,
  },
  pips: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  pip: {
    flex: 1,
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border.subtle,
  },
  pipDone: {
    backgroundColor: theme.colors.feedback.error,
  },
}))
