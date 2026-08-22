// MUST be first: Unistyles has to be configured before any component that
// calls StyleSheet.create is imported, or those styles resolve against an
// unconfigured theme.
import '@/design-system/themes/unistyles'

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'

/**
 * Root layout.
 *
 * This file owns app-wide setup only — providers, fonts, theme.
 * It must never contain screen content or styling values.
 *
 * Route groups sit beneath it, each with its own access rule:
 *   (auth)        Module 00 — skip entirely when already signed in
 *   (onboarding)  Module 01 — requires a session, but no partner yet
 *   (app)         the real app — requires both a session and a partner
 */
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    // Hide on error too — a missing font should degrade to the system face,
    // not leave the user staring at a splash screen forever.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}
