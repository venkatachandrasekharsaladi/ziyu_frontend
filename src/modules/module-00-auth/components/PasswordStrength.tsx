import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { RESET_PASSWORD_COPY as COPY } from '@/copy/resetPassword'
import { Text } from '@/design-system/primitives/Text'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

type PasswordStrengthProps = {
  value: string
}

type Level = 'weak' | 'fair' | 'strong'

/** The word and the ink that go with a level. Ink is AA on the page fill. */
const LEVELS = {
  weak: { label: COPY.strengthLevels.weak, tone: 'error' },
  fair: { label: COPY.strengthLevels.fair, tone: 'body' },
  strong: { label: COPY.strengthLevels.strong, tone: 'success' },
} as const

/**
 * M00-S06's strength meter. Stitch screen c2f89424.
 *
 * One bar per rule in `PASSWORD_RULES`, filled by how many of them the password
 * satisfies — so the meter measures the contract's actual policy rather than a
 * strength heuristic of its own.
 *
 * That matters more than it sounds. The Stitch prototype scored on length
 * alone and called any password over six characters "Strong", which would have
 * told a user that `abcdef` was the best kind of password moments before the
 * server rejected it. A meter that disagrees with the thing it is predicting is
 * worse than no meter.
 *
 * The level is stated in words as well as colour, and the container carries both
 * as one accessibility label, because three coloured bars alone say nothing to a
 * screen reader — the same rule M00-S03's checklist follows.
 */
export function PasswordStrength({ value }: PasswordStrengthProps) {
  const met = PASSWORD_RULES.filter((rule) => rule.test(value)).length

  // Strong requires EVERY rule, not a majority: anything less is a password the
  // server will refuse.
  const level: Level = met === PASSWORD_RULES.length ? 'strong' : met >= 2 ? 'fair' : 'weak'

  styles.useVariants({ level })

  return (
    <View
      style={styles.container}
      accessibilityLabel={`${COPY.strengthLabel}: ${LEVELS[level].label}`}
    >
      <View style={styles.row}>
        <Text variant="footnote" tone="body">
          {COPY.strengthLabel}
        </Text>

        <Text variant="caption" tone={LEVELS[level].tone}>
          {LEVELS[level].label}
        </Text>
      </View>

      <View style={styles.bars}>
        {PASSWORD_RULES.map((rule, index) => {
          const isFilled = index < met

          return (
            <View
              key={rule.id}
              testID={isFilled ? 'strength-bar-filled' : 'strength-bar-empty'}
              style={[styles.bar, isFilled ? styles.barFilled : styles.barEmpty]}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  bars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  barEmpty: {
    backgroundColor: theme.colors.strength.track,
  },
  barFilled: {
    variants: {
      level: {
        weak: { backgroundColor: theme.colors.strength.weak },
        fair: { backgroundColor: theme.colors.strength.fair },
        strong: { backgroundColor: theme.colors.strength.strong },
      },
    },
  },
}))
