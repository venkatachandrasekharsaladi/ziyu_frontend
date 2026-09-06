import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { StyleSheet } from 'react-native-unistyles'

/** One cycle of a dot's rise and fall. Three dots share it, staggered. */
const CYCLE_MS = 500
/** The offset between dots, which is what makes the row read as a wave. */
const STAGGER_MS = 140

function Dot({ delay }: { delay: number }) {
  const reduced = useReducedMotion()
  const lift = useSharedValue(0)

  useEffect(() => {
    // Reduce-motion keeps all three dots, still and fully opaque: the bubble
    // must still say "typing", it just says it without moving.
    if (reduced) return
    lift.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: CYCLE_MS }), withTiming(0, { duration: CYCLE_MS })),
        -1,
        false,
      ),
    )
  }, [delay, lift, reduced])

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 + lift.value * 0.55,
    transform: [{ translateY: lift.value * -3 }],
  }))

  return <Animated.View style={[styles.dot, style]} />
}

/**
 * The "partner is typing" bubble.
 *
 * Drawn as a real incoming bubble rather than a line of text in the header:
 * typing happens at the end of the thread, where the message will land, and
 * that is where the eye is already looking. The three dots carry the whole
 * message, so the bubble needs no `Text` and none of the primitive's
 * tone/variant machinery — just the incoming fill and ink.
 */
export function TypingIndicator() {
  return (
    <View style={styles.bubble} accessibilityLabel="Partner is typing">
      {[0, 1, 2].map((i) => (
        <Dot key={i} delay={i * STAGGER_MS} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.chat.bubbleIncoming,
    borderRadius: theme.radii.bubble,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.chat.bubbleInk },
}))
