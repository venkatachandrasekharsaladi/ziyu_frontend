import { Stack } from 'expo-router'

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
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
