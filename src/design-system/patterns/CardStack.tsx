import { type ReactNode, useCallback, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type CardStackProps<T> = {
  items: readonly T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  testID?: string
}

/**
 * A swipeable deck: the front card full-size, with the edges of up to two
 * more peeking out behind it, bottom-right — the "flash cards" and
 * "upcoming events" stacks both draw this, so it lives once, here.
 *
 * The peek layers are plain tinted panels, not scaled copies of the next
 * card's content: real cards vary in height (a stat versus an event row),
 * and a sliver of colour reads as "there's more" just as well as a shrunk
 * duplicate would, without needing to measure anything.
 *
 * Paging is the same `ScrollView` + `pagingEnabled` technique as
 * `PhotoCarousel`, for the same reason: the platform's own drag direction,
 * rather than a hand-rolled gesture that risks inverting it.
 */
export function CardStack<T>({ items, renderItem, keyExtractor, testID }: CardStackProps<T>) {
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }, [])

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return

      const next = Math.round(e.nativeEvent.contentOffset.x / width)

      setIndex(Math.max(0, Math.min(items.length - 1, next)))
    },
    [width, items.length],
  )

  if (items.length === 0) return null

  const peekCount = Math.min(2, items.length - 1 - index)

  return (
    <View>
      <View style={styles.stack}>
        {/* Farthest first, so the front card paints last and sits on top. */}
        {peekCount === 2 ? <View style={styles.peekFar} testID={`${testID}-peek-2`} /> : null}
        {peekCount >= 1 ? <View style={styles.peekNear} testID={`${testID}-peek-1`} /> : null}

        <View onLayout={onLayout} style={styles.front}>
          {items.length === 1 ? (
            renderItem(items[0]!, 0)
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              onScrollEndDrag={onScrollEnd}
              scrollEventThrottle={16}
              testID={testID ? `${testID}-scroll` : undefined}
            >
              {items.map((item, i) => (
                <View key={keyExtractor(item, i)} style={{ width: width || '100%' }}>
                  {renderItem(item, i)}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {items.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {items.map((item, i) => (
            <View
              key={`dot-${keyExtractor(item, i)}`}
              style={[styles.dot, i === index ? styles.dotOn : null]}
              testID={testID ? `${testID}-dot-${i}${i === index ? '-on' : ''}` : undefined}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  // Reserves room for the peek layers, which sit outside the front card's
  // own box on its bottom-right.
  stack: {
    position: 'relative',
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  front: {
    borderRadius: theme.radii.field,
    overflow: 'hidden',
  },
  peekNear: {
    position: 'absolute',
    top: 6,
    left: 5,
    right: 1,
    bottom: 1,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.field,
  },
  peekFar: {
    position: 'absolute',
    top: 12,
    left: 10,
    right: -4,
    bottom: -4,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.field,
    opacity: 0.6,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border.subtle,
  },
  dotOn: {
    backgroundColor: theme.colors.brand.primary,
    width: 16,
  },
}))
