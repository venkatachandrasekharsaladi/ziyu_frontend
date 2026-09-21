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
import { USE_SAMPLE_CONTENT } from '@/sample'

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

  /*
   * GATED ON THE SAMPLE SWITCH, like Home and the Memories list already are.
   *
   * This screen read `SAMPLE_ALBUMS` directly, so flipping `USE_SAMPLE_CONTENT`
   * to false — the switch that exists precisely to show a new couple their real
   * empty app — left six invented albums sitting here with counts like "86" on
   * them. The empty state below was written and then unreachable.
   */
  const albums = USE_SAMPLE_CONTENT ? SAMPLE_ALBUMS : []

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

      {albums.length === 0 ? (
        <Text variant="body" tone="body">
          {COPY.list.empty}
        </Text>
      ) : (
        <View style={styles.grid}>
          {albums.map((album) => (
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
