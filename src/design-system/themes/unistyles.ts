import { StyleSheet } from 'react-native-unistyles'

import { lavenderTheme, type AppTheme } from '@/design-system/themes/theme'

/**
 * Unistyles configuration.
 *
 * MUST be imported before any component that calls `StyleSheet.create`, which
 * is why `src/app/_layout.tsx` imports it on its very first line.
 */
const breakpoints = {
  xs: 0,
  /** Tablet and up. Content stops growing and centres. */
  md: 768,
} as const

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    lavender: AppTheme
  }
  export interface UnistylesBreakpoints {
    xs: (typeof breakpoints)['xs']
    md: (typeof breakpoints)['md']
  }
}

StyleSheet.configure({
  themes: { lavender: lavenderTheme },
  breakpoints,
  settings: { initialTheme: 'lavender' },
})
