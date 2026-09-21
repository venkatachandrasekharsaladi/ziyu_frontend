import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type ChipTone = 'neutral' | 'brand' | 'success' | 'warning'

type ChipProps = {
  label: string
  icon?: keyof typeof Feather.glyphMap
  /** A trailing count — the filter rows draw "Travel 12". */
  count?: number
  selected?: boolean
  onPress?: () => void
  tone?: ChipTone
}

/**
 * The pill that appears on nine of the ten frames — as a filter, a vibe, a
 * budget band, a status badge, a duration.
 *
 * One component for all of them because they are one shape with two variables:
 * whether it is SELECTED and what TONE it carries. The alternative was a filter
 * chip, a choice chip and a badge that drifted apart the first time a radius
 * changed.
 *
 * A chip with no `onPress` renders as a plain `View`, not a disabled Pressable —
 * a status badge is not a control the user failed to be allowed to press, and
 * screen readers should not announce it as one.
 */
export function Chip({ label, icon, count, selected = false, onPress, tone = 'neutral' }: ChipProps) {
  const { theme } = useUnistyles()

  styles.useVariants({ tone, selected })

  const ink = selected
    ? theme.colors.text.onPrimary
    : tone === 'brand'
      ? theme.colors.brand.primary
      : tone === 'success'
        ? theme.colors.feedback.success
        : theme.colors.text.body

  const body = (
    <>
      {icon ? <Feather name={icon} size={12} color={ink} /> : null}

      <Text variant="footnote" tone={selected ? 'onPrimary' : tone === 'brand' ? 'brand' : 'body'}>
        {label}
      </Text>

      {count === undefined ? null : (
        <View style={styles.count}>
          <Text variant="countdown" tone={selected ? 'onPrimary' : 'placeholder'}>
            {count}
          </Text>
        </View>
      )}
    </>
  )

  if (!onPress) {
    return <View style={styles.chip}>{body}</View>
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
      style={styles.chip}
    >
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.pill,
    borderWidth: 1,

    variants: {
      selected: {
        true: {
          backgroundColor: theme.colors.brand.primary,
          borderColor: theme.colors.brand.primary,
        },
        false: {
          backgroundColor: theme.colors.surface.card,
          borderColor: theme.colors.border.subtle,
        },
      },
      tone: {
        neutral: {},
        brand: {},
        // Status tones tint the ground rather than the border: a green outline
        // on a white card reads as a validation error's cousin, a green wash
        // reads as "done".
        success: {
          backgroundColor: theme.colors.surface.card,
        },
        warning: {
          backgroundColor: theme.colors.surface.field,
        },
      },
    },
  },
  count: {
    paddingHorizontal: theme.spacing.xs,
  },
}))
