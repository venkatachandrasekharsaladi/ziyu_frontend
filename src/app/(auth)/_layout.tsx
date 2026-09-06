import { Stack } from 'expo-router'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'

/**
 * Module 00 — Authentication.
 *
 * Headers are off across the group: every screen in this module draws its own
 * top bar, because the design varies between them (Welcome has no back arrow,
 * Sign In does).
 */
export default function AuthLayout() {
  // Shared across all four layouts — see `useStackScreenOptions` for why
  // `ios_from_right` rather than the `slide_from_right` that looks right
  // and is Android-only.
  return <Stack screenOptions={useStackScreenOptions()} />
}
