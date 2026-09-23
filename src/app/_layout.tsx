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
import { Pressable, Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'
import { useServerStateHydration } from '@/hooks/useServerStateHydration'
import { useAppBootstrapStore, type AppBootstrapState } from '@/state/appBootstrapStore'

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
  // Called before the early `return null` below so hook order stays stable
  // across the fonts-loading render and every render after it.
  const screenOptions = useStackScreenOptions()
    useServerStateHydration()
    const bootstrapPhase = useAppBootstrapStore((state: AppBootstrapState) => state.phase)
    const retryBootstrap = useAppBootstrapStore((state: AppBootstrapState) => state.retry)
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    // Hide on error too — a missing font should degrade to the system face,
    // not leave the user staring at a splash screen forever.
    if ((fontsLoaded || fontError) && bootstrapPhase !== 'hydrating') {
      SplashScreen.hideAsync()
    }
  }, [bootstrapPhase, fontsLoaded, fontError])

  if ((!fontsLoaded && !fontError) || bootstrapPhase === 'hydrating') {
    return null
  }

  if (bootstrapPhase === 'offline') {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Text accessibilityRole="alert">LoveOS could not restore your session.</Text>
          <Pressable accessibilityRole="button" onPress={retryBootstrap}>
            <Text>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={screenOptions} />
    </SafeAreaProvider>
  )
}
