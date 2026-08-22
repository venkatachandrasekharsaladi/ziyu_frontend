import { StyleSheet } from 'react-native-unistyles'

import { breakpoints } from '@/design-system/themes/breakpoints'
import { lavenderTheme, midnightTheme } from '@/design-system/themes/theme'

/**
 * The `midnight` Jest project's Unistyles setup — the dark half of the suite.
 *
 * The whole reason this file exists: the Unistyles Jest mock cannot switch
 * themes. `UnistylesRuntime.setTheme` is a no-op, `themeName` is `undefined`,
 * and `getTheme('midnight')` hands back lavender. What the mock DOES honour is
 * the order of the `themes` object — it resolves the first entry. So dark mode
 * is tested by configuring midnight first and running the suite again, rather
 * than by flipping a theme mid-test, which is not a thing that works here.
 *
 * Both entries are still registered, so `themeNameOf` and the parity tests see
 * the same two themes the app does.
 */
StyleSheet.configure({
  themes: { midnight: midnightTheme, lavender: lavenderTheme },
  breakpoints,
  settings: { initialTheme: 'midnight' },
})
