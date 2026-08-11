import { Redirect } from 'expo-router'

/**
 * Entry route.
 *
 * For now every launch lands on Welcome. This is where the real decision will
 * live: send the user to (auth), (onboarding) or (app) depending on their
 * session and pairing state. Replacing this redirect does not require touching
 * any screen.
 */
export default function Index() {
  return <Redirect href="/(auth)/welcome" />
}
