import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type EventRowProps = {
  icon: keyof typeof Feather.glyphMap
  label: string
  detail?: string
  /**
   * Position in the list. Picks the icon tile's accent pair off the theme and
   * wraps, so the caller never names a colour and a long list never runs out.
   */
  index?: number
  /** Right-aligned value — the countdown on "Coming up". */
  trailing?: string
  onPress?: () => void
}

/**
 * One row inside a `SectionPanel`: a tinted icon tile, a title, a detail line.
 *
 * The tile is a rounded square rather than a circle. A circle reads as an
 * avatar — a person — which is wrong for an event, and the squarer shape echoes
 * the row card and the bar's active pill.
 */
export function EventRow({ icon, label, detail, index = 0, trailing, onPress }: EventRowProps) {
  const { theme } = useUnistyles()
  const accent = theme.colors.accents[index % theme.colors.accents.length]

  const body = (
    <>
      <View style={[styles.tile, { backgroundColor: accent.soft }]} testID="event-row-tile">
        <Feather name={icon} size={20} color={accent.ink} />
      </View>

      <View style={styles.text}>
        <Text variant="labelStrong" tone="heading">
          {label}
        </Text>

        {detail ? (
          <Text variant="footnote" tone="body">
            {detail}
          </Text>
        ) : null}
      </View>

      {trailing ? (
        <Text variant="labelStrong" tone="brand">
          {trailing}
        </Text>
      ) : null}
    </>
  )

  if (!onPress) {
    return <View style={styles.row}>{body}</View>
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  tile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
  },
  text: {
    flex: 1,
    gap: 2,
  },
}))
