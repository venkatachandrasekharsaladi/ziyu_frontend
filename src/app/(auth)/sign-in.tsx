import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * M00-S02 Sign In — PLACEHOLDER.
 *
 * Exists so Welcome's secondary action has somewhere real to land. The design
 * is drawn (Figma 522:53) but not built; it needs form state, validation and
 * an auth provider for the Google and Apple buttons.
 */
export default function SignInScreen() {
  return (
    <View style={styles.screen}>
      <Text variant="h1" tone="heading" align="center">
        Sign In
      </Text>
      <Text variant="body" tone="body" align="center">
        M00-S02 — not built yet
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface.gradientFrom,
  },
}))
