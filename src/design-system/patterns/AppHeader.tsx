import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { BRAND } from '@/config/brand'
import { Text } from '@/design-system/primitives/Text'

type AppHeaderProps = {
  /** When given, a back button is rendered. Omit on an entry-point screen. */
  onBack?: () => void
}

/**
 * The app's top bar. Replaces the auth module's `BrandHeader`, because Modules
 * 01+ use it too — it is app chrome, not an auth component.
 *
 * Both edge slots are ALWAYS rendered — a 40pt back button or a 40pt spacer — so
 * the wordmark is centred by symmetry. M00-S05 centred it with an asymmetric
 * `padding-right: 158.7`, which only looks right at exactly 390pt wide.
 *
 * The heart beside the wordmark is the brand lockup. Only M00-S02 drew it,
 * because it is the only frame that got a header pass; it belongs on every
 * screen that shows the wordmark.
 */
export function AppHeader({ onBack }: AppHeaderProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.edge}
          testID="header-edge"
        >
          <Feather name="arrow-left" size={20} color={theme.colors.text.heading} />
        </Pressable>
      ) : (
        <View style={styles.edge} testID="header-edge" />
      )}

      <View style={styles.lockup}>
        <Feather name="heart" size={14} color={theme.colors.brand.primary} />
        <Text variant="wordmark" tone="brand">
          {BRAND.name}
        </Text>
      </View>

      <View style={styles.edge} testID="header-edge" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    // Figma specifies an 80% fill behind a 6pt blur. The fill is what carries the
    // effect; the blur via expo-glass-effect is deferred until the flat version
    // is verified on device (spec open item 7).
    backgroundColor: theme.colors.surface.page,
  },
  edge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
