import { Stack } from 'expo-router'

/**
 * The app itself — everything past onboarding.
 *
 * Headers are off across the group, as in `(auth)` and `(onboarding)`: each
 * screen draws its own top bar. Navigation between sections is the bottom bar,
 * not a stack header.
 */
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
