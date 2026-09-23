import { type ReactNode, useCallback, useState } from 'react'
import { type LayoutChangeEvent, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'

const AnimatedScrollView = Animated.ScrollView

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
 * rather than a hand-rolled gesture that risks inverting it. On top of that,
 * the drag position itself drives motion — a page shrinks and dims as it
 * slides away from centre, and the peek layers tuck in as the next card
 * arrives — and a small spring "pop" plays on the peeks once a swipe
 * settles, like the deck resettling. All of it is driven by `scrollX`, a
 * shared value updated on the UI thread, never by React state — state here
 * exists only for `index` (what the dots and `peekCount` need) and `width`.
 */
export function CardStack<T>({ items, renderItem, keyExtractor, testID }: CardStackProps<T>) {
  const { theme } = useUnistyles()
  const reduced = useReducedMotion()
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)
  const scrollX = useSharedValue(0)
  const pop = useSharedValue(1)

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }, [])

  const settle = useCallback(
    (offsetX: number, pageWidth: number) => {
      if (pageWidth <= 0) return

      const next = Math.round(offsetX / pageWidth)

      setIndex(Math.max(0, Math.min(items.length - 1, next)))
    },
    [items.length],
  )

  const settleSpring = theme.motion.spring.settle

  // A worklet: everything in here runs on the UI thread, on every scroll
  // frame — no bridge round trip, which is what keeps the drag itself
  // perfectly smooth. `runOnJS` is the one hop back, and only on settle.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x)
    },
    onEndDrag: (event) => {
      runOnJS(settle)(event.contentOffset.x, width)
    },
    onMomentumEnd: (event) => {
      runOnJS(settle)(event.contentOffset.x, width)
      // The little bounce that reads as the stack resettling behind
      // whichever card just arrived in front.
      if (!reduced) {
        pop.set(withSequence(withSpring(1.08, settleSpring), withSpring(1, settleSpring)))
      }
    },
  })

  const peekNearStyle = useAnimatedStyle(() => {
    if (reduced || width <= 0) return { transform: [{ scale: 1 }], opacity: 1 }

    // Fractional progress through the CURRENT page, 0 at rest and rising
    // toward 1 as a forward swipe drags the next card into place. Dragging
    // backward (negative) is clamped away — the near peek has nothing to
    // do until a card is actually leaving toward it.
    const progress = scrollX.get() / width - index
    const scale = interpolate(progress, [0, 1], [1, 0.94], Extrapolation.CLAMP)
    const opacity = interpolate(progress, [0, 1], [1, 0.75], Extrapolation.CLAMP)

    return { transform: [{ scale: scale * pop.get() }], opacity }
  })

  const peekFarStyle = useAnimatedStyle(() => {
    if (reduced || width <= 0) return { transform: [{ scale: 1 }], opacity: 0.6 }

    const progress = scrollX.get() / width - index
    const scale = interpolate(progress, [0, 1], [1, 0.9], Extrapolation.CLAMP)
    const opacity = interpolate(progress, [0, 1], [0.6, 0.45], Extrapolation.CLAMP)

    return { transform: [{ scale: scale * pop.get() }], opacity }
  })

  if (items.length === 0) return null

  const peekCount = Math.min(2, items.length - 1 - index)

  return (
    <View>
      <View style={styles.stack}>
        {/* Farthest first, so the front card paints last and sits on top. */}
        {peekCount === 2 ? (
          <Animated.View style={[styles.peekFar, peekFarStyle]} testID={`${testID}-peek-2`} />
        ) : null}
        {peekCount >= 1 ? (
          <Animated.View style={[styles.peekNear, peekNearStyle]} testID={`${testID}-peek-1`} />
        ) : null}

        <View onLayout={onLayout} style={styles.front}>
          {items.length === 1 ? (
            renderItem(items[0]!, 0)
          ) : (
            <AnimatedScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              testID={testID ? `${testID}-scroll` : undefined}
            >
              {items.map((item, i) => (
                <CardStackPage key={keyExtractor(item, i)} index={i} width={width} scrollX={scrollX} reduced={reduced}>
                  {renderItem(item, i)}
                </CardStackPage>
              ))}
            </AnimatedScrollView>
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

type CardStackPageProps = {
  index: number
  width: number
  scrollX: ReturnType<typeof useSharedValue<number>>
  reduced: boolean
  children: ReactNode
}

/**
 * One page of the deck, sized to the stack's width and, unless the system
 * asked for reduced motion, shrinking and dimming as the drag carries it
 * away from centre in either direction — the counterpart to the peek
 * layers tucking in on the way past it.
 */
function CardStackPage({ index, width, scrollX, reduced, children }: CardStackPageProps) {
  const style = useAnimatedStyle(() => {
    if (reduced || width <= 0) return { transform: [{ scale: 1 }], opacity: 1 }

    const distance = scrollX.get() / width - index
    const scale = interpolate(distance, [-1, 0, 1], [0.94, 1, 0.94], Extrapolation.CLAMP)
    const opacity = interpolate(distance, [-1, 0, 1], [0.85, 1, 0.85], Extrapolation.CLAMP)

    return { transform: [{ scale }], opacity }
  })

  return <Animated.View style={[{ width: width || '100%' }, style]}>{children}</Animated.View>
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
