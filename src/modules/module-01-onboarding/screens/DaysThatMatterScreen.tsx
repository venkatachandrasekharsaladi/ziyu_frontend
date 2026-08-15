import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { DAYS_THAT_MATTER_COPY as COPY } from '@/copy/daysThatMatter'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import type { KeyDates } from '@/services/story/types'
import { useStoryStore } from '@/state/storyStore'

type DateKey = (typeof COPY.fields)[number]['key']

/**
 * M01-S17 — Days That Matter. Stitch screen c40a53a1.
 *
 * The design draws five tappable cards reading "Tap to set date", which implies
 * a picker the app does not have. Each is a `DateField` instead, so a date is
 * typed in place — the same control and the same interaction as every other
 * date in the flow.
 *
 * The fields are stacked plainly rather than wrapped in `Card`s. A card needs a
 * title, and `DateField` already renders one, so every row showed its name
 * twice. Stacked labelled fields is also exactly how M01-S02 and the auth forms
 * present themselves.
 *
 * All five are optional. Nothing here blocks Continue.
 */
export function DaysThatMatterScreen() {
  const router = useRouter()
  const setKeyDates = useStoryStore((state) => state.setKeyDates)

  const [dates, setDates] = useState<Record<DateKey, string>>({
    anniversary: '',
    yourBirthday: '',
    partnerBirthday: '',
    firstDate: '',
    firstMeeting: '',
  })

  const update = useCallback((key: DateKey, value: string) => {
    setDates((previous) => ({ ...previous, [key]: value }))
  }, [])

  const next = useCallback(() => router.push('/(onboarding)/story-recap'), [router])

  const submit = useCallback(() => {
    const filled: KeyDates = {}

    for (const [key, value] of Object.entries(dates)) {
      if (value) filled[key as DateKey] = value
    }

    setKeyDates(filled)
    next()
  }, [dates, setKeyDates, next])

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
        {COPY.fields.map((field) => (
          <DateField
            key={field.key}
            label={field.label}
            value={dates[field.key]}
            onChangeText={(value) => update(field.key, value)}
          />
        ))}
      </View>

      <View style={styles.actions}>
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
  actions: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
  },
}))
