import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { WELCOME_COPY } from '@/copy/welcome'
import { Text } from '@/design-system/primitives/Text'

/**
 * Lock icon plus the reassurance line at the foot of Welcome. Figma 522:280.
 *
 * The icon is decorative — the sentence beside it already says what it means,
 * so announcing it twice would be redundant.
 */
export function PrivacyFooter() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/icons/lock.svg')}
        style={styles.icon}
        contentFit="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View style={styles.textWrap}>
        <Text variant="caption" tone="body" align="center">
          {WELCOME_COPY.privacyNote}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    // Figma sets the whole group to 80% — the note should recede, not compete
    // with the call to action above it.
    opacity: 0.8,
  },
  icon: {
    width: 9.33,
    height: 12.25,
  },
  textWrap: {
    paddingLeft: theme.spacing.xs,
    maxWidth: 300,
  },
}))
