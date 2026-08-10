import { Text, View } from 'react-native'

import { BRAND } from '@/config/brand'

/**
 * Temporary entry screen.
 *
 * Placeholder only — it exists so the project builds and runs on a phone
 * while the design system is being built.
 *
 * It will be replaced by a redirect that sends the user to (auth),
 * (onboarding) or (app) depending on their session and pairing state.
 *
 * NOTE: the inline styles below are deliberate and temporary. Once design
 * tokens exist, no screen in this project may contain a raw visual value.
 */
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>{BRAND.name}</Text>
      <Text style={{ fontSize: 14, opacity: 0.6 }}>{BRAND.tagline}</Text>
    </View>
  )
}
