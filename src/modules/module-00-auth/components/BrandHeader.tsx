import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { BRAND } from '@/config/brand'
import { Text } from '@/design-system/primitives/Text'

/**
 * Top app bar for the Welcome context — wordmark only, no back arrow, since
 * this is the first screen and there is nowhere to go back to. Figma 522:267.
 */
export function BrandHeader() {
  return (
    <View style={styles.container}>
      <Text variant="wordmark" tone="brand" align="center">
        {BRAND.name}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
}))
