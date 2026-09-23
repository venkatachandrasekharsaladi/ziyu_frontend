import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type ProgressBarProps = {
  /** 0–1. Clamped, because a board can be finished past its own target. */
  value: number
  /** The line above the track — "7 / 25", "8 of 50 experiences". */
  label?: string
  /** The figure on the right — "28% Completed". */
  trailing?: string
  /** The quiet line under the track — "18 to go". */
  footnote?: string
}

/**
 * The progress track drawn on five of the ten frames — the bingo board, the
 * lifetime list, the capsule countdown, the itinerary's "moments planned", and
 * each queue row on Watch Together.
 *
 * `value` is clamped rather than trusted. Three of those five compute a
 * denominator the couple chooses (a 50-promise target, 7 planned moments), so a
 * value over 1 is a legitimate state — they did more than they said they would —
 * and an unclamped bar would render a fill wider than its own track.
 */
export function ProgressBar({ value, label, trailing, footnote }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))

  return (
    <View style={styles.wrap}>
      {label || trailing ? (
        <View style={styles.row}>
          {label ? (
            <Text variant="labelStrong" tone="heading">
              {label}
            </Text>
          ) : null}

          {trailing ? (
            <Text variant="footnote" tone="brand">
              {trailing}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/*
       * `accessible` is what actually PUBLISHES the role. A View carrying
       * `accessibilityRole` but not marked accessible is not an accessibility
       * element, so the role and value never reach VoiceOver or TalkBack — the
       * bar reads as decoration and the percentage is lost. Caught by
       * `ProgressBar.test.tsx`, which could not find the role either.
       */}
      <View
        accessible
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      >
        <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
      </View>

      {footnote ? (
        <Text variant="footnote" tone="placeholder">
          {footnote}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  track: {
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.strength.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
}))
