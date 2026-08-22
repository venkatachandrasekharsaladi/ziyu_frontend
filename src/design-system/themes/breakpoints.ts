import type { AppTheme } from '@/design-system/themes/theme'

/**
 * Breakpoints and the Unistyles module augmentation, WITHOUT the
 * `StyleSheet.configure` call.
 *
 * Split out so more than one entry point can configure Unistyles from the same
 * declarations: the app configures lavender-first, and the Jest "midnight"
 * project configures midnight-first. Importing `themes/unistyles` from the test
 * setup instead would run its `configure` as a side effect, which is exactly
 * what that setup is trying to replace.
 */
export const breakpoints = {
  xs: 0,
  /** Tablet and up. Content stops growing and centres. */
  md: 768,
} as const

declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    lavender: AppTheme
    midnight: AppTheme
  }
  export interface UnistylesBreakpoints {
    xs: (typeof breakpoints)['xs']
    md: (typeof breakpoints)['md']
  }
}
