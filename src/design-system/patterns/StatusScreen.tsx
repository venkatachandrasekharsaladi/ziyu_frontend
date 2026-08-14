import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type StatusScreenProps = {
  /** Artwork above the copy. Decorative — hide it from the a11y tree yourself. */
  illustration?: ReactNode
  heading: string
  lede?: string
  actions?: ReactNode
}

/**
 * The shape M01-S07 Connecting and M01-S08 Relationship Connected share:
 * centred artwork, a headline, a lede, and optionally some actions.
 *
 * Extracted because two screens differing only in their copy and whether they
 * have buttons should not be two layouts.
 */
export function StatusScreen({ illustration, heading, lede, actions }: StatusScreenProps) {
  return (
    <View style={styles.container}>
      {illustration ? <View style={styles.illustration}>{illustration}</View> : null}

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {heading}
        </Text>

        {lede ? (
          <Text variant="body" tone="body" align="center">
            {lede}
          </Text>
        ) : null}
      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  illustration: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xxxl,
  },
  copy: {
    width: '100%',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
}))
