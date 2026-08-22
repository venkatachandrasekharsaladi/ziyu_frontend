import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ALBUMS_COPY as COPY } from '@/copy/albums'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { SAMPLE_HOME } from '@/sample/home'
import { findAlbum, memoriesInAlbum } from '@/sample/albums'

/**
 * M03-S06 — Album Detail. Figma `Ziyu`, Memories Page frame 3 ("Trips ✈️").
 *
 * The design gives the album a cover hero with the title reversed out over it,
 * then a mixed feed: photos with a location chip, a text note, video tiles. The
 * videos are drawn but there is no video in the data model and no player
 * installed, so a video memory renders as its still — the one place this screen
 * knowingly stops short of the frame.
 */
export function AlbumDetailScreen() {
  const { theme } = useUnistyles()
  const router = useRouter()
  const { key } = useLocalSearchParams<{ key: string }>()
  const album = findAlbum(decodeURIComponent(key ?? ''))

  const open = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])
  const back = useCallback(() => router.back(), [router])

  if (!album) {
    return (
      <AppScreenLayout activeTab="memories" onBack={back}>
        <Text variant="body" tone="body">
          {COPY.detail.missing}
        </Text>
        <Button label={COPY.detail.back} onPress={back} variant="outline" />
      </AppScreenLayout>
    )
  }

  const memories = memoriesInAlbum(album)

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.hero}>
        <Image
          source={{ uri: album.coverUri }}
          // Plain style object — Unistyles styles do not reach expo-image.
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 180,
            backgroundColor: theme.colors.surface.soft,
          }}
          contentFit="cover"
          transition={200}
          testID={`album-hero-${album.key}`}
        />

        <View style={styles.heroText}>
          <Text variant="h2" tone="onPrimary">
            {album.label} {album.emoji}
          </Text>
          <Text variant="caption" tone="onPrimary">
            {COPY.detail.subtitle(album.sampleCount, SAMPLE_HOME.coupleName)}
          </Text>
        </View>
      </View>

      {memories.length === 0 ? (
        <Text variant="body" tone="body">
          {COPY.detail.empty}
        </Text>
      ) : (
        <View style={styles.feed}>
          {memories.map((memory) => (
            <PhotoMemoryCard key={memory.id} memory={memory} onPress={open} />
          ))}
        </View>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    width: '100%',
    height: 180,
    borderRadius: theme.radii.field,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.surface.soft,
  },
  heroText: {
    gap: 2,
    padding: theme.spacing.lg,
    // The design reverses the title out over the photo. A scrim keeps it legible
    // whatever the cover happens to be, which a plain overlay would not.
    backgroundColor: theme.colors.surface.scrim,
  },
  feed: {
    gap: theme.spacing.lg,
  },
}))
