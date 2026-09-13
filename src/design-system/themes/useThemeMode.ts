import { useCallback, useEffect } from 'react'
import { Appearance } from 'react-native'
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles'

import { themeNameOf, themes, type ThemeName } from '@/design-system/themes/theme'
import { useThemeChoiceStore, type ThemeChoice } from '@/design-system/themes/themeChoiceStore'

/** What the device's own light/dark setting means in this app's theme names. */
const FOR_SCHEME: Record<'light' | 'dark', ThemeName> = {
  light: 'lavender',
  dark: 'midnight',
}

const FOR_CHOICE: Record<Exclude<ThemeChoice, 'auto'>, ThemeName> = {
  light: 'lavender',
  dark: 'midnight',
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
 *
 * AUTO. `settings.adaptiveThemes` is not available here and `themes/unistyles.ts`
 * says why: it only works for themes literally named `light` and `dark`, these
 * are named for their palettes (`lavender`, `midnight`), and it is mutually
 * exclusive with `initialTheme` in Unistyles 3 anyway. So Auto is a manual
 * `Appearance` listener that calls the same `setMode` everything else calls.
 * The CHOICE lives in `themeChoiceStore`, colocated with this file rather than
 * in app state, because the theme layer owns the theme — choice included — so
 * nothing in `design-system` has to reach into `@/state` for it. The ACTIVE
 * theme still lives in `UnistylesRuntime`, and this file is still the only
 * thing that talks to it.
 */
export function useThemeMode() {
  const { theme } = useUnistyles()
  const name = themeNameOf(theme)
  const choice = useThemeChoiceStore((state) => state.choice)
  const setStoreChoice = useThemeChoiceStore((state) => state.setChoice)
  const resetStoreChoice = useThemeChoiceStore((state) => state.reset)

  const setMode = useCallback((next: ThemeName) => {
    UnistylesRuntime.setTheme(next)
    // The root view sits BEHIND the React tree and Unistyles does not repaint
    // it. Left alone it keeps the old theme's ground, which shows up as a pale
    // flash the moment you switch to midnight, and again on any overscroll or
    // rotation afterwards.
    UnistylesRuntime.setRootViewBackgroundColor(themes[next].colors.surface.page)
  }, [])

  const applyChoice = useCallback(
    (next: ThemeChoice) => {
      if (next === 'auto') {
        setMode(FOR_SCHEME[Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'])
        return
      }

      setMode(FOR_CHOICE[next])
    },
    [setMode],
  )

  const setChoice = useCallback(
    (next: ThemeChoice) => {
      setStoreChoice(next)
      applyChoice(next)
    },
    [applyChoice, setStoreChoice],
  )

  /**
   * Forget the choice and repaint on the default.
   *
   * Sign-out calls this. `themeChoiceStore.reset()` on its own would clear the
   * RECORDED choice and leave `UnistylesRuntime` still painted in the previous
   * account's palette — the half of the leak that is invisible in the store and
   * unmissable on the screen. Applying the restored choice through the same
   * `setMode` seam everything else uses is what makes the two agree again.
   */
  const resetChoice = useCallback(() => {
    resetStoreChoice()
    applyChoice(useThemeChoiceStore.getState().choice)
  }, [applyChoice, resetStoreChoice])

  // Only subscribed while the choice is Auto. An explicit Light or Dark means
  // the device's own setting is no longer an input, and a listener still
  // running would flip the theme out from under a deliberate choice the next
  // time the phone crossed sunset.
  useEffect(() => {
    if (choice !== 'auto') return

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setMode(FOR_SCHEME[colorScheme === 'dark' ? 'dark' : 'light'])
    })

    return () => subscription.remove()
  }, [choice, setMode])

  const toggle = useCallback(() => {
    setChoice(name === 'lavender' ? 'dark' : 'light')
  }, [name, setChoice])

  return {
    name,
    scheme: theme.scheme,
    isDark: theme.scheme === 'dark',
    /** What the user asked for — `light`, `dark`, or `auto`. */
    choice,
    /** Flip to the other theme. Records an explicit choice, so Auto is left behind. */
    toggle,
    /** Go to a named theme directly. Does NOT record a choice. */
    setMode,
    /** Record a choice and apply it. What the Appearance screen calls. */
    setChoice,
    /** Drop the choice and repaint on the default. What sign-out calls. */
    resetChoice,
  }
}
