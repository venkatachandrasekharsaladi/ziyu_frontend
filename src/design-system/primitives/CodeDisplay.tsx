import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/**
 * `L8V7QK` → `L8V · 7QK`.
 *
 * The separator is presentation only and is never part of the value. A code of
 * any other length is left alone rather than being split at an arbitrary point.
 */
export function formatCode(code: string): string {
  const clean = code.trim().toUpperCase()

  if (clean.length !== 6) return clean

  return `${clean.slice(0, 3)} · ${clean.slice(3)}`
}

type CodeDisplayProps = {
  code: string
}

/**
 * A pairing code, shown to be read aloud or transcribed.
 *
 * The accessible label spells the characters out individually. A screen reader
 * announcing "L8V · 7QK" as a word is useless to the person who has to type it
 * into another phone.
 */
export function CodeDisplay({ code }: CodeDisplayProps) {
  const clean = code.trim().toUpperCase()

  return (
    <View style={styles.container} accessibilityLabel={clean.split('').join(' ')}>
      <Text variant="h2" tone="heading" align="center">
        {formatCode(code)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
  },
}))
