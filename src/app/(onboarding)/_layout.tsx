import { Redirect, Stack } from 'expo-router'

import { useStackScreenOptions } from '@/design-system/patterns/useStackScreenOptions'
import { selectIsSignedIn, useSessionStore } from '@/state/sessionStore'

/**
 * Onboarding — everything between creating an account and reaching the app.
 *
 * Headers are off across the group, as in `(auth)` and `(app)`: each screen
 * draws its own top bar.
 *
 * GUARDED, on a plain session rather than a verified one. These screens collect
 * the couple's names, dates and first memory, so they need to belong to
 * somebody — but they are also where a user lands straight after signing up,
 * which is the moment email verification has NOT happened yet. Requiring
 * verification here would have locked people out of the flow they had just
 * been sent to.
 */
export default function OnboardingLayout() {
  const signedIn = useSessionStore(selectIsSignedIn)

  // Before the branch — see `(app)/_layout.tsx` for why a hook cannot sit
  // behind a conditional return.
  const screenOptions = useStackScreenOptions()

  if (!signedIn) return <Redirect href="/(auth)/welcome" />

  return <Stack screenOptions={screenOptions} />
}
