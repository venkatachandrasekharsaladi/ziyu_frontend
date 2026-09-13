import { Feather } from '@expo/vector-icons'
import { Switch, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { rowShell } from '@/design-system/patterns/settingsRowShell'
import { Text } from '@/design-system/primitives/Text'

type SettingsToggleRowProps = {
  icon: FeatherName
  label: string
  detail?: string
  value: boolean
  onValueChange: (next: boolean) => void
  /**
   * A child of a master switch that is currently off — "Messages" under a
   * "Notifications" that is off. Rendered dimmed and inert rather than hidden,
   * so the list does not change length when the master flips.
   */
  disabled?: boolean
  testID?: string
}

/**
 * A settings row whose answer is yes or no.
 *
 * The SWITCH carries the label, not a `Text` beside it. Labelling the row and
 * leaving the switch anonymous makes a screen reader announce an unnamed
 * control immediately after the name it belongs to; this way the row is one
 * stop that reads "Read receipts, switch, on".
 */
export function SettingsToggleRow({
  icon,
  label,
  detail,
  value,
  onValueChange,
  disabled = false,
  testID,
}: SettingsToggleRowProps) {
  const { theme } = useUnistyles()

  return (
    <View style={[rowShell.row, disabled && styles.disabled]}>
      <View style={rowShell.iconWell}>
        <Feather name={icon} size={18} color={theme.colors.brand.primary} />
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

      <Switch
        value={value}
        /*
         * The `disabled` check looks redundant beside the `disabled` prop
         * below, and on every real platform it is: a disabled switch emits
         * nothing, native or web. It is kept for the test environment, where it
         * is not redundant at all. `Switch` spreads its props onto the host
         * component, so `fireEvent(switch, 'valueChange', …)` reaches THIS
         * handler directly — RNTL delivers an event the platform never
         * would, and without the check a disabled row would report a change.
         * Removing it was tried and turned "does not fire while disabled" red.
         */
        onValueChange={(next) => {
          if (!disabled) {
            onValueChange(next)
          }
        }}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled }}
        trackColor={{ false: theme.colors.border.field, true: theme.colors.brand.primary }}
        thumbColor={theme.colors.text.onPrimary}
        testID={testID}
      />
    </View>
  )
}

// The card, the icon well and the copy column come from `settingsRowShell`,
// shared with the other two rows. Only what is this row's own lives here.
const styles = StyleSheet.create(() => ({
  disabled: {
    opacity: 0.5,
  },
}))
