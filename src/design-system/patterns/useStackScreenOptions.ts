import { useUnistyles } from 'react-native-unistyles'

/**
 * The screen options every `Stack` in this app shares.
 *
 * WHY THIS EXISTS: all four layouts (`app/_layout`, `(app)`, `(auth)`,
 * `(onboarding)`) independently wrote `screenOptions={{ headerShown: false }}`
 * and nothing else. That left navigation as a hard cut — no transition at all
 * — and left each group free to drift the day one of them wanted a different
 * animation. Same "one lever" reasoning as `tokens/layout.ts`.
 *
 * ANIMATION CHOICE, and the trap it avoids: `slide_from_right` is the obvious
 * pick and it is wrong. Per expo-router's own `native-stack/types.tsx` it is
 * **Android-only** and silently "uses default animation on iOS", so choosing
 * it gives two different transitions on the two platforms while looking like
 * a deliberate cross-platform decision. `ios_from_right` is the honest one:
 * an iOS-style right-to-left push on Android, and on iOS it resolves to the
 * platform default — which already IS that push. One motion, both platforms.
 *
 * `contentStyle` is the polish that is easy to miss: without an explicit
 * background the native stack renders each screen over the window's default
 * white, so every push flashes white for a frame before the screen paints —
 * badly visible in the midnight theme. Painting the group's own page colour
 * removes it.
 */
export function useStackScreenOptions() {
  const { theme } = useUnistyles()

  return {
    /**
     * Every screen draws its own top bar; navigation between sections is the
     * bottom bar, not a stack header. This was already true in all four
     * layouts and is preserved verbatim.
     */
    headerShown: false,
    animation: 'ios_from_right',
    /**
     * Swipe-back. Already the iOS default for a native stack, set explicitly
     * so it survives someone adding a `gestureEnabled: false` screen above
     * and wondering why the group changed.
     */
    gestureEnabled: true,
    /** Kills the white flash between pushes. See the note above. */
    contentStyle: { backgroundColor: theme.colors.surface.page },
  } as const
}
