import { StatusBar } from 'expo-status-bar'
import { useUnistyles } from 'react-native-unistyles'

/**
 * The status bar, keyed to the active theme.
 *
 * Every screen had `<StatusBar style="dark" />` written into it, which is dark
 * glyphs — correct on a lavender page and invisible on a midnight one.
 *
 * NOT `style="auto"`. That follows the OS appearance, and this app's theme is
 * the user's own choice: someone running a dark phone and a lavender app would
 * get white glyphs on a near-white bar. `theme.scheme` is the app's answer,
 * which is the one that matches what is actually on screen.
 *
 * The inversion is the point — a dark UI needs LIGHT glyphs.
 */
export function ThemedStatusBar() {
  const { theme } = useUnistyles()

  return <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
}
