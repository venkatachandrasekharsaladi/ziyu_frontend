import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { BECAME_US_COPY as COPY } from '@/copy/becameUs'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useStoryStore } from '@/state/storyStore'

/**
 * M01-S15 — When We Became Us. Stitch screen ca1092df.
 *
 * The optional fields say "(Optional)" in their labels, as drawn. Marking the
 * optional ones rather than the required one is the right way round here: only
 * the date carries weight, and the user should be able to see at a glance which
 * fields they can leave alone.
 */
export function BecameUsScreen() {
  const router = useRouter()
  const setBecameUs = useStoryStore((state) => state.setBecameUs)

  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  const next = useCallback(() => router.push('/(onboarding)/first-memory'), [router])

  const submit = useCallback(() => {
    setBecameUs({
      date: date || undefined,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
    })
    next()
  }, [date, location, note, setBecameUs, next])

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
        <DateField label={COPY.dateLabel} value={date} onChangeText={setDate} />

        <Input
          label={COPY.locationLabel}
          value={location}
          onChangeText={setLocation}
          placeholder={COPY.locationPlaceholder}
          autoCapitalize="words"
        />

        <Input
          label={COPY.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder={COPY.notePlaceholder}
          autoCapitalize="sentences"
          multiline
        />

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
