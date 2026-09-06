import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { ALBUMS_COPY as COPY } from '@/copy/albums'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { AlbumCard } from '@/modules/module-03-memories/components/AlbumCard'
import { SAMPLE_ALBUMS } from '@/sample/albums'

/**
 * M03-S05 — Your albums. Figma `Ziyu`, Memories Page frame 2.
 *
 * Designed but never built: the frame was reachable from a "VIEW ALL" that the
 * Memories home did not have, so the whole album layer of the navigation was
 * missing. Six covers, two up, in the order the design lists them.
 */
export function AlbumsScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')

  const open = useCallback(
    (key: string) => router.push(`/(app)/memories/albums/${encodeURIComponent(key)}`),
    [router],
  )

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.head}>
        <Text variant="caption" tone="muted">
          {COPY.list.eyebrow.toUpperCase()}
        </Text>
        <Text variant="h2" tone="heading">
          {COPY.list.heading}
        </Text>
      </View>

      {SAMPLE_ALBUMS.length === 0 ? (
        <Text variant="body" tone="body">
          {COPY.list.empty}
        </Text>
      ) : (
        <View style={styles.grid}>
          {SAMPLE_ALBUMS.map((album) => (
            <AlbumCard key={album.key} album={album} onPress={open} />
          ))}
        </View>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
}))
