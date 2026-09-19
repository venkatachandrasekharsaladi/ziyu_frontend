import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Avatar } from '@/design-system/primitives/Avatar'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'

type IdentityCardProps = {
  name: string
  photoUri?: string | null
  /** The couple's own word for this person — "THE PLANNER". */
  epithet: string
  actionLabel: string
  onPress: () => void
}

/**
 * One half of the pair, as a card. Figma `3430:146` / `3430:159`.
 *
 * The epithet is drawn in `caption` — 11pt, uppercase, tracked — which is the
 * variant the eyebrow on `SpaceStatCard` uses. It is a label for the name above
 * it, not a heading, and giving it heading weight made the card read as two
 * competing titles.
 *
 * The action is an `outline` Button rather than a `link`: it sits at the foot
 * of a white card with nothing under it, and a bare link there has no edge to
 * say where the tap target stops.
 */
export function IdentityCard({
  name,
  photoUri,
  epithet,
  actionLabel,
  onPress,
}: IdentityCardProps) {
  return (
    <View style={styles.card}>
      <Avatar name={name} uri={photoUri} size={128} ring />

      <View style={styles.names}>
        <Text variant="h2" tone="heading" align="center">
          {name}
        </Text>
        <Text variant="caption" tone="body" align="center">
          {epithet}
        </Text>
      </View>

      <Button label={actionLabel} variant="outline" onPress={onPress} />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: 'center',
    gap: theme.spacing.xxl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  names: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
