import { Stack } from 'expo-router'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'

/**
 * Module 01 — Onboarding and pairing.
 *
 * Headers are off across the group for the same reason as `(auth)`: every
 * screen draws its own top bar, and they differ — S01 has no back arrow, the
 * status screens have no header at all.
 */
export default function OnboardingLayout() {
  // Shared across all four layouts — see `useStackScreenOptions` for why
  // `ios_from_right` rather than the `slide_from_right` that looks right
  // and is Android-only.
  return <Stack screenOptions={useStackScreenOptions()} />
}
