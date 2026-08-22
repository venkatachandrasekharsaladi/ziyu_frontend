import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

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

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        if (!reduced) scale.value = withSpring(0.98, { damping: 20, stiffness: 320 })
      }}
      onPressOut={() => {
        if (!reduced) scale.value = withSpring(1, { damping: 20, stiffness: 320 })
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
