import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type DividerProps = {
  /** When present, the rule splits either side of it. */
  label?: string
}

/**
 * A horizontal rule, optionally with a centred label.
 *
 * The rules are always flexible. M00-S02 drew them at a fixed 93.37pt each — a
 * width that only holds at exactly 390pt, leaving a gap or overlapping the label
 * at any other size. A test asserts the flex, so the fixed width cannot return.
 */
export function Divider({ label }: DividerProps) {
  if (!label) {
    return <View style={styles.rule} testID="divider-rule" />
  }

  return (
    <View style={styles.container}>
      <View style={styles.rule} testID="divider-rule" />
      <Text variant="caption" tone="body">
        {label}
      </Text>
      <View style={styles.rule} testID="divider-rule" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: theme.spacing.xxl,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.subtle,
  },
}))
