import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * The date a run of messages belongs to.
 *
 * The rules either side are what make it a divider rather than a floating
 * badge: they draw the line the eye already infers between two days, and they
 * hold the label in the centre of the thread at any width, which a bare pill
 * only appears to do while the label stays short.
 */
export function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.rule} />
      <View style={styles.pill}>
        {/* `caption` already sets the 1.1 tracking + uppercase that Figma
            522:285 calls out for "field labels and divider labels" — this
            IS a divider label, so no extra letter-spacing is layered on. */}
        <Text variant="caption" tone="onChat">
          {label}
        </Text>
      </View>
      <View style={styles.rule} />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.xl,
  },
  // `flex: 1` on both rules, not a fixed width: the label keeps the centre on
  // a 320pt phone and a 430pt one alike, and a longer label simply takes the
  // room from the rules instead of pushing them off the screen.
  rule: { flex: 1, height: 1, backgroundColor: theme.colors.border.subtle },
  pill: {
    backgroundColor: theme.colors.chat.accentSoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
}))
