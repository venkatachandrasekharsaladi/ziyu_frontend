import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { rowShell } from '@/design-system/patterns/settingsRowShell'
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
   * What `value` ANNOUNCES, when what it draws is not a word. A tick in the
   * value slot is the row saying "this is the one you chose", and it is the
   * only confirmation a tap registered — but folded into the name it reads
   * "English, ✓", which is a character a screen reader may render as "check
   * mark", as "tick", or not at all. Give this and the fold uses the word
   * instead; the drawn glyph is unchanged.
   */
  valueLabel?: string
  /**
   * Omit for a row that only reports something — a version number, a plan
   * name. Without it the row is not a button and carries no chevron, which is
   * the same "honestly unavailable" rule `IconButton` and `BottomNav` follow.
   */
  onPress?: () => void
  tone?: 'default' | 'danger'
  /**
   * Tints the icon well with one of the three `theme.colors.accents` pairs,
   * for a menu that wants to read as colourful rather than uniform grey —
   * the memory detail screen's kebab menu, so far. Omit for the neutral well
   * every other settings row uses; every existing caller keeps that look
   * unchanged by leaving this out.
   */
  tint?: 0 | 1 | 2
  testID?: string
}

/**
 * One row of a settings list.
 *
 * The accessible name folds the value into the label — "Language, English" —
 * because a screen reader moving row by row otherwise announces "Language",
 * and the answer, which is the whole point of the row, is a separate stop.
 * BOTH BRANCHES do it: the static row is the one where the value IS the row —
 * a version number, a plan name — so it is the last place that fold should have
 * been dropped, and it was. A value that is a GLYPH rather than a word folds in
 * as `valueLabel`, so a tick announces as a word and not as a character.
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
  valueLabel,
  onPress,
  tone = 'default',
  tint,
  testID,
}: SettingsRowProps) {
  const { theme } = useUnistyles()
  const accent = tint !== undefined ? theme.colors.accents[tint] : null
  const iconColour =
    tone === 'danger' ? theme.colors.feedback.error : (accent?.ink ?? theme.colors.brand.primary)
  const accessibleName = value ? `${label}, ${valueLabel ?? value}` : label

  const body = (
    <View style={rowShell.row}>
      <View style={[rowShell.iconWell, accent ? { backgroundColor: accent.soft } : null]}>
        <Feather name={icon} size={18} color={iconColour} />
      </View>

      <View style={rowShell.copy}>
        <Text variant="label" tone={tone === 'danger' ? 'error' : 'heading'}>
          {label}
        </Text>

        {detail ? (
          <Text variant="footnote" tone="body">
            {detail}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="footnote" tone="body">
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
      // `accessible` is what makes the fold mean anything: without it the row
      // is three separate stops and the label carries no name of its own. It is
      // NOT given a role — this row is not a button, and saying so was the
      // point of the branch.
      <View style={styles.static} testID={testID} accessible accessibilityLabel={accessibleName}>
        {body}
      </View>
    )
  }

  return (
    <PressableScale onPress={onPress} accessibilityLabel={accessibleName} testID={testID}>
      {body}
    </PressableScale>
  )
}

// The card, the icon well and the copy column come from `settingsRowShell`,
// shared with the other two rows. Only what is this row's own lives here.
const styles = StyleSheet.create(() => ({
  static: {
    width: '100%',
  },
}))
