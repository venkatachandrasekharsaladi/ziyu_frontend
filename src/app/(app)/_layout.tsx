import { Redirect, Stack } from 'expo-router'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'
import { selectIsVerified, useSessionStore } from '@/state/sessionStore'

/**
 * The app itself — everything past onboarding.
 *
 * Headers are off across the group, as in `(auth)` and `(onboarding)`: each
 * screen draws its own top bar. Navigation between sections is the bottom bar,
 * not a stack header.
 *
 * GUARDED. Every route in this group requires a VERIFIED session. Without this
 * the group was reachable by typing its path — which on the web build this
 * project deploys means the address bar, and on native means any deep link.
 * Screens here render a couple's memories, letters and live location, so
 * "reachable by anyone who knows the URL" was not a theoretical gap.
 *
 * The check lives on the LAYOUT rather than on each screen, so a route added
 * later is guarded by existing, not by somebody remembering to guard it.
 *
 * Verified, not merely signed-in: `(onboarding)` takes a plain session, this
 * takes a verified one. See `selectIsVerified` for why they are separate.
 */
export default function AppLayout() {
  const verified = useSessionStore(selectIsVerified)

  // Shared across all four layouts — see `useStackScreenOptions` for why
  // `ios_from_right` rather than the `slide_from_right` that looks right
  // and is Android-only.
  //
  // Called BEFORE the redirect branch: it is a hook, and a hook behind a
  // conditional return changes the hook order between renders the moment the
  // session appears.
  const screenOptions = useStackScreenOptions()

  if (!verified) return <Redirect href="/(auth)/welcome" />

  return <Stack screenOptions={screenOptions} />
}
