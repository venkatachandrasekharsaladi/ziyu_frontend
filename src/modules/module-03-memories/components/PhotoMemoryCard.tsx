import { Feather } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PhotoCarousel } from '@/design-system/patterns/PhotoCarousel'
import { PhotoLightbox } from '@/design-system/patterns/PhotoLightbox'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import { photosOf } from '@/modules/module-03-memories/photos'
import type { Memory } from '@/services/memories/types'

type PhotoMemoryCardProps = {
  memory: Memory
  onPress: (id: string) => void
  /** `hero` is the full-width polaroid; `tile` is the grid cell. */
  size?: 'hero' | 'tile'
  /** Small overlay label — the design's "YESTERDAY" / "SEP 12 '23" chips. */
  badge?: string
  /**
   * What tapping the PHOTO does. `lightbox` opens it full screen, which is the
   * right default. `press` sends the tap to `onPress` instead, for the one place
   * a photo is a door to a screen rather than to itself — the "On this day"
   * hero on the memories library.
   */
  photoTap?: 'lightbox' | 'press'
}

/**
 * The polaroid the design draws — photos, then a handwritten-feeling caption on
 * the card below them.
 *
 * The photo area is a carousel: a memory with several photos swipes between
 * them, one with a single photo renders as a plain image. Tapping a photo opens
 * it full screen; tapping the caption opens the memory. Those are two different
 * intentions and they now have two different targets.
 *
 * A memory with no photo still renders — the frame collapses and the text card
 * stands alone, which is how the design's voice-note and quote cards look.
 */
export function PhotoMemoryCard({
  memory,
  onPress,
  size = 'hero',
  badge,
  photoTap = 'lightbox',
}: PhotoMemoryCardProps) {
  const { theme } = useUnistyles()
  const [openAt, setOpenAt] = useState<number | null>(null)

  styles.useVariants({ size })

  const photos = photosOf(memory)

  const onPressPhoto = useCallback(
    (index: number) => {
      if (photoTap === 'press') onPress(memory.id)
      else setOpenAt(index)
    },
    [photoTap, onPress, memory.id],
  )

  return (
    <View style={styles.frame}>
      {photos.length > 0 ? (
        <View style={styles.photoWrap}>
          <PhotoCarousel
            photos={photos}
            height={size === 'hero' ? 260 : 150}
            onPressPhoto={onPressPhoto}
            label={memory.title}
            testID={`memory-photo-${memory.id}`}
          />

          {badge ? (
            <View style={styles.badge} pointerEvents="none">
              <Text variant="caption" tone="onPrimary">
                {badge}
              </Text>
            </View>
          ) : null}

          {memory.location ? (
            <View style={styles.locationChip} pointerEvents="none">
              <Feather name="map-pin" size={10} color={theme.colors.brand.primary} />
              <Text variant="caption" tone="brand">
                {memory.location}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <PressableScale onPress={() => onPress(memory.id)} accessibilityLabel={memory.title}>
        <View style={styles.caption}>
          <View style={styles.captionHead}>
            <Text variant="footnote" tone="heading">
              {memory.title}
            </Text>
            <View style={styles.spacer} />
            {memory.favorite ? (
              <Feather name="heart" size={12} color={theme.colors.brand.primary} />
            ) : null}
          </View>

          {memory.caption ? (
            <Text variant="caption" tone="body">
              {memory.caption}
            </Text>
          ) : null}
        </View>
      </PressableScale>

      <PhotoLightbox
        photos={photos}
        initialIndex={openAt ?? 0}
        visible={openAt !== null}
        onClose={() => setOpenAt(null)}
        caption={memory.title}
      />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  frame: {
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
    overflow: 'hidden',
    variants: {
      size: {
        hero: { width: '100%' },
        tile: { flex: 1 },
      },
    },
  },
  photoWrap: {
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.surface.field,
  },
  badge: {
    position: 'absolute',
    left: theme.spacing.sm,
    bottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.brand.primary,
  },
  locationChip: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.card,
  },
  caption: {
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
  },
  captionHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
}))
