import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { rowShell } from '@/design-system/patterns/settingsRowShell'
import { SegmentedControl, type Segment } from '@/design-system/primitives/SegmentedControl'
import { Text } from '@/design-system/primitives/Text'

type SettingsChoiceRowProps<T extends string> = {
  /**
   * Optional, unlike the sibling rows — a choice row is not always about a
   * thing with an icon. The well is RESERVED either way (see `head` below), so
   * a row without one still lines its label up with the rows around it.
   */
  icon?: FeatherName
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
 * `accessibilityState.selected` on each segment; this adds the card surface,
 * the label and the optional explanatory line so it sits in a `SectionPanel`
 * next to `SettingsRow` and `SettingsToggleRow` without looking like a
 * different kind of object.
 *
 * IT USED TO LOOK LIKE ONE. The label came from `SegmentedControl`'s own
 * caption — `variant="caption" tone="body"`, and with no icon well in front of
 * it, because this row had none — so on the Accessibility screen "Text size"
 * sat about 40pt left of "Higher contrast" directly below it, lighter, in a
 * shorter row. The label is now drawn here at the siblings' `variant="label"
 * tone="heading"`, inside the siblings' shell, and the control is told to skip
 * its caption so the same words are not printed twice.
 *
 * Three is the ceiling. A fourth choice does not fit at 320pt and belongs on a
 * pushed screen of `SettingsRow`s with a tick — Language does exactly that.
 */
export function SettingsChoiceRow<T extends string>({
  icon,
  label,
  detail,
  segments,
  value,
  onChange,
}: SettingsChoiceRowProps<T>) {
  const { theme } = useUnistyles()

  return (
    // The shell's card, turned on its side: same padding, same radius, same
    // surface, same 48pt minimum as the siblings — only the direction changes,
    // because a full-width control cannot sit at the end of the line the way a
    // chevron or a switch does.
    <View style={[rowShell.row, styles.stack]}>
      <View style={styles.head}>
        {/* Empty when no icon is given. Reserved, never collapsed: this well is
            what puts every label in the family at the same x. */}
        <View style={rowShell.iconWell}>
          {icon ? <Feather name={icon} size={18} color={theme.colors.brand.primary} /> : null}
        </View>

        <View style={rowShell.copy}>
          <Text variant="label" tone="heading">
            {label}
          </Text>

          {detail ? (
            <Text variant="footnote" tone="body">
              {detail}
            </Text>
          ) : null}
        </View>
      </View>

      <SegmentedControl
        label={label}
        labelHidden
        segments={segments}
        value={value}
        onChange={onChange}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  /**
   * Overrides the two things the shell decides for a single-line row.
   * `alignItems: 'stretch'` is load-bearing — the shell centres, which in a
   * column would shrink the head to its content width and pull the icon well
   * off the left edge, undoing the alignment this row exists to get.
   */
  stack: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing.sm,
  },
  /** The line the siblings draw in one go: icon well, then label over detail. */
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}))
