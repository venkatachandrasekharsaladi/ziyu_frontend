import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type StatTileProps = {
  icon: keyof typeof Feather.glyphMap
  value: string
  label: string
  unit?: string
}

/**
 * One tile in "Your little world" — the three-up row the design annotates
 * `←need this section`.
 */
export function StatTile({ icon, value, label, unit }: StatTileProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.tile}>
      <Feather name={icon} size={14} color={theme.colors.brand.primary} />

      <Text variant="labelStrong" tone="heading">
        {value}
        {unit ? ` ${unit}` : ''}
      </Text>

      <Text variant="caption" tone="body">
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    flex: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
}))
