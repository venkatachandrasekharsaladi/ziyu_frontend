import { Redirect } from 'expo-router'

import { useRelationshipStore } from '@/state/relationshipStore'
import { selectIsSignedIn, selectIsVerified, useSessionStore } from '@/state/sessionStore'

/**
 * Entry route — the one place that decides where a launch lands.
 *
 * This file used to redirect unconditionally to Welcome and say in a comment
 * that "this is where the real decision will live". It lives here now.
 *
 * Three questions, in order, because each one only makes sense once the
 * previous is answered:
 *
 *   1. Is anyone signed in?          no  -> (auth), sign in or sign up
 *   2. Is their email verified?      no  -> (auth)/verify-email
 *   3. Are they paired with anyone?  no  -> (onboarding), finish setting up
 *                                    yes -> (app)
 *
 * NOTHING PERSISTS YET, so in practice every cold start answers "no" at step 1
 * and lands on Welcome exactly as before. That is not this file being
 * decorative — it is `sessionStore` being in-memory until a real provider
 * issues a token worth keeping. When it persists, this routing starts doing
 * visible work without being touched.
 */
export default function Index() {
  const signedIn = useSessionStore(selectIsSignedIn)
  const verified = useSessionStore(selectIsVerified)
  const status = useRelationshipStore((state) => state.status)

  if (!signedIn) return <Redirect href="/(auth)/welcome" />

  if (!verified) return <Redirect href="/(auth)/verify-email" />

  // `connected` is the only status that means the couple is actually a couple.
  // `inviting` and `pending` are both mid-flow and belong back in onboarding.
  if (status !== 'connected') return <Redirect href="/(onboarding)/setup" />

  return <Redirect href="/(app)/home" />
}
