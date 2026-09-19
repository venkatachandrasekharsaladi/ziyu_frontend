import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

type SpacePillarCardProps = {
  icon: FeatherName
  title: string
  body: string
  /** Index into `theme.colors.accents` — the tile's colour. */
  accent: number
}

/**
 * One promise the app makes, as a card. Figma `3430:1575` and its three
 * siblings on Privacy Details; the same shape recurs on Keep Our Space Private
 * and About Our Space.
 *
 * LEFT-ALIGNED with the tile above the title, which is what separates it from
 * `SpaceNoticeCard` — that one centres everything and is a single reassurance
 * sitting among controls. These come in fours and are read as prose, and
 * centred paragraphs at this length are markedly harder to scan.
 *
 * Not pressable, and carries no chevron. Every one of these is a statement.
 */
export function SpacePillarCard({ icon, title, body, accent }: SpacePillarCardProps) {
  const { theme } = useUnistyles()
  const pair = theme.colors.accents[accent] ?? theme.colors.accents[0]

  return (
    <View style={styles.card}>
      <View style={[styles.tile, { backgroundColor: pair.soft }]}>
        <Feather name={icon} size={20} color={pair.ink} />
      </View>

      <View style={styles.copy}>
        <Text variant="h3" tone="heading">
          {title}
        </Text>
        <Text variant="body" tone="body">
          {body}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.xxl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
  },
  copy: {
    gap: theme.spacing.xs,
  },
}))
