import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * M00-S05 Forgot Password — PLACEHOLDER.
 *
 * Exists so Sign In's "Forgot password?" link has a real destination and so
 * `expo-router`'s typed routes accept `/(auth)/forgot-password`. Replaced by the
 * real screen in Task 13 of the auth cluster plan.
 */
export default function ForgotPasswordRoute() {
  return (
    <View style={styles.screen}>
      <Text variant="h2" tone="heading" align="center">
        Forgot Password
      </Text>
      <Text variant="body" tone="body" align="center">
        M00-S05 — not built yet
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
