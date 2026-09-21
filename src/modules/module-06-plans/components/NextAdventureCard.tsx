import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PLANS_COPY } from '@/copy/plans'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import {
  selectPlannedMoments,
  selectSavedSpots,
  usePlansStore,
} from '@/state/plansStore'

const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/**
 * THE WAY IN, from the Home dashboard.
 *
 * Home is where the couple already is, so the plans cluster has to be mentioned
 * there or it is six features behind a tab nobody presses. This card is that
 * mention: it names the trip they are actually planning, and opening it lands on
 * the Plans hub with everything else — bingo board, promises, capsules, letters,
 * watch, map — one tap further.
 *
 * TWO STATES, because a couple with no trip is the more common one on day one.
 * With a plan it shows the plan; without one it invites them to make it, and
 * goes straight to the setup form rather than to a hub that would just show them
 * the same invitation again.
 *
 * Lives in module-06 rather than module-02 so that the plans cluster stays one
 * folder — Home imports it, Home does not own it.
 */
export function NextAdventureCard() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const trip = usePlansStore((state) => state.trip)
  /*
   * Two different counts, deliberately.
   *
   * `planned` decides WHETHER there is a plan — any moment at all means the
   * couple has one. `savedSpots` is what the card REPORTS, and only counts
   * moments they actually saved. Using the first for both made the card claim
   * "3 saved spots" over a trip nobody had saved anything in.
   */
  const planned = usePlansStore(selectPlannedMoments)
  const savedSpots = usePlansStore(selectSavedSpots)
  const hasPlan = planned > 0

  return (
    <PressableScale
      onPress={() => router.push(hasPlan ? '/(app)/plans' : '/(app)/plans/trip/new')}
      accessibilityLabel={
        hasPlan ? `${trip.title}. ${PLANS_COPY.openItinerary}` : PLANS_COPY.noTrip.action
      }
    >
      <View style={styles.card}>
        {hasPlan && trip.coverUri ? (
          <>
            <Image
              source={{ uri: trip.coverUri }}
              style={IMAGE_FILL}
              contentFit="cover"
              transition={200}
            />

            {/* Text is reversed out over a photograph — see `surface.scrim`. */}
            <LinearGradient
              colors={['transparent', theme.colors.surface.scrim]}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : null}

        <View style={styles.head}>
          {/*
           * The badge sits on a PHOTO when there is a plan and on the card's own
           * white when there is not, so it cannot keep one ground. Scrim over a
           * photograph, the soft lavender otherwise — anything else is either an
           * unreadable badge or a dark blob on an empty card.
           */}
          <View style={[styles.badge, hasPlan ? styles.badgeOnPhoto : styles.badgeOnCard]}>
            <Feather
              name="compass"
              size={11}
              color={hasPlan ? theme.colors.text.onPrimary : theme.colors.brand.primary}
            />

            <Text variant="countdown" tone={hasPlan ? 'onPrimary' : 'brand'}>
              {PLANS_COPY.kicker.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {hasPlan ? (
            <>
              <Text variant="countdown" tone="onPrimary">
                {`${trip.dateRange} · ${trip.destination}`.toUpperCase()}
              </Text>

              <Text variant="h3" tone="onPrimary">
                {trip.title}
              </Text>

              <Text variant="footnote" tone="onPrimary">
                {`${PLANS_COPY.savedSpots(savedSpots)} · ${PLANS_COPY.openItinerary}`}
              </Text>
            </>
          ) : (
            <>
              <Text variant="h3" tone="heading">
                {PLANS_COPY.noTrip.heading}
              </Text>

              <Text variant="footnote" tone="body">
                {PLANS_COPY.noTrip.lede}
              </Text>

              <View style={styles.cta}>
                <Text variant="footnote" tone="brand">
                  {PLANS_COPY.noTrip.action}
                </Text>

                <Feather name="arrow-right" size={14} color={theme.colors.brand.primary} />
              </View>
            </>
          )}
        </View>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    minHeight: 170,
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
  },
  badgeOnPhoto: {
    backgroundColor: theme.colors.surface.scrim,
  },
  badgeOnCard: {
    backgroundColor: theme.colors.surface.soft,
  },
  body: {
    gap: theme.spacing.xs,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
}))
