import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { WHEN_WE_MET_COPY as COPY } from '@/copy/whenWeMet'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { SegmentedControl } from '@/design-system/primitives/SegmentedControl'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import type { DatePrecision } from '@/services/story/types'
import { useStoryStore } from '@/state/storyStore'

const EARLIEST_YEAR = 1900

/**
 * M01-S13 — When We Met. Stitch screen c9591260.
 *
 * The design draws a calendar. This uses `DateField` — the app's one date
 * control — for the same reason `DateField` is not a calendar itself: a date
 * years in the past is typed far faster than it is scrolled to.
 *
 * Precision is asked for rather than assumed, because "sometime in 2019" is a
 * real answer and forcing a day would make the user invent one. What is stored
 * is always a full date; the precision records how much of it to believe.
 */
export function WhenWeMetScreen() {
  const router = useRouter()
  const setMet = useStoryStore((state) => state.setMet)

  const [precision, setPrecision] = useState<DatePrecision>('exact')
  const [date, setDate] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  const next = useCallback(() => router.push('/(onboarding)/first-date'), [router])

  const submit = useCallback(() => {
    setError(null)

    if (precision === 'yearOnly') {
      const parsed = Number(year)

      if (!/^\d{4}$/.test(year) || parsed < EARLIEST_YEAR || parsed > new Date().getFullYear()) {
        setError(COPY.yearInvalid)
        return
      }

      // Unknown parts are filled with 01 so the stored value is always a real
      // date; `precision` is what stops it being displayed as one.
      setMet({ value: `${year}-01-01`, precision })
      next()
      return
    }

    if (!date) {
      setError(COPY.dateRequired)
      return
    }

    setMet({ value: date, precision })
    next()
  }, [precision, year, date, setMet, next])

  const onChangePrecision = useCallback((value: DatePrecision) => {
    setPrecision(value)
    setError(null)
  }, [])

  return (
    <AuthScreenLayout onBack={router.back}>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.form}>
        <SegmentedControl
          label={COPY.precisionLabel}
          segments={[...COPY.precisions]}
          value={precision}
          onChange={onChangePrecision}
        />

        {precision === 'yearOnly' ? (
          <Input
            label={COPY.yearLabel}
            value={year}
            onChangeText={(next) => {
              setYear(next.replace(/\D/g, '').slice(0, 4))
              setError(null)
            }}
            placeholder={COPY.yearPlaceholder}
            keyboardType="number-pad"
            error={error ?? undefined}
          />
        ) : (
          <DateField
            label={precision === 'monthYear' ? COPY.monthLabel : COPY.dateLabel}
            value={date}
            onChangeText={(next) => {
              setDate(next)
              setError(null)
            }}
            error={error ?? undefined}
          />
        )}

        <Button label={COPY.submit} onPress={submit} />
        <Button label={COPY.skip} onPress={next} variant="link" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.md,
  },
}))
