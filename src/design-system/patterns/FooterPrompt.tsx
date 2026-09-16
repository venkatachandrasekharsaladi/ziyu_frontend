import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type FooterPromptProps = {
  text: string
  linkLabel: string
  onPress: () => void
}

/**
 * "Prompt text + inline link" — M00-S02's "New to Tales of Two? Create an account"
 * and M00-S03's mirror of it.
 *
 * M00-S02 underlined the link at 30% opacity, which reads as a rendering fault.
 * Colour alone already distinguishes it, which is how M00-S03 drew it.
 *
 * Needs no new primitive API: `Text` nests, and `TextProps` already forwards
 * `onPress` and `accessibilityRole`.
 */
export function FooterPrompt({ text, linkLabel, onPress }: FooterPromptProps) {
  return (
    <View style={styles.container}>
      <Text variant="label" tone="body" align="center">
        {`${text} `}
        <Text variant="label" tone="brand" onPress={onPress} accessibilityRole="link">
          {linkLabel}
        </Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    paddingVertical: theme.spacing.xxl,
  },
}))
