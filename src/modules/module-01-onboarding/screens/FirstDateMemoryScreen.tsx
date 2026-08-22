import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FIRST_DATE_COPY as COPY } from '@/copy/firstDate'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'

/**
 * M01-S14 — First Date Memory. Stitch screen 3b933246.
 *
 * The source markup splits this into a form column and a live-preview column,
 * but that split is `lg:grid-cols-12` and the base is `grid-cols-1`. At phone
 * width the design already stacks, so this is the drawn layout rather than a
 * deviation from it — and the preview column is dropped, since a preview of a
 * card the user is looking at adds nothing on a 390pt screen.
 *
 * Every field is optional. Skipping is offered on every capture screen.
 */
export function FirstDateMemoryScreen() {
  const router = useRouter()
  const setFirstDate = useStoryStore((state) => state.setFirstDate)
  const profile = useRelationshipStore((state) => state.profile)

  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  const next = useCallback(() => router.push('/(onboarding)/became-us'), [router])

  const submit = useCallback(() => {
    setFirstDate({
      date: date || undefined,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
    })
    next()
  }, [date, location, note, setFirstDate, next])

  // expo-image-picker lands in Phase 6; the well is real and does nothing yet.
  const onPickPhoto = useCallback(() => {}, [])

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

      <View style={styles.photo}>
        <PhotoPicker
          label={COPY.photoLabel}
          name={profile?.name ?? ''}
          onPick={onPickPhoto}
        />
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
          label={COPY.memoryLabel}
          value={note}
          onChangeText={setNote}
          placeholder={COPY.memoryPlaceholder}
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
    paddingBottom: theme.spacing.xxxl,
  },
  photo: {
    paddingBottom: theme.spacing.xxxl,
  },
  form: {
    gap: theme.spacing.md,
  },
}))
