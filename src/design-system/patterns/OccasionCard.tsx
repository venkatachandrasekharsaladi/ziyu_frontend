import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type OccasionCardProps = {
  icon: keyof typeof Feather.glyphMap
  label: string
  detail?: string
  /** Right-aligned pill — the countdown on "Upcoming". */
  trailing?: string
  /**
   * Position in the "Upcoming" list. Picks the icon badge's accent pair off
   * the theme and wraps, the same convention `EventRow` and `FlashCard` use.
   */
  index?: number
  testID?: string
}

/**
 * One row in "Upcoming". Figma 3337:596-606: a white row card — a round
 * icon badge, a title and a detail line, a lavender countdown pill on the
 * trailing edge.
 *
 * A CIRCLE badge, not `EventRow`'s rounded-square tile — the two rows read
 * differently on purpose (Figma draws them differently), so this stays its
 * own small component rather than a shape variant bolted onto `EventRow`.
 */
export function OccasionCard({ icon, label, detail, trailing, index = 0, testID }: OccasionCardProps) {
  const { theme } = useUnistyles()
  const accent = theme.colors.accents[index % theme.colors.accents.length]

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.left}>
        <View style={[styles.badge, { backgroundColor: accent.soft }]}>
          <Feather name={icon} size={18} color={accent.ink} />
        </View>

        <View style={styles.text}>
          <Text variant="labelStrong" tone="heading">
            {label}
          </Text>

          {detail ? (
            <Text variant="countdown" tone="placeholder">
              {detail}
            </Text>
          ) : null}
        </View>
      </View>

      {trailing ? (
        <View style={styles.pill}>
          <Text variant="captionAction" tone="brand">
            {trailing}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flexShrink: 1,
  },
  badge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
  },
  text: {
    gap: 2,
    flexShrink: 1,
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
}))
