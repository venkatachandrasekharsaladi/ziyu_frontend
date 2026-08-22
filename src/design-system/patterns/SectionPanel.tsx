import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type SectionPanelProps = {
  title: string
  children: ReactNode
}

/**
 * A titled group: one soft lavender surface holding a stack of white row cards.
 *
 * The dashboard's list sections used to be a muted uppercase caption followed by
 * loose cards on the page ground. The Stitch frame groups them instead — title
 * inside the surface, rows inset on it — which is what makes a list read as one
 * thing rather than three unrelated cards that happen to be adjacent.
 *
 * The title is `h3`, not `caption`: at 11pt uppercase muted it was quieter than
 * the row titles beneath it, so the section it named looked subordinate to its
 * own contents.
 */
export function SectionPanel({ title, children }: SectionPanelProps) {
  return (
    <View style={styles.panel}>
      <Text variant="h3" tone="heading">
        {title}
      </Text>

      <View style={styles.rows}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  panel: {
    width: '100%',
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.field,
  },
  rows: {
    gap: theme.spacing.md,
  },
}))
