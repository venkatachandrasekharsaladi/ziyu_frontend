import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type FlashCardProps = {
  icon: keyof typeof Feather.glyphMap
  value: string
  label: string
  unit?: string
}

/** One face of the "Your little world" `CardStack` — a single stat, full-size. */
export function FlashCard({ icon, value, label, unit }: FlashCardProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.card}>
      <Feather name={icon} size={22} color={theme.colors.brand.primary} />

      <Text variant="h1" tone="heading">
        {value}
        {unit ? ` ${unit}` : ''}
      </Text>

      <Text variant="footnote" tone="body">
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
}))
