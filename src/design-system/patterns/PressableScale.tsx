import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * How far a card gives under a finger.
 *
 * 0.98, not 0.95: at 0.95 a full-width card visibly shrinks away from its
 * neighbours and the whole row reads as jumping. This is an acknowledgement,
 * not a bounce — see the component note below.
 */
const PRESSED_SCALE = 0.98

type PressableScaleProps = {
  onPress: () => void
  accessibilityLabel: string
  children: ReactNode
  testID?: string
}

/**
 * A pressable that answers the touch.
 
 * Before this, every card in the app was silent under a finger — the tap either
 * navigated or appeared to do nothing at all. It settles to 0.98 rather than
 * bouncing: a private, quiet app should acknowledge a press, not perform.
 *
 * Honours the system's reduce-motion setting, where it simply does not scale.
 */
export function PressableScale({
  onPress,
  accessibilityLabel,
  children,
  testID,
}: PressableScaleProps) {
  const reduced = useReducedMotion()
  const scale = useSharedValue(1)
  // `motion.spring.press` IS this component's original inline config, moved
  // into `tokens/motion.ts` so the rest of the app can press at the same
  // speed instead of each caller inventing a spring. Same numbers, one owner.
  const { theme } = useUnistyles()
  const press = theme.motion.spring.press

  // `.get()`/`.set()` rather than `.value`. React Compiler treats whatever a hook
  // hands back as immutable, so `scale.value = …` reads to it as writing to a
  // value React owns and `react-hooks/immutability` rejects it. Reanimated added
  // this accessor pair for exactly that reason: it is the same shared value and
  // the same UI-thread write, expressed in a form the compiler can reason about.
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (!reduced) scale.set(withSpring(PRESSED_SCALE, press))
      }}
      onPressOut={() => {
        if (!reduced) scale.set(withSpring(1, press))
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
      testID={testID}
    >
      {children}
    </AnimatedPressable>
  )
}
