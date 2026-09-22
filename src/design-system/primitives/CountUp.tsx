import { useEffect, useState } from 'react'
import { useReducedMotion } from 'react-native-reanimated'

import { Text, type TextTone, type TextVariant } from '@/design-system/primitives/Text'

type CountUpProps = {
  value: number
  /** Formats both the frames and the final value. Defaults to a thousands separator. */
  format?: (n: number) => string
  variant?: TextVariant
  tone?: TextTone
  align?: 'left' | 'center'
  duration?: number
}

const DEFAULT_FORMAT = (n: number) => n.toLocaleString()

/**
 * A number that arrives rather than appears.
 *
 * Used on the counts that carry the emotional weight of the dashboard — days
 * together, the relationship pulse — where landing on 1,395 reads differently
 * from simply being 1,395.
 *
 * The accessible label is ALWAYS the final value, never a frame of the
 * animation: a screen reader announcing "four hundred and twelve" mid-ramp
 * would be actively wrong. Reduce-motion skips straight to the end.
 */
export function CountUp({
  value,
  format = DEFAULT_FORMAT,
  variant = 'h1',
  tone = 'brand',
  align,
  duration = 900,
}: CountUpProps) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)

  /**
   * Whether this render ramps at all. Reduce-motion, and any environment
   * without `requestAnimationFrame` (Jest, SSR), show the final number outright.
   *
   * This is a DERIVED value rather than an effect that pushes `value` into
   * `shown`. Copying a prop into state from inside an effect means the old
   * number is painted first and corrected on the next render — a visible flash
   * of the previous count for precisely the users who asked for less motion.
   */
  const animates = !reduced && typeof requestAnimationFrame === 'function'

  useEffect(() => {
    if (!animates) return

    let frame = 0
    const started = Date.now()

    const tick = () => {
      const elapsed = Date.now() - started
      const t = Math.min(1, elapsed / duration)
      // Ease out — fast off the mark, settling into the real number.
      const eased = 1 - (1 - t) ** 3

      setShown(Math.round(value * eased))

      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [value, duration, animates])

  return (
    <Text variant={variant} tone={tone} align={align} accessibilityLabel={format(value)}>
      {format(animates ? shown : value)}
    </Text>
  )
}
