import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type ProgressMedallionProps = {
  /** 0–1. Clamped, like `ProgressBar` — a plan can beat its own target. */
  value: number
  /** Announced to screen readers; the circle itself is decorative. */
  label: string
  size?: number
}

/**
 * The circular percentage badge beside "3 of 7 moments planned" — Figma
 * 3482:965.
 *
 * A RISING FILL, NOT A SWEPT ARC. The frame draws a conic ring, which in React
 * Native means either `react-native-svg` or the two-half-disc rotation trick.
 * A dependency is the wrong price for a screen that exists to be shown once and
 * possibly deleted, and the rotation trick is easy to get subtly wrong in a way
 * nobody notices until it is on a phone at an angle.
 *
 * So the value is encoded as a fill rising from the bottom of the disc, clipped
 * by the circle itself. It is exact at every percentage, it needs nothing but
 * `overflow: 'hidden'`, and it reads as a gauge rather than as a broken ring.
 * If this design is adopted and the arc genuinely matters, that is the moment to
 * add `react-native-svg` — not before.
 */
export function ProgressMedallion({ value, label, size = 52 }: ProgressMedallionProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const percent = Math.round(clamped * 100)

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {/*
       * Decorative: the percentage is already announced on the parent through
       * `accessibilityValue`, so the fill must not be a second thing to read.
       */}
      <View
        importantForAccessibility="no-hide-descendants"
        style={[styles.fill, { height: `${percent}%` }]}
      />

      <Text variant="countdown" tone="brand">
        {`${percent}%`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface.soft,
    backgroundColor: theme.colors.surface.card,
    // Clips the fill to the circle. Without it the fill renders as a square.
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface.soft,
  },
}))
