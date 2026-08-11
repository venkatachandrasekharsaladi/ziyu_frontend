import { Stack } from 'expo-router'

/**
 * Module 00 — Authentication.
 *
 * Headers are off across the group: every screen in this module draws its own
 * top bar, because the design varies between them (Welcome has no back arrow,
 * Sign In does).
 */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
