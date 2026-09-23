import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { FIRST_MEMORY_COPY as COPY } from '@/copy/firstMemory'
import { usePhotoPick } from '@/hooks/usePhotoPick'
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
  const back = useBackTo('/(onboarding)/setup')
  const setFirstMemory = useStoryStore((state) => state.setFirstMemory)
  const profile = useRelationshipStore((state) => state.profile)

  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  /*
   * The real picker. This was `useCallback(() => {}, [])` while
   * `expo-image-picker` was uninstalled — a control that looked live and did
   * nothing. `usePhotoPick` owns the permission dance and treats cancelling as
   * a decision rather than an error; see the hook.
   */
  const { pick, error: photoError } = usePhotoPick(setPhotoUri, { allowsEditing: true, aspect: [4, 3] })

  const next = useCallback(() => router.push('/(onboarding)/days-that-matter'), [router])

  const submit = useCallback(() => {
    setFirstMemory({
      date: date || undefined,
      note: note.trim() || undefined,
      photoUri: photoUri ?? undefined,
    })
    next()
  }, [date, note, photoUri, setFirstMemory, next])


  return (
    <AuthScreenLayout onBack={back}>
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
          uri={photoUri}
          onPick={pick}
        />

        {photoError ? (
          <Text variant="footnote" tone="error" align="center">
            {photoError}
          </Text>
        ) : null}
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
