import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { VIDEO_PICK_COPY } from '@/copy/videoPick'
import { VOICE_RECORDER_COPY } from '@/copy/voiceRecorder'
import { MemoryVideoPlayer } from '@/design-system/patterns/MemoryVideoPlayer'
import { MemoryVoicePlayer } from '@/design-system/patterns/MemoryVoicePlayer'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { usePhotoPick } from '@/hooks/usePhotoPick'
import { useVideoPick } from '@/hooks/useVideoPick'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'

export type MemoryFormValues = {
  title: string
  date: string
  caption?: string
  location?: string
  note?: string
  photoUri?: string
  videoUri?: string
  voiceUri?: string
  voiceDurationMs?: number
}

type MemoryFormProps = {
  initial?: MemoryFormValues
  submitLabel: string
  onCancel: () => void
  /** Returns an error sentence on failure, or `null` on success. */
  onSubmit: (values: MemoryFormValues) => Promise<string | null>
}

/**
 * The Add/Edit Memory form, shared — the two screens differ only in what
 * they start with and what they call on submit (`create` vs `update`), not
 * in a single field, button or validation rule.
 */
export function MemoryForm({ initial, submitLabel, onCancel, onSubmit }: MemoryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [caption, setCaption] = useState(initial?.caption ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [photoUri, setPhotoUri] = useState<string | null>(initial?.photoUri ?? null)
  const [videoUri, setVideoUri] = useState<string | null>(initial?.videoUri ?? null)
  const [voice, setVoice] = useState<{ uri: string; durationMs: number } | null>(
    initial?.voiceUri ? { uri: initial.voiceUri, durationMs: initial.voiceDurationMs ?? 0 } : null,
  )

  const [titleError, setTitleError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { pick, error: photoError } = usePhotoPick(setPhotoUri, {
    allowsEditing: true,
    aspect: [4, 3],
  })

  const { pick: pickVideo, error: videoError } = useVideoPick((video) => setVideoUri(video.uri))

  const recorder = useVoiceRecorder()

  const stopRecording = useCallback(async () => {
    const clip = await recorder.stop()
    if (clip) setVoice(clip)
  }, [recorder])

  const submit = useCallback(async () => {
    if (!title.trim()) {
      setTitleError(COPY.add.titleRequired)
      return
    }

    setSaving(true)
    setFormError(null)

    const error = await onSubmit({
      title: title.trim(),
      date,
      caption: caption.trim() || undefined,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
      photoUri: photoUri ?? undefined,
      videoUri: videoUri ?? undefined,
      voiceUri: voice?.uri,
      voiceDurationMs: voice?.durationMs,
    })

    setSaving(false)
    if (error) setFormError(error)
  }, [title, date, caption, location, note, photoUri, videoUri, voice, onSubmit])

  return (
    <>
      <View style={styles.photo}>
        <PhotoPicker label={COPY.add.photoLabel} name={title} uri={photoUri} onPick={pick} />

        {photoError ? (
          <Text variant="footnote" tone="error" align="center">
            {photoError}
          </Text>
        ) : null}
      </View>

      <View style={styles.form}>
        <Input
          label={COPY.add.titleLabel}
          value={title}
          onChangeText={(next) => {
            setTitle(next)
            setTitleError(null)
          }}
          placeholder={COPY.add.titlePlaceholder}
          autoCapitalize="sentences"
          error={titleError ?? undefined}
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

        <View style={styles.media}>
          {videoUri ? (
            <View style={styles.mediaBlock}>
              <MemoryVideoPlayer uri={videoUri} />
              <Button label={VIDEO_PICK_COPY.remove} onPress={() => setVideoUri(null)} variant="link" />
            </View>
          ) : (
            <Button label={VIDEO_PICK_COPY.choose} onPress={pickVideo} variant="outline" />
          )}

          {videoError ? (
            <Text variant="footnote" tone="error" align="center">
              {videoError}
            </Text>
          ) : null}

          {voice ? (
            <View style={styles.mediaBlock}>
              <MemoryVoicePlayer uri={voice.uri} fallbackDurationMs={voice.durationMs} />
              <Button label={VOICE_RECORDER_COPY.remove} onPress={() => setVoice(null)} variant="link" />
            </View>
          ) : (
            <Button
              label={recorder.isRecording ? VOICE_RECORDER_COPY.stop : VOICE_RECORDER_COPY.record}
              onPress={recorder.isRecording ? stopRecording : recorder.start}
              variant="outline"
            />
          )}

          {recorder.error ? (
            <Text variant="footnote" tone="error" align="center">
              {recorder.error}
            </Text>
          ) : null}
        </View>

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button label={submitLabel} onPress={submit} loading={saving} />
        <Button label={COPY.add.cancel} onPress={onCancel} variant="link" />
      </View>
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  photo: {
    paddingBottom: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.md,
  },
  media: {
    gap: theme.spacing.sm,
  },
  mediaBlock: {
    gap: theme.spacing.xs,
  },
}))
