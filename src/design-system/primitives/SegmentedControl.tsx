import { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export type Segment<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  label: string
  /**
   * Drops the visible caption for a caller that already draws the label
   * itself — `SettingsChoiceRow` does, at the same variant and tone as its
   * sibling rows, so the caption would be the same words a second time in a
   * lighter style.
   *
   * It hides the CAPTION, never the NAME: `label` still goes on the radiogroup
   * as its `accessibilityLabel`, so the control is announced and found by
   * exactly the string it is today. Defaults to false, so M01-S12's date
   * precision — the original and still the only other caller — is untouched.
   */
  labelHidden?: boolean
  segments: Segment<T>[]
  value: T
  onChange: (next: T) => void
}

/**
 * A one-of-N choice, for M01-S12's date precision.
 *
 * Built on the field surface rather than as a row of `Button`s: three pills
 * side by side read as three separate actions, when this is one control with
 * one answer. The selected segment takes the brand fill the primary button
 * uses, so "chosen" looks the same here as everywhere else.
 *
 * Selection is never colour alone — `accessibilityState.selected` carries it
 * for a screen reader, matching the rule the error states follow.
 */
export function SegmentedControl<T extends string>({
  label,
  labelHidden = false,
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {labelHidden ? null : (
        <Text variant="caption" tone="body">
          {label}
        </Text>
      )}

      <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {segments.map((segment) => (
          <SegmentButton
            key={segment.value}
            segment={segment}
            selected={segment.value === value}
            onChange={onChange}
          />
        ))}
      </View>
    </View>
  )
}

function SegmentButton<T extends string>({
  segment,
  selected,
  onChange,
}: {
  segment: Segment<T>
  selected: boolean
  onChange: (next: T) => void
}) {
  const onPress = useCallback(() => onChange(segment.value), [onChange, segment.value])

  styles.useVariants({ selected })

  return (
    <Pressable
      onPress={onPress}
      style={styles.segment}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={segment.label}
    >
      <Text variant="labelStrong" tone={selected ? 'onPrimary' : 'body'} align="center">
        {segment.label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  track: {
    flexDirection: 'row',
    width: '100%',
    // Pinned, NOT derived from the segments. Letting the height fall out of
    // content plus padding plus border rendered 58pt, which put this control
    // 2pt out of step with every button and input in the app.
    height: theme.control.height,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.field,
  },
  segment: {
    flex: 1,
    // Stretches to whatever the pinned track leaves, so the 56pt total holds.
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field - 2,
    variants: {
      selected: {
        true: { backgroundColor: theme.colors.brand.primary },
        false: { backgroundColor: 'transparent' },
      },
    },
  },
}))
