import { View, type ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'

type SpaceOptionTileProps = {
  label: string
  selected: boolean
  selectedLabel: string
  onPress: () => void
  /** The swatch fill — a mood wash, or a card-style surface. */
  fill?: string
  /** Drawn inside the swatch. The card-style tiles put their sample note here. */
  sample?: string
  /** Extra swatch styling a caller needs, e.g. the flat style's lack of border. */
  swatchStyle?: ViewStyle
}

/**
 * One option in a picker, as a swatch with its name under it.
 *
 * Shared by all three groups on Personalize Our Space — mood washes, memory
 * frames and card textures — because the frame draws them as the same object
 * at three sizes, and three near-identical tile components is how they drift
 * apart later.
 *
 * `radio`, like `MoodCard`, and for the same reason: each group is one choice.
 * The unselected tiles are dimmed exactly as the frame dims them, but dimming
 * is decoration — the announcement comes from `selected` and the folded word.
 */
export function SpaceOptionTile({
  label,
  selected,
  selectedLabel,
  onPress,
  fill,
  sample,
  swatchStyle,
}: SpaceOptionTileProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${label}, ${selectedLabel}` : label}
    >
      <View style={[styles.tile, !selected && styles.unselected]}>
        <View
          style={[
            styles.swatch,
            selected && styles.swatchSelected,
            fill ? { backgroundColor: fill } : null,
            swatchStyle,
          ]}
        >
          {sample ? (
            <Text variant="body" tone={selected ? 'brand' : 'heading'}>
              {sample}
            </Text>
          ) : null}
        </View>

        <Text variant="label" tone={selected ? 'brand' : 'body'} align="center">
          {label}
        </Text>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  /** The frame draws every unchosen option at 60%. */
  unselected: {
    opacity: 0.6,
  },
  swatch: {
    width: '100%',
    minWidth: 96,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
    borderWidth: 2,
    borderColor: 'transparent',
    boxShadow: theme.elevation.field,
  },
  swatchSelected: {
    borderColor: theme.colors.brand.primary,
  },
}))
