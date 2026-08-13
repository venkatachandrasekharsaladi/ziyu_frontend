import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type CardProps = {
  children: ReactNode
}

/**
 * A bordered surface. First consumed by M00-S03's password requirements.
 *
 * Figma draws the padding at 25, which is off the 4pt grid by 1. The grid wins;
 * the 1pt deviation is recorded in the spec rather than given a token of its own.
 */
export function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create((theme) => ({
  card: {
    width: '100%',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
  },
}))
