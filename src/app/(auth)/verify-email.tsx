import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * M00-S04 Verify Email — PLACEHOLDER.
 *
 * Exists so Sign In and Create Account have a real destination and so
 * `expo-router`'s typed routes accept `/(auth)/verify-email`. Replaced by the
 * real screen in Task 11 of the auth cluster plan.
 */
export default function VerifyEmailRoute() {
  return (
    <View style={styles.screen}>
      <Text variant="h2" tone="heading" align="center">
        Verify Email
      </Text>
      <Text variant="body" tone="body" align="center">
        M00-S04 — not built yet
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
    backgroundColor: theme.colors.surface.page,
  },
}))
