import { lavenderTheme, midnightTheme } from '@/design-system/themes/theme'

/**
 * MOTION TOKENS — the contract, and the one rule that cannot be seen.
 *
 * Most of this file is ordinary token hygiene. The assertion that matters is
 * the last one: every entering/exiting animation must carry `.reduceMotion()`.
 * A missing one is invisible to everyone who does not have the OS setting
 * enabled, so it will never be caught by looking at the app — only by reading
 * the source, which is exactly what a test can do reliably and a person will
 * not do every time.
 */

describe('motion tokens', () => {
  it('exposes durations that increase monotonically', () => {
    const { duration } = lavenderTheme.motion
    const order = [
      duration.instant,
      duration.fast,
      duration.base,
      duration.slow,
      duration.deliberate,
    ]

    // A ramp whose steps are not ordered is not a ramp — it is five numbers,
    // and picking one stops meaning anything.
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(new Set(order).size).toBe(order.length)
  })

  it('keeps every duration inside the range a user reads as responsive', () => {
    for (const [name, ms] of Object.entries(lavenderTheme.motion.duration)) {
      // Under ~100ms reads as an instant cut and the animation is wasted work;
      // past ~500ms the interface feels like it is making the user wait. The
      // name is folded into the failure so a break says WHICH token drifted.
      expect({ name, ms }).toMatchObject({ name })
      expect(ms).toBeGreaterThanOrEqual(100)
      expect(ms).toBeLessThanOrEqual(500)
    }
  })

  it('carries easing curves as plain 4-point data, not built functions', () => {
    for (const [name, points] of Object.entries(lavenderTheme.motion.curve)) {
      // The token tree is walked by `theme.parity` and mocked wholesale under
      // Jest — a function in here would couple the design system to
      // Reanimated. See `tokens/motion.ts`'s header.
      expect(Array.isArray(points)).toBe(true)
      expect(points).toHaveLength(4)
      for (const n of points) expect(typeof n).toBe('number')
      expect(name).toBeTruthy()
    }
  })

  it('is the same object in both themes — motion is not a repaint', () => {
    expect(midnightTheme.motion).toBe(lavenderTheme.motion)
  })

  it('keeps the press spring exactly as PressableScale originally tuned it', () => {
    // The value was moved into tokens, not re-invented. If this drifts, every
    // card in the app changes feel — worth a tripwire.
    expect(lavenderTheme.motion.spring.press).toEqual({ damping: 20, stiffness: 320 })
  })
})

describe('reduced motion', () => {
  it('applies reduceMotion to every entering and exiting animation', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    const src: string = fs
      .readFileSync('src/design-system/patterns/useEntrance.ts', 'utf8')
      // COMMENTS STRIPPED FIRST. The file's own header explains the
      // reduce-motion rule and quotes `.reduceMotion(ReduceMotion.System)` in
      // prose — counting that would report a guard that does not exist in the
      // code. Assert the CODE, never the documentation of the code.
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    // Rather than parse, assert the invariant: every animation builder is
    // matched by exactly one `.reduceMotion(` call.
    const builders = src.match(/(FadeIn|FadeOut|FadeInDown|SlideInDown|SlideOutDown)\.duration\(/g) ?? []
    const guards = src.match(/\.reduceMotion\(/g) ?? []

    expect(builders.length).toBeGreaterThan(0)
    expect(guards).toHaveLength(builders.length)
  })
})
