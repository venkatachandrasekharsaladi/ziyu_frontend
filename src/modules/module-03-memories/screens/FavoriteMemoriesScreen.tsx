import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

/**
 * Favorites — every memory with `favorite: true`, in one place.
 *
 * The toggle already lived on `MemoryDetailScreen`; this is its filtered view,
 * the same relationship `OnThisDayScreen` has to the full library (load once,
 * filter, reuse the same two card components).
 */
export function FavoriteMemoriesScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')
  const [memories, setMemories] = useState<Memory[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.list()

      if (cancelled) return

      const live = result.ok ? result.value : []

      setMemories(live.length === 0 && USE_SAMPLE_CONTENT ? SAMPLE_MEMORIES : live)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const open = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])

  if (memories === null) return <AppScreenLayout activeTab="memories" onBack={back} />

  const favorites = memories.filter((m) => m.favorite)

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {COPY.favorites.heading}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <Text variant="body" tone="body">
          {COPY.favorites.empty}
        </Text>
      ) : (
        <View style={styles.list}>
          {favorites.map((memory) =>
            memory.photoUri ? (
              <PhotoMemoryCard key={memory.id} memory={memory} onPress={open} />
            ) : (
              <MemoryCard key={memory.id} memory={memory} onPress={open} />
            ),
          )}
        </View>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
}))
