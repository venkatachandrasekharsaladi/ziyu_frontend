import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export function DayDivider({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        {/* `caption` already sets the 1.1 tracking + uppercase that Figma
            522:285 calls out for "field labels and divider labels" — this
            IS a divider label, so no extra letter-spacing is layered on. */}
        <Text variant="caption" tone="onChat">
          {label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: { alignItems: 'center', marginVertical: theme.spacing.lg },
  pill: {
    backgroundColor: theme.colors.chat.accentSoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
}))
