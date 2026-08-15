import { Stack } from 'expo-router'

/**
 * Module 01 — Onboarding and pairing.
 *
 * Headers are off across the group for the same reason as `(auth)`: every
 * screen draws its own top bar, and they differ — S01 has no back arrow, the
 * status screens have no header at all.
 */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
