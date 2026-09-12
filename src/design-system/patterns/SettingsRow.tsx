import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'

/**
 * The icon names Feather actually ships.
 *
 * Exported and shared rather than redeclared in each row file: computing it
 * needs a VALUE import of `Feather` (`typeof Feather.glyphMap`), so a file that
 * only wants the type and writes `import type { Feather }` fails to compile.
 * One definition removes that trap.
 */
export type FeatherName = keyof typeof Feather.glyphMap

type SettingsRowProps = {
  icon: FeatherName
  label: string
  /** A second, quieter line under the label. */
  detail?: string
  /** The current answer, right-aligned before the chevron. */
  value?: string
  /**
   * Omit for a row that only reports something — a version number, a plan
   * name. Without it the row is not a button and carries no chevron, which is
   * the same "honestly unavailable" rule `IconButton` and `BottomNav` follow.
   */
  onPress?: () => void
  tone?: 'default' | 'danger'
  testID?: string
}

/**
 * One row of a settings list.
 *
 * The accessible name folds the value into the label — "Language, English" —
 * because a screen reader moving row by row otherwise announces "Language",
 * and the answer, which is the whole point of the row, is a separate stop.
 *
 * `PressableScale` rather than a bare `Pressable`: every other tappable
 * surface in this app responds by scaling, and a settings list that does not
 * is the one place the app feels dead under the finger.
 */
export function SettingsRow({
  icon,
  label,
  detail,
  value,
  onPress,
  tone = 'default',
  testID,
}: SettingsRowProps) {
  const { theme } = useUnistyles()
  const iconColour = tone === 'danger' ? theme.colors.feedback.error : theme.colors.brand.primary

  const body = (
    <View style={styles.row}>
      <View style={styles.iconWell}>
        <Feather name={icon} size={18} color={iconColour} />
      </View>

      <View style={styles.copy}>
        <Text variant="label" tone={tone === 'danger' ? 'error' : 'heading'}>
          {label}
        </Text>

        {detail ? (
          <Text variant="footnote" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="footnote" tone="muted">
          {value}
        </Text>
      ) : null}

      {onPress ? (
        <Feather name="chevron-right" size={18} color={theme.colors.text.muted} />
      ) : null}
    </View>
  )

  if (!onPress) {
    return (
      <View style={styles.static} testID={testID}>
        {body}
      </View>
    )
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      testID={testID}
    >
      {body}
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 48,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
  },
  static: {
    width: '100%',
  },
  iconWell: {
    width: 32,
    height: 32,
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
