import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * M00-S03 Create Account — PLACEHOLDER.
 *
 * Exists so Welcome's primary action has somewhere real to land. The design is
 * drawn (Figma 522:154) but not built.
 */
export default function SignUpScreen() {
  return (
    <View style={styles.screen}>
      <Text variant="h1" tone="heading" align="center">
        Create Account
      </Text>
      <Text variant="body" tone="body" align="center">
        M00-S03 — not built yet
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
