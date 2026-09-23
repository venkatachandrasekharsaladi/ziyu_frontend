import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import { TRIP_ITINERARY_COPY } from '@/copy/trips'
import type { ItineraryMoment } from '@/services/plans/types'

type MomentCardProps = {
  moment: ItineraryMoment
  /** Whether this is the last card, which stops the rail short. */
  last: boolean
  onToggleSaved: () => void
}

/**
 * Fills its parent, as a PLAIN object — Unistyles styles do not survive the trip
 * into expo-image. See `expoImageStyles.test.ts`.
 */
const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/**
 * One moment on the itinerary timeline — Figma 3482:15, the three cards under
 * "Day 01".
 *
 * The vertical rail and its dot are drawn by the CARD, not by the list, so a day
 * with one moment cannot end up with a rail running past it into empty space.
 * `last` is what tells the final card to stop drawing the line below its dot.
 */
export function MomentCard({ moment, last, onToggleSaved }: MomentCardProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.row}>
      {/* The rail. Purely decorative, so it is hidden from screen readers. */}
      <View style={styles.rail} importantForAccessibility="no-hide-descendants">
        <View style={styles.dot} />
        {last ? null : <View style={styles.line} />}
      </View>

      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.time}>
            <Text variant="countdown" tone="brand">
              {moment.time}
            </Text>

            <Text variant="countdown" tone="placeholder">
              {moment.slot.toUpperCase()}
            </Text>
          </View>

          <Text variant="countdown" tone="heading">
            {moment.cost}
          </Text>
        </View>

        <Text variant="labelStrong" tone="heading">
          {moment.title}
        </Text>

        <Text variant="footnote" tone="body">
          {moment.description}
        </Text>

        {moment.photoUri ? (
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: moment.photoUri }}
              style={IMAGE_FILL}
              contentFit="cover"
              transition={200}
            />

            {moment.photoCaption ? (
              <View style={styles.caption}>
                <Feather name="map-pin" size={10} color={theme.colors.text.onPrimary} />

                <Text variant="countdown" tone="onPrimary">
                  {moment.photoCaption}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={onToggleSaved}
            accessibilityRole="button"
            accessibilityState={{ selected: moment.saved }}
            accessibilityLabel={
              moment.saved
                ? `${TRIP_ITINERARY_COPY.saved}: ${moment.title}`
                : `${TRIP_ITINERARY_COPY.save}: ${moment.title}`
            }
            style={styles.action}
            hitSlop={6}
          >
            <Feather
              name="bookmark"
              size={12}
              color={moment.saved ? theme.colors.brand.primary : theme.colors.text.placeholder}
            />

            <Text variant="countdown" tone={moment.saved ? 'brand' : 'placeholder'}>
              {moment.saved ? TRIP_ITINERARY_COPY.saved : TRIP_ITINERARY_COPY.save}
            </Text>
          </Pressable>

          <View style={styles.action}>
            <Feather name="refresh-cw" size={12} color={theme.colors.text.placeholder} />

            <Text variant="countdown" tone="placeholder">
              {TRIP_ITINERARY_COPY.replace}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rail: {
    alignItems: 'center',
    width: 12,
    paddingTop: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  line: {
    flex: 1,
    width: 1,
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.border.subtle,
  },
  card: {
    flex: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  photoWrap: {
    height: 160,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    margin: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.scrim,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
