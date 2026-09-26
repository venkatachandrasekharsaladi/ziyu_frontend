import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type FlashCardProps = {
  icon: keyof typeof Feather.glyphMap
  value: string
  label: string
  unit?: string
  /**
   * Position in the "Your little world" row. Only the glyph's own colour
   * cycles by this — the tile itself is one flat, shared lavender, same as
   * every other stat.
   */
  index?: number
  testID?: string
}

/**
 * One tile in "Your little world"'s horizontal row.
 *
 * Figma 3337:542-573: a flat, uniform lavender tile, unlike `EventRow`'s
 * per-row accent fill — every stat here reads as one quiet fact about the
 * couple, not a distinct category earning its own colour, so only the icon
 * varies.
 */
export function FlashCard({ icon, value, label, unit, index = 0, testID }: FlashCardProps) {
  const { theme } = useUnistyles()
  const accent = theme.colors.accents[index % theme.colors.accents.length]

  return (
    <View style={styles.card} testID={testID}>
      <Feather name={icon} size={17} color={accent.ink} />

      <View style={styles.body}>
        <Text variant="caption" tone="placeholder">
          {label}
        </Text>

        <Text variant="statValue" tone="heading">
          {value}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    minHeight: 104,
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.field,
  },
  body: {
    gap: 2,
  },
}))
