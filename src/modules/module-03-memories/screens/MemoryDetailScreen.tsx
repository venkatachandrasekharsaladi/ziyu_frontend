import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { MemoryVideoPlayer } from '@/design-system/patterns/MemoryVideoPlayer'
import { MemoryVoicePlayer } from '@/design-system/patterns/MemoryVoicePlayer'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { formatDate } from '@/utils/formatStoryDate'

/**
 * M03-S02 — Memory Detail. Stitch screen b5e4bef3.
 *
 * "Share to Chat" and "More" are dropped: chat does not exist, and an overflow
 * menu with nothing behind it is worse than no menu. Favourite, edit and
 * delete are real, because the service supports all three.
 *
 * SAMPLE-MEMORY FALLBACK. Every list screen already falls back to
 * `SAMPLE_MEMORIES` when the real store is empty, but this screen only ever
 * asked the real store for ONE id — a sample memory's id was never seeded
 * into it, so opening one from any list read as "That memory could not be
 * found." `load` now checks `SAMPLE_MEMORIES` on a `NOT_FOUND`, and
 * `toggleFavorite` keeps working for that memory the same way — flipping the
 * flag locally when the real store has never heard of the id, rather than
 * silently doing nothing.
 */
export function MemoryDetailScreen() {
  const back = useBackTo('/(app)/memories')
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [memory, setMemory] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.get({ id: String(id) })

      if (cancelled) return

      if (result.ok) {
        setMemory(result.value)
      } else if (result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT) {
        const sample = SAMPLE_MEMORIES.find((m) => m.id === id)

        if (sample) setMemory(sample)
        else setError(COPY.detail.errors[result.error.code])
      } else {
        setError(COPY.detail.errors[result.error.code])
      }

      setLoaded(true)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [id])

  const toggleFavorite = useCallback(async () => {
    if (!memory) return

    const result = await memoriesService.toggleFavorite({ id: memory.id })

    if (result.ok) {
      setMemory(result.value)
    } else if (result.error.code === 'NOT_FOUND') {
      setMemory((current) => (current ? { ...current, favorite: !current.favorite } : current))
    }
  }, [memory])

  const edit = useCallback(() => {
    if (!memory) return
    router.push(`/(app)/memories/edit/${memory.id}`)
  }, [memory, router])

  const confirmDelete = useCallback(() => setConfirmingDelete(true), [])
  const cancelDelete = useCallback(() => setConfirmingDelete(false), [])

  const deleteMemory = useCallback(async () => {
    if (!memory) return

    const result = await memoriesService.delete({ id: memory.id })

    // A sample memory has no real record to delete — proceed anyway rather
    // than leaving the confirm dialog stuck open over a failure that was
    // never going to happen.
    if (!result.ok && !(result.error.code === 'NOT_FOUND' && USE_SAMPLE_CONTENT)) return

    setConfirmingDelete(false)
    router.replace('/(app)/memories')
  }, [memory, router])

  if (!loaded) return <AppScreenLayout activeTab="memories" onBack={back} />

  if (!memory) {
    return (
      <AppScreenLayout activeTab="memories" onBack={back}>
        <StatusScreen
          heading={error ?? COPY.detail.missing}
          actions={<Button label={COPY.detail.back} onPress={back} />}
        />
      </AppScreenLayout>
    )
  }

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {memory.title}
        </Text>

        <Text variant="footnote" tone="body">
          {[formatDate(memory.date), memory.location].filter(Boolean).join(' · ')}
        </Text>
      </View>

      {memory.photoUri ? (
        <Image
          source={{ uri: memory.photoUri }}
          // Plain style object — Unistyles styles do not reach expo-image.
          style={{
            width: '100%',
            height: 260,
            borderRadius: theme.radii.field,
            backgroundColor: theme.colors.surface.field,
          }}
          contentFit="cover"
          transition={200}
          testID="memory-detail-photo"
        />
      ) : null}

      {memory.videoUri ? <MemoryVideoPlayer uri={memory.videoUri} testID="memory-detail-video" /> : null}

      {memory.voiceUri ? (
        <MemoryVoicePlayer uri={memory.voiceUri} fallbackDurationMs={memory.voiceDurationMs} />
      ) : null}

      {memory.caption ? (
        <Text variant="body" tone="body">
          {memory.caption}
        </Text>
      ) : null}

      {memory.note ? (
        <Card>
          <Text variant="caption" tone="body">
            {COPY.detail.noteLabel}
          </Text>
          <Text variant="footnote" tone="body">
            {memory.note}
          </Text>
        </Card>
      ) : null}

      {memory.addedBy ? (
        <Text variant="footnote" tone="body">
          {COPY.detail.addedBy(memory.addedBy)}
        </Text>
      ) : null}

      <Button
        label={memory.favorite ? COPY.detail.unfavorite : COPY.detail.favorite}
        onPress={toggleFavorite}
        variant={memory.favorite ? 'soft' : 'outline'}
        trailing={
          <Feather
            name="heart"
            size={16}
            color={memory.favorite ? theme.colors.brand.primary : theme.colors.text.body}
          />
        }
      />

      <View style={styles.actions}>
        <Button label={COPY.detail.edit} onPress={edit} variant="outline" />
        <Button label={COPY.detail.delete} onPress={confirmDelete} variant="outline" />
      </View>

      <ConfirmDialog
        visible={confirmingDelete}
        title={COPY.detail.deleteConfirm.title}
        body={COPY.detail.deleteConfirm.body}
        confirmLabel={COPY.detail.deleteConfirm.confirm}
        cancelLabel={COPY.detail.deleteConfirm.cancel}
        onConfirm={deleteMemory}
        onCancel={cancelDelete}
        destructive
      />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
}))
