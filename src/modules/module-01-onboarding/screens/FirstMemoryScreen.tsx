import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FIRST_MEMORY_COPY as COPY } from '@/copy/firstMemory'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'

/**
 * M01-S16 — The First Memory. Stitch screen 27e3de10.
 *
 * One memory, deliberately: enough that the recap has something in it, without
 * turning setup into data entry.
 */
export function FirstMemoryScreen() {
  const router = useRouter()
  const setFirstMemory = useStoryStore((state) => state.setFirstMemory)
  const profile = useRelationshipStore((state) => state.profile)

  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const next = useCallback(() => router.push('/(onboarding)/days-that-matter'), [router])

  const submit = useCallback(() => {
    setFirstMemory({ date: date || undefined, note: note.trim() || undefined })
    next()
  }, [date, note, setFirstMemory, next])

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
        <PhotoPicker label={COPY.photoLabel} name={profile?.name ?? ''} onPick={onPickPhoto} />
      </View>

      <View style={styles.form}>
        <DateField label={COPY.dateLabel} value={date} onChangeText={setDate} />

        <Input
          label={COPY.captionLabel}
          value={note}
          onChangeText={setNote}
          placeholder={COPY.captionPlaceholder}
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
