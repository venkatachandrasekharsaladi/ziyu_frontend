import { Image } from 'expo-image'
import { useCallback, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Modal,
  ScrollView,
  View,
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
import { Text } from '@/design-system/primitives/Text'

/**
 * The ground behind an opened photo.
 *
 * A local constant rather than a theme token, deliberately: a photo viewer's
 * ground is black in a light theme and a dark one alike, so it has no business
 * in a palette that is being split per-theme. `surface.scrim` is NOT reused —
 * 45% is tuned for reading a title over a cover, and at that opacity the page
 * beneath showed straight through the viewer.
 */
const BACKDROP = 'rgba(0, 0, 0, 0.93)'

type PhotoLightboxProps = {
  photos: string[]
  /** Which photo to open on. */
  initialIndex?: number
  visible: boolean
  onClose: () => void
  /** Shown under the photo — the memory's own title. */
  caption?: string
}

/**
 * A photo, full bleed, over everything else.
 *
 * Opened by tapping a photo anywhere it appears. Deliberately plain: a dark
 * ground, the photo, a caption and a close button. Swiping moves between photos
 * with the same paging as `PhotoCarousel`, so the gesture means the same thing
 * in both places.
 *
 * `contentFit` is `contain` here, not `cover` — a card crops to fit its layout,
 * but the point of opening a photo is to see all of it.
 */
export function PhotoLightbox({
  photos,
  initialIndex = 0,
  visible,
  onClose,
  caption,
}: PhotoLightboxProps) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [index, setIndex] = useState(initialIndex)

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout

    setSize({ width, height })
  }, [])

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (size.width <= 0) return

      const next = Math.round(e.nativeEvent.contentOffset.x / size.width)

      setIndex(Math.max(0, Math.min(photos.length - 1, next)))
    },
    [size.width, photos.length],
  )

  if (photos.length === 0) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID="photo-lightbox"
    >
      <View style={styles.ground} onLayout={onLayout}>
        <View style={styles.bar}>
          {photos.length > 1 ? (
            <Text variant="caption" tone="onPrimary">
              {index + 1} / {photos.length}
            </Text>
          ) : (
            <View />
          )}

          <IconButton
            icon="x"
            label="Close photo"
            onPress={onClose}
            tone="onMedia"
            testID="lightbox-close"
          />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
          contentOffset={{ x: initialIndex * size.width, y: 0 }}
          testID="lightbox-scroll"
        >
          {photos.map((uri, i) => (
            <View key={`${uri}-${i}`} style={{ width: size.width || '100%' }}>
              <Image
                source={{ uri }}
                // Plain style object — Unistyles styles do not reach expo-image.
                style={{ width: size.width || '100%', height: size.height * 0.7 }}
                contentFit="contain"
                transition={150}
                testID={`lightbox-photo-${i}`}
              />
            </View>
          ))}
        </ScrollView>

        {caption ? (
          <View style={styles.caption}>
            <Text variant="footnote" tone="onPrimary" align="center">
              {caption}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create((theme) => ({
  ground: {
    flex: 1,
    backgroundColor: BACKDROP,
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.huge,
  },
  caption: {
    position: 'absolute',
    bottom: theme.spacing.huge,
    left: theme.spacing.xl,
    right: theme.spacing.xl,
  },
}))
