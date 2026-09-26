import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { MEMORIES_COPY as COPY } from '@/copy/memories'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AlbumCard } from '@/modules/module-03-memories/components/AlbumCard'
import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { SAMPLE_ALBUMS } from '@/sample/albums'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'
import { formatDate } from '@/utils/formatStoryDate'

/**
 * Every album, in the rail.
 *
 * The frame shows card 3 hanging 46pt past the edge and card 4 hanging 190pt
 * past it — that is a horizontal scroller caught mid-scroll, so the rail carries
 * the whole set and lets the next card peek, rather than stopping at three.
 */
const ALBUM_RAIL = SAMPLE_ALBUMS

/** Card width + gap, so the rail settles with a card edge against the inset. */
const RAIL_SNAP = 116 + 12

/**
 * M03-S01 — Memories Home. Figma `Ziyu`, Memories Page frame 1.
 *
 * The frame stacks four things the previous build did not have: the count line,
 * "On this day", a "Your albums" rail with a View all, and "Recently added".
 * The flat list that used to be here was the whole screen; it is now the
 * "Recently added" section, which is what the design uses it for.
 *
 * Sample content fills in when the service is empty — see `src/sample`. Turn
 * `USE_SAMPLE_CONTENT` off and the empty state below is what a new couple sees.
 */
export function MemoriesHomeScreen() {
  const router = useRouter()
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

  const add = useCallback(() => router.push('/(app)/memories/new'), [router])
  const search = useCallback(() => router.push('/(app)/memories/search'), [router])
  const favorites = useCallback(() => router.push('/(app)/memories/favorites'), [router])
  const open = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])
  const albums = useCallback(() => router.push('/(app)/memories/albums'), [router])
  const onThisDayScreen = useCallback(() => router.push('/(app)/memories/on-this-day'), [router])
  const openAlbum = useCallback(
    (key: string) => router.push(`/(app)/memories/albums/${encodeURIComponent(key)}`),
    [router],
  )

  // Still loading: render the chrome, not a spinner that flashes for 600ms.
  if (memories === null) return <AppScreenLayout activeTab="memories" />

  if (memories.length === 0) {
    return (
      <AppScreenLayout activeTab="memories">
        <StatusScreen
          heading={COPY.empty.heading}
          lede={COPY.empty.lede}
          actions={<Button label={COPY.empty.addFirst} onPress={add} />}
        />
      </AppScreenLayout>
    )
  }

  // "On this day" leads with a favourite that has a photo — the design's hero is
  // a polaroid, so a text-only memory there would draw an empty frame.
  const onThisDay = memories.find((m) => m.photoUri && m.favorite) ?? memories[0]
  const recent = memories.filter((m) => m.id !== onThisDay?.id).slice(0, 6)

  return (
    <AppScreenLayout activeTab="memories">
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {COPY.home.heading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.home.count(memories.length)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label={COPY.home.add} onPress={add} />
        <Button label={COPY.home.search} onPress={search} variant="outline" />
        <Button label={COPY.home.favoritesLabel} onPress={favorites} variant="outline" />
      </View>

      {onThisDay ? (
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHead}
            onPress={onThisDayScreen}
            accessibilityRole="button"
            accessibilityLabel={COPY.home.onThisDayLabel}
          >
            <Text variant="labelStrong" tone="heading">
              {COPY.home.onThisDayLabel}
            </Text>
            <View style={styles.spacer} />
            <Text variant="caption" tone="muted">
              {[formatDate(onThisDay.date), onThisDay.location].filter(Boolean).join(' · ')}
            </Text>
          </Pressable>

          {/* The hero opens the "On this day" SCREEN, not this one memory — the
              whole section is a door to that page, header and photo alike. */}
          {/* `photoTap="press"` so the PHOTO opens the On this day screen too,
              rather than the lightbox it opens everywhere else. */}
          <PhotoMemoryCard
            memory={onThisDay}
            onPress={onThisDayScreen}
            photoTap="press"
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="labelStrong" tone="heading">
            {COPY.home.albumsLabel}
          </Text>
          <View style={styles.spacer} />
          {/* A compact action, not a `Button`: the button's 56pt control height
              and block width pushed "Your albums" onto two lines. */}
          <Pressable onPress={albums} accessibilityRole="button" accessibilityLabel={COPY.home.viewAll}>
            <Text variant="captionAction" tone="link">
              {COPY.home.viewAll}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={RAIL_SNAP}
          decelerationRate="fast"
          contentContainerStyle={styles.rail}
        >
          {ALBUM_RAIL.map((album) => (
            <AlbumCard key={album.key} album={album} onPress={openAlbum} layout="rail" />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text variant="labelStrong" tone="heading">
          {COPY.home.recentlyAddedLabel}
        </Text>

        {/* The frame calls this section a bento grid: photos sit two-up, and the
            note and quote cards run the full width because their text needs it. */}
        <View style={styles.bento}>
          {recent
            .filter((memory) => memory.photoUri)
            .map((memory) => (
              <View key={memory.id} style={styles.bentoCell}>
                <PhotoMemoryCard memory={memory} onPress={open} size="tile" />
              </View>
            ))}
        </View>

        <View style={styles.list}>
          {recent
            .filter((memory) => !memory.photoUri)
            .map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onPress={open} />
            ))}
        </View>
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  actions: {
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  rail: {
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
  bento: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  bentoCell: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
  },
}))
