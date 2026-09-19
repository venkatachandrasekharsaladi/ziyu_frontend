import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

type SpaceNoticeCardProps = {
  icon: FeatherName
  title: string
  body: string
  /**
   * Which `theme.colors.accents` pair tints the icon tile. Defaults to the mint
   * pair, which is the one the privacy frames draw.
   */
  accent?: number
}

/**
 * A reassurance, not a control.
 *
 * Figma `3430:2384` ("Private Space") and the same shape on the privacy,
 * connection and assistant frames. It states a fact about the space and is
 * deliberately NOT pressable — every other card on these screens goes
 * somewhere, and one that looks the same but does nothing is the reason a
 * person stops trusting that a card means "tap me".
 *
 * The tile takes its fill and its glyph ink from the same `accents` pair, so
 * the icon clears AA on it. Picking the two independently is how that contrast
 * gets lost.
 */
export function SpaceNoticeCard({ icon, title, body, accent = 1 }: SpaceNoticeCardProps) {
  const { theme } = useUnistyles()
  const pair = theme.colors.accents[accent] ?? theme.colors.accents[1]

  return (
    <View style={styles.card}>
      <View style={[styles.tile, { backgroundColor: pair.soft }]}>
        <Feather name={icon} size={20} color={pair.ink} />
      </View>

      <Text variant="h3" tone="heading" align="center">
        {title}
      </Text>

      <Text variant="footnote" tone="body" align="center">
        {body}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    marginBottom: theme.spacing.sm,
  },
}))
