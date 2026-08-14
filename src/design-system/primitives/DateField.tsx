import { useCallback, useEffect, useState } from 'react'
import { TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/** Nobody using this app was born before 1900. */
const EARLIEST_YEAR = 1900

/**
 * Validates a birthday by round-tripping through `Date`.
 *
 * A plain range check passes 31 February, because `Date` silently rolls it
 * forward to 3 March. Comparing the components back out is what catches it.
 */
export function isValidBirthday(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (year < EARLIEST_YEAR || month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)

  const survivesRoundTrip =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

  if (!survivesRoundTrip) return false

  // A birthday in the future is always a typo.
  return date.getTime() <= Date.now()
}

type DateFieldProps = {
  label: string
  /** `YYYY-MM-DD`, or `''` when incomplete. */
  value: string
  onChangeText: (next: string) => void
  error?: string
}

function split(value: string): { mm: string; dd: string; yyyy: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) return { mm: '', dd: '', yyyy: '' }

  return { yyyy: match[1], mm: match[2], dd: match[3] }
}

/**
 * A typed date, in three segments — `mm / dd / yyyy`, as drawn on M01-S02.
 *
 * Deliberately not a calendar: a birthday decades in the past is far faster to
 * type than to scroll to, and a date picker opening on today is the wrong
 * starting point for one.
 *
 * Emits `YYYY-MM-DD` only when all three segments form a real date, and `''`
 * otherwise, so a partially-typed date never reads as valid downstream.
 */
export function DateField({ label, value, onChangeText, error }: DateFieldProps) {
  const [parts, setParts] = useState(() => split(value))

  // Keeps the segments honest if the form resets the value from outside.
  useEffect(() => {
    if (value === '') setParts({ mm: '', dd: '', yyyy: '' })
  }, [value])

  const update = useCallback(
    (key: 'mm' | 'dd' | 'yyyy', raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, key === 'yyyy' ? 4 : 2)
      const next = { ...parts, [key]: digits }

      setParts(next)

      const month = Number(next.mm)
      const day = Number(next.dd)
      const year = Number(next.yyyy)
      const complete = next.mm.length === 2 && next.dd.length === 2 && next.yyyy.length === 4

      onChangeText(
        complete && isValidBirthday(year, month, day)
          ? `${next.yyyy}-${next.mm}-${next.dd}`
          : '',
      )
    },
    [parts, onChangeText],
  )

  return (
    <View style={styles.container}>
      <Text variant="caption" tone="body">
        {label}
      </Text>

      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          value={parts.mm}
          onChangeText={(t) => update('mm', t)}
          placeholder="mm"
          keyboardType="number-pad"
          maxLength={2}
          accessibilityLabel={`${label} month`}
          style={[styles.segment, styles.segmentShort]}
        />
        <Text variant="label" tone="placeholder">
          /
        </Text>
        <TextInput
          value={parts.dd}
          onChangeText={(t) => update('dd', t)}
          placeholder="dd"
          keyboardType="number-pad"
          maxLength={2}
          accessibilityLabel={`${label} day`}
          style={[styles.segment, styles.segmentShort]}
        />
        <Text variant="label" tone="placeholder">
          /
        </Text>
        <TextInput
          value={parts.yyyy}
          onChangeText={(t) => update('yyyy', t)}
          placeholder="yyyy"
          keyboardType="number-pad"
          maxLength={4}
          accessibilityLabel={`${label} year`}
          style={[styles.segment, styles.segmentLong]}
        />
      </View>

      {error ? (
        <View testID="date-error" aria-live="polite">
          <Text variant="footnote" tone="error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    height: theme.control.height,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.field,
    boxShadow: theme.elevation.field,
  },
  fieldError: {
    borderColor: theme.colors.feedback.error,
  },
  segment: {
    ...theme.typography.label,
    color: theme.colors.text.heading,
    paddingVertical: 0,
    textAlign: 'center',
  },
  segmentShort: {
    width: 28,
  },
  segmentLong: {
    width: 48,
  },
}))
