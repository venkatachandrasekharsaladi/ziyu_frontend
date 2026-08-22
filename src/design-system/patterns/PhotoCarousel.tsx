import { Image } from 'expo-image'
import { useCallback, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type PhotoCarouselProps = {
  photos: string[]
  height: number
  /** Fired with the index tapped. Omit to make the photos non-interactive. */
  onPressPhoto?: (index: number) => void
  /** Screen-reader label for a single page; the index is appended. */
  label?: string
  testID?: string
}

/**
 * A swipeable run of photos, one per page, with a dot per page.
 *
 * Paging is a plain `ScrollView` with `pagingEnabled` rather than a gesture
 * handler: it gives the platform's own physics and, importantly, the platform's
 * own DIRECTION — dragging left brings the next photo in, because the content
 * follows your finger. A hand-rolled gesture is where carousels get inverted.
 *
 * A single photo renders as a plain image with no dots and no scrolling, so this
 * is safe to use wherever a photo appears rather than only where several do.
 */
export function PhotoCarousel({
  photos,
  height,
  onPressPhoto,
  label = 'Photo',
  testID,
}: PhotoCarouselProps) {
  const { theme } = useUnistyles()
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }, [])

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return

      const next = Math.round(e.nativeEvent.contentOffset.x / width)

      setIndex(Math.max(0, Math.min(photos.length - 1, next)))
    },
    [width, photos.length],
  )

  if (photos.length === 0) return null

  // Plain style object — Unistyles styles do not reach expo-image.
  const photoStyle = {
    width: width || '100%',
    height,
    backgroundColor: theme.colors.surface.field,
  } as const

  const page = (uri: string, i: number) =>
    onPressPhoto ? (
      <Pressable
        key={`${uri}-${i}`}
        onPress={() => onPressPhoto(i)}
        accessibilityRole="button"
        // Never bare `label`: the card's caption is already labelled with the
        // memory's title, and two elements sharing one accessible name is both
        // ambiguous to a screen reader and unaddressable in a test.
        accessibilityLabel={
          photos.length > 1 ? `${label}, photo ${i + 1} of ${photos.length}` : `${label}, photo`
        }
      >
        <Image
          source={{ uri }}
          style={photoStyle}
          contentFit="cover"
          transition={200}
          testID={testID ? `${testID}-${i}` : undefined}
        />
      </Pressable>
    ) : (
      <Image
        key={`${uri}-${i}`}
        source={{ uri }}
        style={photoStyle}
        contentFit="cover"
        transition={200}
        testID={testID ? `${testID}-${i}` : undefined}
      />
    )

  if (photos.length === 1) {
    return (
      <View onLayout={onLayout} style={styles.frame}>
        {page(photos[0], 0)}
      </View>
    )
  }

  return (
    <View onLayout={onLayout} style={styles.frame}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        // Web has no momentum event; this keeps the dots honest there too.
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
        testID={testID ? `${testID}-scroll` : undefined}
      >
        {photos.map(page)}
      </ScrollView>

      <View style={styles.dots} pointerEvents="none">
        {photos.map((uri, i) => (
          <View
            key={`dot-${uri}-${i}`}
            style={[styles.dot, i === index ? styles.dotOn : null]}
            testID={testID ? `${testID}-dot-${i}${i === index ? '-on' : ''}` : undefined}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  frame: {
    width: '100%',
    position: 'relative',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.card,
    opacity: 0.5,
  },
  dotOn: {
    opacity: 1,
    // Slightly wider when active, so the current page reads without colour.
    width: 16,
  },
}))
