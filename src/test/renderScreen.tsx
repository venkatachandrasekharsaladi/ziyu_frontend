import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
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
const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
}

function ScreenWrapper({ children }: { children: ReactNode }) {
  return <SafeAreaProvider initialMetrics={METRICS}>{children}</SafeAreaProvider>
}

/**
 * Renders a screen with the providers every screen needs.
 *
 * Async, like the `render` it wraps — v14 of RNTL made rendering asynchronous.
 */
export function renderScreen(element: ReactElement) {
  return render(element, { wrapper: ScreenWrapper })
}
