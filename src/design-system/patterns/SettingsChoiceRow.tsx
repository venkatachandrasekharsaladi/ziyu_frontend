import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SegmentedControl, type Segment } from '@/design-system/primitives/SegmentedControl'
import { Text } from '@/design-system/primitives/Text'

type SettingsChoiceRowProps<T extends string> = {
  label: string
  detail?: string
  segments: Segment<T>[]
  value: T
  onChange: (next: T) => void
}

/**
 * A settings row whose answer is one of two or three.
 *
 * `SegmentedControl` already draws the control and already carries
 * `accessibilityState.selected` on each segment; this adds the card surface
 * and the optional explanatory line so it sits in a `SectionPanel` next to
 * `SettingsRow` and `SettingsToggleRow` without looking like a different kind
 * of object.
 *
 * Three is the ceiling. A fourth choice does not fit at 320pt and belongs on a
 * pushed screen of `SettingsRow`s with a tick — Language does exactly that.
 */
export function SettingsChoiceRow<T extends string>({
  label,
  detail,
  segments,
  value,
  onChange,
}: SettingsChoiceRowProps<T>) {
  return (
    <View style={styles.row}>
      <SegmentedControl label={label} segments={segments} value={value} onChange={onChange} />

      {detail ? (
        <Text variant="footnote" tone="body">
          {detail}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
  },
}))
