import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import type { SpaceMood } from '@/state/spaceStore'

type MoodCardProps = {
  mood: SpaceMood
  name: string
  detail: string
  selected: boolean
  /** The word folded into the accessible name when this card is the chosen one. */
  selectedLabel: string
  onPress: () => void
}

/**
 * One atmosphere, as a card. Figma `3430:2052` and its four siblings.
 *
 * The wash is the mood's own colour from `theme.colors.moods`; the name and
 * detail sit on the card's white foot, never on the wash. That split is why
 * the moods are decorative-only tokens and are not contrast-checked.
 *
 * The frame draws a tick in a filled circle on the chosen card. It is drawn
 * here too, but the card ALSO reports `selected` through `accessibilityState`
 * and folds the word into its name — a tick is a shape, and a shape is not an
 * announcement.
 *
 * `radio` rather than `button`: these five are one choice, and a screen reader
 * moving through five buttons has no way to know only one of them can win.
 */
export function MoodCard({
  mood,
  name,
  detail,
  selected,
  selectedLabel,
  onPress,
}: MoodCardProps) {
  const { theme } = useUnistyles()

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${name}, ${selectedLabel}` : name}
    >
      <View style={[styles.card, selected && styles.cardSelected]}>
        <View style={[styles.wash, { backgroundColor: theme.colors.moods[mood] }]}>
          {selected ? (
            <View style={styles.tick}>
              <Feather name="check" size={14} color={theme.colors.text.onPrimary} />
            </View>
          ) : null}
        </View>

        <View style={styles.foot}>
          <Text variant="h3" tone="heading">
            {name}
          </Text>
          <Text variant="body" tone="body">
            {detail}
          </Text>
        </View>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    overflow: 'hidden',
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: theme.colors.brand.primary,
  },
  wash: {
    height: 160,
  },
  tick: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  foot: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xxl,
  },
}))
