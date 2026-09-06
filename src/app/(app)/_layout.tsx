import { Stack } from 'expo-router'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'

/**
 * The app itself — everything past onboarding.
 *
 * Headers are off across the group, as in `(auth)` and `(onboarding)`: each
 * screen draws its own top bar. Navigation between sections is the bottom bar,
 * not a stack header.
 */
export default function AppLayout() {
  // Shared across all four layouts — see `useStackScreenOptions` for why
  // `ios_from_right` rather than the `slide_from_right` that looks right
  // and is Android-only.
  return <Stack screenOptions={useStackScreenOptions()} />
}
