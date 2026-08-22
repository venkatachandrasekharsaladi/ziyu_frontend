import { useCallback } from 'react'
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles'

import { themeNameOf, themes, type ThemeName } from '@/design-system/themes/theme'

/** Where each theme goes when the user asks for the other one. */
const OPPOSITE: Record<ThemeName, ThemeName> = {
  lavender: 'midnight',
  midnight: 'lavender',
}

/**
 * Read and change the active theme.
 *
 * The single seam between "the user pressed a thing" and Unistyles. Nothing
 * else in the app calls `UnistylesRuntime.setTheme`, so this is the one file to
 * touch if the app ever grows a System option, a persisted preference, or a
 * third theme.
 *
 * `useUnistyles()` is what subscribes the caller to the change — without it, the
 * control that flips the theme would repaint the whole app and not itself.
 *
 * NOTE: the name comes from `themeNameOf(theme)`, not from
 * `UnistylesRuntime.themeName`. The runtime field is correct on a device but
 * `undefined` under the Jest mock, and a hook whose state is unreadable in
 * tests is a hook whose behaviour nobody checks.
 */
export function useThemeMode() {
  const { theme } = useUnistyles()
  const name = themeNameOf(theme)

  const setMode = useCallback((next: ThemeName) => {
    UnistylesRuntime.setTheme(next)
    // The root view sits BEHIND the React tree and Unistyles does not repaint
    // it. Left alone it keeps the old theme's ground, which shows up as a pale
    // flash the moment you switch to midnight, and again on any overscroll or
    // rotation afterwards.
    UnistylesRuntime.setRootViewBackgroundColor(themes[next].colors.surface.page)
  }, [])

  const toggle = useCallback(() => {
    setMode(OPPOSITE[name])
  }, [name, setMode])

  return {
    name,
    scheme: theme.scheme,
    isDark: theme.scheme === 'dark',
    /** Flip to the other theme. */
    toggle,
    /** Go to a named theme, for a picker with more than two options. */
    setMode,
  }
}
