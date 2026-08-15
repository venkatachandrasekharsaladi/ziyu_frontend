import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type AvatarProps = {
  /** Diameter in points. Defaults to the shared control height. */
  size?: number
  uri?: string | null
  /** Used for initials and as the accessible label. */
  name: string
  /** Draws a brand ring — the "revealed partner" treatment on M01-S06. */
  ring?: boolean
}

/** "Chandu Reddy" → "CR", "Chandu" → "C", "" → "". */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * A person, as a circle.
 *
 * Falls back to initials rather than a generic silhouette: in a two-person app
 * an anonymous placeholder is worse than the person's own letters. An empty or
 * whitespace name degrades to a plain circle labelled "Avatar" rather than an
 * empty badge with no accessible name.
 */
export function Avatar({ size, uri, name, ring = false }: AvatarProps) {
  const initials = initialsOf(name)
  const label = name.trim() || 'Avatar'

  styles.useVariants({ ring })

  return (
    <View
      style={[styles.avatar, size ? { width: size, height: size } : null]}
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" testID="avatar-image" />
      ) : (
        <Text variant="h2" tone="brand">
          {initials}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  avatar: {
    width: theme.control.height,
    height: theme.control.height,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    variants: {
      ring: {
        // NOT surface.soft — that is this circle's own fill, so the ring drew
        // lavender on lavender and was invisible on M01-S06, the one screen
        // that asks for it. brand.primary is already in the set, so this adds
        // no token (spec §5).
        true: { borderWidth: 3, borderColor: theme.colors.brand.primary },
        false: {},
      },
    },
  },
  image: {
    width: '100%',
    height: '100%',
  },
}))
