import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type ScreenIntroProps = {
  /** The little pill above the headline — "A Lifetime of Two", "Sealed Vault". */
  chip: string
  chipIcon?: keyof typeof Feather.glyphMap
  title: string
  lede?: string
  /** The figure printed to the right of the headline — "12 waiting for us". */
  aside?: string
}

/**
 * The opening of every screen in the cluster: a pill, a headline, a line of
 * prose.
 *
 * All ten frames open this way and each drew it slightly differently — the pill
 * sometimes carries an icon, the aside appears on three of them. Rather than ten
 * near-identical headers, the variation is props and the spacing is decided once.
 *
 * The headline is `h2` rather than `h1`: `h1` is 40pt and these titles run long
 * ("Something for our future selves."), which at 40 wraps to three lines on a
 * 390pt phone and pushes the content below the fold before it has said anything.
 */
export function ScreenIntro({ chip, chipIcon, title, lede, aside }: ScreenIntroProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrap}>
      <View style={styles.chip}>
        {chipIcon ? (
          <Feather name={chipIcon} size={12} color={theme.colors.brand.primary} />
        ) : null}

        <Text variant="caption" tone="brand">
          {chip}
        </Text>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.titleFill}>
          <Text variant="h2" tone="heading">
            {title}
          </Text>
        </View>

        {aside ? (
          <Text variant="footnote" tone="brand">
            {aside}
          </Text>
        ) : null}
      </View>

      {lede ? (
        <Text variant="body" tone="body">
          {lede}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: theme.spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  // The headline takes the room and the aside keeps its intrinsic width, so a
  // long title wraps instead of squeezing "12 waiting for us" onto two lines.
  titleFill: {
    flex: 1,
  },
}))
