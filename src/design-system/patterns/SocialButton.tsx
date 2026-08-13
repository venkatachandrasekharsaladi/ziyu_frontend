import { AntDesign } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export type SocialProvider = 'google' | 'apple'

type SocialButtonProps = {
  provider: SocialProvider
  onPress: () => void
  disabled?: boolean
}

// Glyph names verified against this version's AntDesign glyph map, which offers
// `apple`, `google` and `google-plus`. An unknown name renders nothing and only
// warns, so it is not caught by rendering — it has to be checked.
const PROVIDER = {
  google: { label: 'Google', icon: 'google' },
  apple: { label: 'Apple', icon: 'apple' },
} as const

/**
 * Google / Apple sign-in button.
 *
 * A pattern rather than a `Button` variant because it carries provider
 * semantics, not just a look. Pill-shaped at the shared control height: every
 * other button in the app is a pill, and radius 12 is reserved for fields and
 * cards. M00-S02's label was Medium (500), a weight not registered in
 * `_layout.tsx` that would silently fall back to Regular — it is SemiBold here.
 *
 * OPEN ITEM: Google's Sign-In branding guidelines require the official
 * multi-colour mark. This monochrome glyph is a stand-in and must be replaced
 * before OAuth ships. See spec open item 3.
 */
export function SocialButton({ provider, onPress, disabled = false }: SocialButtonProps) {
  const { label, icon } = PROVIDER[provider]
  const { theme } = useUnistyles()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      accessibilityState={{ disabled }}
      style={styles.button}
    >
      <View style={styles.content}>
        <AntDesign name={icon} size={20} color={theme.colors.text.heading} />
        <Text variant="labelStrong" tone="heading">
          {label}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  button: {
    flex: 1,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
}))
