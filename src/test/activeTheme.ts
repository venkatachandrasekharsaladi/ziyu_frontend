import { StyleSheet } from 'react-native-unistyles'

import { themes, type AppTheme, type ThemeName } from '@/design-system/themes/theme'

/**
 * A one-property stylesheet whose only job is to report which theme Unistyles
 * actually resolved. Created at module scope, like any other stylesheet, so it
 * goes through the exact same path the components under test do.
 */
const probe = StyleSheet.create((theme) => ({
  probe: { backgroundColor: theme.colors.surface.page },
}))

/**
 * Which theme this Jest project is running.
 *
 * Read back out of a resolved style rather than from `UnistylesRuntime`, whose
 * `themeName` the mock leaves `undefined`. Matching on `surface.page` works
 * because no two themes share a page ground — `theme.parity` asserts it.
 *
 * This is what lets ONE test file assert the right colours in BOTH projects,
 * instead of a light copy and a dark copy that drift apart.
 */
export function activeThemeName(): ThemeName {
  const page = probe.probe.backgroundColor
  const names = Object.keys(themes) as ThemeName[]
  const hit = names.find((name) => themes[name].colors.surface.page === page)

  if (!hit) {
    throw new Error(
      `No registered theme has surface.page === ${String(page)}. ` +
        'Either Unistyles was not configured before this module loaded, or a ' +
        'theme was registered that themes/theme.ts does not export.',
    )
  }

  return hit
}

/** The whole active theme, for asserting any token a component should be using. */
export function activeTheme(): AppTheme {
  return themes[activeThemeName()]
}

/** The other one — for asserting a component is NOT wearing the wrong theme. */
export function inactiveTheme(): AppTheme {
  const names = Object.keys(themes) as ThemeName[]
  const other = names.find((name) => name !== activeThemeName())

  return themes[other as ThemeName]
}
