import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { memoriesService } from '@/services/memories'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M03-S03 — Add Memory. Stitch screen 510bd9c6.
 *
 * Only the title is required. Everything the design marks optional stays
 * optional, and the private "Our Note" keeps its own label so it is obvious
 * which field the partner will read.
 */
export function AddMemoryScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')
  const profile = useRelationshipStore((state) => state.profile)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = useCallback(async () => {
    if (!title.trim()) {
      setError(COPY.add.titleRequired)
      return
    }

    setSaving(true)
    setFormError(null)

    const result = await memoriesService.create({
      title: title.trim(),
      date,
      caption: caption.trim() || undefined,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
      tags: [],
      addedBy: profile?.name,
    })

    setSaving(false)

    if (!result.ok) {
      setFormError(COPY.add.errors[result.error.code])
      return
    }

    // replace, not push: going "back" to a blank form from the memory you just
    // saved is not a place anyone wants to return to.
    router.replace('/(app)/memories')
  }, [title, date, caption, location, note, profile, router])

  const onPickPhoto = useCallback(() => {}, [])

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <Text variant="h2" tone="heading" align="center">
        {COPY.add.heading}
      </Text>

      <View style={styles.photo}>
        <PhotoPicker label={COPY.add.photoLabel} name={title} onPick={onPickPhoto} />
      </View>

      <View style={styles.form}>
        <Input
          label={COPY.add.titleLabel}
          value={title}
          onChangeText={(next) => {
            setTitle(next)
            setError(null)
          }}
          placeholder={COPY.add.titlePlaceholder}
          autoCapitalize="sentences"
          error={error ?? undefined}
        />

        <DateField label={COPY.add.dateLabel} value={date} onChangeText={setDate} />

        <Input
          label={COPY.add.captionLabel}
          value={caption}
          onChangeText={setCaption}
          placeholder={COPY.add.captionPlaceholder}
          autoCapitalize="sentences"
          multiline
        />

        <Input
          label={COPY.add.locationLabel}
          value={location}
          onChangeText={setLocation}
          placeholder={COPY.add.locationPlaceholder}
          autoCapitalize="words"
        />

        <Input
          label={COPY.add.noteLabel}
          value={note}
          onChangeText={setNote}
          placeholder={COPY.add.notePlaceholder}
          autoCapitalize="sentences"
          multiline
        />

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button label={COPY.add.submit} onPress={submit} loading={saving} />
        <Button label={COPY.add.cancel} onPress={back} variant="link" />
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  photo: {
    paddingBottom: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.md,
  },
}))
