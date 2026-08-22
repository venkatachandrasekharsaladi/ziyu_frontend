import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { formatDate } from '@/utils/formatStoryDate'

/**
 * M03-S02 — Memory Detail. Stitch screen b5e4bef3.
 *
 * "Share to Chat" and "More" are dropped: chat does not exist, and an overflow
 * menu with nothing behind it is worse than no menu. Favourite is real, because
 * the service supports it.
 */
export function MemoryDetailScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [memory, setMemory] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.get({ id: String(id) })

      if (cancelled) return

      if (result.ok) setMemory(result.value)
      else setError(COPY.detail.errors[result.error.code])

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

    if (result.ok) setMemory(result.value)
  }, [memory])

  const back = useCallback(() => router.replace('/(app)/memories'), [router])

  if (!loaded) return <AppScreenLayout activeTab="memories" onBack={router.back} />

  if (!memory) {
    return (
      <AppScreenLayout activeTab="memories" onBack={router.back}>
        <StatusScreen
          heading={error ?? COPY.detail.missing}
          actions={<Button label={COPY.detail.back} onPress={back} />}
        />
      </AppScreenLayout>
    )
  }

  return (
    <AppScreenLayout activeTab="memories" onBack={router.back}>
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {memory.title}
        </Text>

        <Text variant="footnote" tone="body">
          {[formatDate(memory.date), memory.location].filter(Boolean).join(' · ')}
        </Text>
      </View>

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
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
}))
