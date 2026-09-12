import { Feather } from '@expo/vector-icons'
import { Switch, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

// Minimum touch target in logical pixels. Touch targets must never shrink
// to satisfy spacing scale updates.
const TOUCH_TARGET_MIN = 48

const ICON_WELL_SIZE = 32

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
    <View style={[styles.row, disabled && styles.disabled]}>
      <View style={styles.iconWell}>
        <Feather name={icon} size={18} color={theme.colors.brand.primary} />
      </View>

      <View style={styles.copy}>
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
        onValueChange={(newValue) => {
          if (!disabled) {
            onValueChange(newValue)
          }
        }}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        trackColor={{ false: theme.colors.border.field, true: theme.colors.brand.primary }}
        thumbColor={theme.colors.text.onPrimary}
        testID={testID}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: TOUCH_TARGET_MIN,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
  },
  disabled: {
    opacity: 0.5,
  },
  iconWell: {
    width: ICON_WELL_SIZE,
    height: ICON_WELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
}))
