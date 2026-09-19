import { Feather } from '@expo/vector-icons'
import { Image, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'

type SpacePortraitsProps = {
  name: string
  partnerName?: string | null
  photoUri?: string | null
  partnerPhotoUri?: string | null
}

/**
 * The pair, as two tilted prints with a heart pinned between them.
 *
 * Figma `3430:2345`. NOT `CoupleHeader`, which draws the same two people as
 * overlapping circles at the top of the settings list. The circles say "two
 * accounts"; these say "two photographs someone put on a shelf", and the Space
 * tab opens on the second of those on purpose.
 *
 * The tilt is ±2–3°, small enough to read as hand-placed rather than broken.
 * It is decorative, so the prints carry no accessible role of their own — the
 * name pill under each is the label, and it is real text rather than part of
 * the image so it scales with the reader's type size.
 *
 * A partner who has not joined yet is simply not drawn. A single tilted print
 * with an empty second frame beside it reads as a missing photo rather than a
 * missing person, which is the wrong thing to tell someone still waiting on an
 * invite.
 */
export function SpacePortraits({
  name,
  partnerName,
  photoUri,
  partnerPhotoUri,
}: SpacePortraitsProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrap}>
      <View style={styles.stack}>
        <View style={[styles.print, styles.first]}>
          <Portrait name={name} uri={photoUri} />
        </View>

        {partnerName ? (
          <View style={[styles.print, styles.second]}>
            <Portrait name={partnerName} uri={partnerPhotoUri} />
          </View>
        ) : null}

        {partnerName ? (
          <View style={styles.heart} accessibilityElementsHidden importantForAccessibility="no">
            <Feather name="heart" size={14} color={theme.colors.text.heading} />
          </View>
        ) : null}
      </View>
    </View>
  )
}

function Portrait({ name, uri }: { name: string; uri?: string | null }) {
  return (
    <>
      {uri ? (
        <Image source={{ uri }} style={styles.photo} accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.fallback}>
          <Avatar name={name} size={72} />
        </View>
      )}

      <View style={styles.pill}>
        <Text variant="footnote" tone="heading">
          {name}
        </Text>
      </View>
    </>
  )
}

/**
 * The photo sits INSIDE the 4pt print border, so its corner is `radii.field`
 * inset by that border — 12 − 4. There is no token for it because it is not a
 * radius anyone picks; it is whatever keeps the inner corner concentric with
 * the outer one, and it moves if `radii.field` or the border does.
 */
const PHOTO_RADIUS = 8

const PRINT_WIDTH = 128
const PRINT_HEIGHT = 160

const styles = StyleSheet.create((theme) => ({
  wrap: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  print: {
    width: PRINT_WIDTH,
    height: PRINT_HEIGHT,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
    justifyContent: 'center',
  },
  /** Tilts read as hand-placed. The second print overlaps the first. */
  first: {
    transform: [{ rotate: '-2deg' }],
  },
  second: {
    transform: [{ rotate: '3deg' }],
    marginLeft: -theme.spacing.huge,
  },
  photo: {
    flex: 1,
    width: '100%',
    borderRadius: PHOTO_RADIUS,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.field,
    borderRadius: PHOTO_RADIUS,
  },
  /** Sits on the print, not under it — Figma pins the name inside the frame. */
  pill: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.pill,
    boxShadow: theme.elevation.field,
  },
  heart: {
    position: 'absolute',
    top: -theme.spacing.md,
    alignSelf: 'center',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[0].soft,
    transform: [{ rotate: '12deg' }],
    boxShadow: theme.elevation.field,
  },
}))
