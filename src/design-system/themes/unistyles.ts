import { StyleSheet } from 'react-native-unistyles'

import { breakpoints } from '@/design-system/themes/breakpoints'
import { lavenderTheme, midnightTheme } from '@/design-system/themes/theme'

/**
 * Unistyles configuration.
 *
 * MUST be imported before any component that calls `StyleSheet.create`, which
 * is why `src/app/_layout.tsx` imports it on its very first line.
 */
StyleSheet.configure({
  /**
   * Lavender is listed FIRST deliberately, not just set as `initialTheme`.
   *
   * The Jest mock ignores `initialTheme` and resolves whichever theme it finds
   * first, so the order here is what makes the default suite a light-mode suite.
   * On a device `initialTheme` is what decides, and the two agree — which is the
   * only arrangement where the tests describe the app.
   */
  themes: { lavender: lavenderTheme, midnight: midnightTheme },
  breakpoints,
  /**
   * Lavender, always, on every launch.
   *
   * NOT `adaptiveThemes: true`. That would follow the OS, but it only works for
   * themes literally named `light` and `dark`, and these are named for their
   * palettes — see the note on `lavenderTheme`. The two settings are mutually
   * exclusive in Unistyles 3 anyway.
   *
   * NOT read from storage either: nothing in this app persists yet, on purpose
   * (`state/relationshipStore`, `services/auth/mock`). `initialTheme` accepts a
   * function, so the day storage arrives, reading a saved preference here is the
   * one-line change — and this is the ONLY place that has to change.
   */
  settings: { initialTheme: 'lavender' },
})
