import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { Dimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

/**
 * Fixed insets for tests.
 *
 * `useSafeAreaInsets` throws "No safe area value available" without a provider,
 * and a real provider resolves its insets from a native layout event that never
 * fires under Jest. Supplying metrics up front makes the values deterministic
 * instead of zero-then-async.
 *
 * These are iPhone-with-notch numbers, so a screen that mishandles a top inset
 * fails here rather than only on hardware.
 */
const DEFAULT_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
}

type RenderScreenOptions = {
  /**
   * Frame width in points. Defaults to `DEFAULT_METRICS`' 390 — every screen
   * was built against that width, so leaving this out reproduces the suite
   * every one of the 43 existing callers already relies on.
   *
   * Pass 320 (iPhone SE / small Android, the narrow end of the phone range
   * this app targets) or 430 (Pro Max, the wide end) to render at a different
   * phone size instead. This only changes `useSafeAreaFrame`/-`Insets` and
   * `useWindowDimensions` — see the note below on why both have to move
   * together.
   */
  width?: number
}

/**
 * Renders a screen with the providers every screen needs.
 *
 * Async, like the `render` it wraps — v14 of RNTL made rendering asynchronous.
 *
 * `width` drives BOTH `SafeAreaProvider`'s frame AND `Dimensions` — one is not
 * enough on its own. `react-native-unistyles` is entirely mocked under Jest
 * (see `jest.config.js`), and that mock resolves a component's breakpoint
 * ONCE, at `StyleSheet.create` time, to whatever `miniRuntime.breakpoint`
 * hardcodes (`undefined`, always) — a breakpoint-keyed style value comes back
 * as the raw `{ xs: ..., md: ... }` object, unresolved, no matter what frame
 * this helper is given. Verified empirically before relying on it: see the
 * session's spike test. So nothing in this app can genuinely react to
 * viewport width through Unistyles' own breakpoints under test — only
 * `useWindowDimensions`/`Dimensions.set` does, which is why `CodeInput` reads
 * width that way instead. Setting `Dimensions` here is what makes THAT
 * codepath testable at a chosen width; the frame is what makes safe-area
 * consumers agree with it.
 */
export function renderScreen(element: ReactElement, options: RenderScreenOptions = {}) {
  const width = options.width ?? DEFAULT_METRICS.frame.width
  const metrics =
    width === DEFAULT_METRICS.frame.width
      ? DEFAULT_METRICS
      : { frame: { ...DEFAULT_METRICS.frame, width }, insets: DEFAULT_METRICS.insets }

  Dimensions.set({ window: { width, height: metrics.frame.height, scale: 2, fontScale: 1 } })

  function ScreenWrapper({ children }: { children: ReactNode }) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={metrics}>{children}</SafeAreaProvider>
      </GestureHandlerRootView>
    )
  }

  return render(element, { wrapper: ScreenWrapper })
}
