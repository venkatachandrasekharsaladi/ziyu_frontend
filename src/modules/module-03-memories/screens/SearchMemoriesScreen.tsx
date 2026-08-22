import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

/**
 * M03-S04 — Search Memories. Stitch screen 17b6f431.
 *
 * The design offers suggestion chips — "Rome", "coffee", "Sarah" — built from
 * sample content. They are dropped rather than faked: suggesting a search for
 * something the couple never saved would return nothing and read as a bug.
 */
export function SearchMemoriesScreen() {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Memory[] | null>(null)
  const [libraryEmpty, setLibraryEmpty] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const all = await memoriesService.list()

      if (!cancelled && all.ok) setLibraryEmpty(all.value.length === 0)
    }

    void check()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!query.trim()) {
      setResults(null)
      return
    }

    async function run() {
      const result = await memoriesService.search({ query })

      if (!cancelled) setResults(result.ok ? result.value : [])
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [query])

  const open = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])

  return (
    <AppScreenLayout activeTab="memories" onBack={router.back}>
      <Input
        label={COPY.search.label}
        value={query}
        onChangeText={setQuery}
        placeholder={COPY.search.placeholder}
        autoCapitalize="none"
      />

      {libraryEmpty ? (
        <Text variant="footnote" tone="body" align="center">
          {COPY.search.emptyLibrary}
        </Text>
      ) : results === null ? (
        <Text variant="footnote" tone="body" align="center">
          {COPY.search.prompt}
        </Text>
      ) : results.length === 0 ? (
        <Text variant="footnote" tone="body" align="center">
          {COPY.search.none}
        </Text>
      ) : (
        <>
          <Text variant="caption" tone="body">
            {COPY.search.resultsLabel(results.length)}
          </Text>

          <View style={styles.list}>
            {results.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onPress={open} />
            ))}
          </View>
        </>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.spacing.md,
  },
}))
