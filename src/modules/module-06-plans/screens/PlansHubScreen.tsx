import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PLANS_COPY } from '@/copy/plans'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { PlanCard } from '@/modules/module-06-plans/components/PlanCard'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { SAMPLE_PLACES, SAMPLE_WATCH_ROOM } from '@/sample/plans'
import {
  selectPlannedDays,
  selectPromisesLived,
  selectSavedSpots,
  selectSealedCapsules,
  selectTilesInProgress,
  selectTilesStamped,
  selectWaitingLetters,
  usePlansStore,
} from '@/state/plansStore'

/**
 * Fills its parent, as a PLAIN object.
 *
 * Unistyles does not process expo-image, so a `StyleSheet.create` entry handed
 * to `<Image>` arrives with its properties stripped and the image draws 0×0.
 * `expoImageStyles.test.ts` enforces this; its header has the full story.
 */
const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/**
 * M06-S01 · Our Plans — the hub. Figma `Tales of Two` / `New Features` /
 * 3482:3155.
 *
 * WHAT THIS SCREEN IS: an index over the six features on the rest of the page,
 * plus the one trip pinned at the top. It owns no data of its own — every figure
 * on it is a selector over `plansStore`, so stamping a bingo tile or sealing a
 * letter changes this screen too. That is the whole reason the cluster shares one
 * store; see its header.
 *
 * The design is drawn at 1320pt wide, as a desktop layout. It is rendered here as
 * the 448pt phone column every other screen in the app uses — the frame is a
 * mockup of the content, not of the viewport, and the app has no desktop layout
 * to be consistent with. The two-up card grid is the one piece of its geometry
 * that survives, because it works at phone width.
 */
export function PlansHubScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const trip = usePlansStore((state) => state.trip)
  const stamped = usePlansStore(selectTilesStamped)
  const inProgress = usePlansStore(selectTilesInProgress)
  const tileTotal = usePlansStore((state) => state.yearBoard.tiles.length)
  const year = usePlansStore((state) => state.yearBoard.year)
  const lived = usePlansStore(selectPromisesLived)
  const target = usePlansStore((state) => state.lifetimeTarget)
  const sealedCapsules = usePlansStore(selectSealedCapsules)
  const waitingLetters = usePlansStore(selectWaitingLetters)

  const waiting = tileTotal - stamped + (target - lived) + sealedCapsules + waitingLetters
  const plannedDays = usePlansStore(selectPlannedDays)
  const savedSpots = usePlansStore(selectSavedSpots)
  // One trip in the store today; a count rather than a literal so this row
  // cannot drift from what the store actually holds.
  const tripsInProgress = trip ? 1 : 0

  return (
    <AppScreenLayout activeTab="plans">
      <ScreenIntro
        chip={PLANS_COPY.kicker}
        chipIcon="edit-3"
        title={PLANS_COPY.title}
        lede={PLANS_COPY.lede}
        aside={PLANS_COPY.waiting(waiting)}
      />

      {/* NEXT UP — the pinned trip. */}
      <PressableScale
        onPress={() => router.push('/(app)/plans/trip')}
        accessibilityLabel={`${trip.title}. ${PLANS_COPY.openItinerary}`}
      >
        <View style={styles.hero}>
          {trip.coverUri ? (
            <Image
              source={{ uri: trip.coverUri }}
              style={IMAGE_FILL}
              contentFit="cover"
              transition={200}
            />
          ) : null}

          {/*
           * The scrim is not decoration. The hero prints white text over a
           * photograph the couple chose, which could be a bright sky — `surface.
           * scrim` is the token that exists precisely so that text clears AA
           * whatever the photo turns out to be.
           */}
          <LinearGradient
            colors={['transparent', theme.colors.surface.scrim]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Feather name="clock" size={11} color={theme.colors.text.onPrimary} />
              <Text variant="countdown" tone="onPrimary">
                {PLANS_COPY.nextUp(10).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.heroBody}>
            <Text variant="countdown" tone="onPrimary">
              {`${trip.dateRange} · ${trip.destination}`.toUpperCase()}
            </Text>

            <Text variant="h3" tone="onPrimary">
              {trip.title}
            </Text>

            <Text variant="footnote" tone="onPrimary">
              Croissants in Montmartre, Seine night walks & rooftop sunsets
            </Text>
          </View>
        </View>
      </PressableScale>

      <View style={styles.heroChips}>
        <Chip label={PLANS_COPY.daysPlanned(plannedDays)} tone="success" icon="check-circle" />
        <Chip label={PLANS_COPY.savedSpots(savedSpots)} icon="bookmark" />
        <Chip
          label={PLANS_COPY.openItinerary}
          icon="arrow-right"
          selected
          onPress={() => router.push('/(app)/plans/trip')}
        />
      </View>

      {/* CHAPTERS & COLLECTIONS */}
      <View style={styles.sectionHeader}>
        <Text variant="caption" tone="placeholder">
          {PLANS_COPY.sectionLabel}
        </Text>

        <Text variant="countdown" tone="placeholder">
          {PLANS_COPY.sectionCount(7).toUpperCase()}
        </Text>
      </View>

      {/* Trips & Dates — the one full-width row, as the design draws it. */}
      <PressableScale
        onPress={() => router.push('/(app)/plans/trip/new')}
        accessibilityLabel={PLANS_COPY.trips.title}
      >
        <View style={styles.wideRow}>
          <View style={styles.wideTop}>
            <View style={[styles.tile, { backgroundColor: theme.colors.accents[1].soft }]}>
              <Feather name="compass" size={16} color={theme.colors.accents[1].ink} />
            </View>

            <View style={styles.wideFill}>
              <Text variant="labelStrong" tone="heading">
                {PLANS_COPY.trips.title}
              </Text>

              <Text variant="footnote" tone="body">
                {PLANS_COPY.trips.lede}
              </Text>
            </View>

            {/*
           * Derived, not the frame's literal "2 in progress". The store holds
           * one trip, so a hardcoded 2 would have this row disagreeing with the
           * single trip pinned at the top of the very same screen. It becomes a
           * real count the day `plansStore` holds a list.
           */}
          <Chip label={PLANS_COPY.trips.chip(tripsInProgress)} tone="success" />
          </View>

          <View style={styles.wishlist}>
            <Feather name="map-pin" size={12} color={theme.colors.text.placeholder} />

            <Text variant="footnote" tone="placeholder">
              {PLANS_COPY.trips.wishlist}
            </Text>

            <Feather name="chevron-right" size={14} color={theme.colors.text.placeholder} />
          </View>
        </View>
      </PressableScale>

      <View style={styles.grid}>
        <PlanCard
          icon="grid"
          accent={0}
          chip={PLANS_COPY.cards.year.chip}
          title={PLANS_COPY.cards.year.title}
          lede={PLANS_COPY.cards.year.lede(year)}
          status={PLANS_COPY.cards.year.status(stamped, tileTotal)}
          statusDetail={inProgress ? `${inProgress} in progress` : null}
          onPress={() => router.push('/(app)/plans/year')}
        />

        <PlanCard
          icon="check-circle"
          accent={1}
          chip={PLANS_COPY.cards.lifetime.chip}
          title={PLANS_COPY.cards.lifetime.title}
          lede={PLANS_COPY.cards.lifetime.lede}
          status={PLANS_COPY.cards.lifetime.status(lived, target - lived)}
          statusDetail="See Northern Lights together"
          onPress={() => router.push('/(app)/plans/lifetime')}
        />

        <PlanCard
          icon="lock"
          accent={2}
          chip={PLANS_COPY.cards.capsules.chip}
          title={PLANS_COPY.cards.capsules.title}
          lede={PLANS_COPY.cards.capsules.lede}
          status={PLANS_COPY.cards.capsules.status(sealedCapsules)}
          statusDetail="Unseals 17 Sept 2027"
          onPress={() => router.push('/(app)/plans/capsules')}
        />

        <PlanCard
          icon="mail"
          accent={0}
          chip={PLANS_COPY.cards.letters.chip}
          title={PLANS_COPY.cards.letters.title}
          lede={PLANS_COPY.cards.letters.lede}
          status={PLANS_COPY.cards.letters.status(waitingLetters)}
          statusDetail="Opens on 3rd Anniversary"
          onPress={() => router.push('/(app)/plans/letters')}
        />

        <PlanCard
          icon="film"
          accent={1}
          chip={PLANS_COPY.cards.watch.chip}
          title={PLANS_COPY.cards.watch.title}
          lede={PLANS_COPY.cards.watch.lede}
          status={PLANS_COPY.cards.watch.status(SAMPLE_WATCH_ROOM.tonight.title)}
          statusDetail={`${SAMPLE_WATCH_ROOM.queue.length} in tonight's queue`}
          onPress={() => router.push('/(app)/plans/watch')}
        />

        <PlanCard
          icon="map-pin"
          accent={2}
          chip={PLANS_COPY.cards.places.chip}
          title={PLANS_COPY.cards.places.title}
          lede={PLANS_COPY.cards.places.lede}
          status={PLANS_COPY.cards.places.status(34)}
          statusDetail={SAMPLE_PLACES.area}
          onPress={() => router.push('/(app)/plans/places')}
        />
      </View>

      <PressableScale
        onPress={() => router.push('/(app)/plans/trip/new')}
        accessibilityLabel={PLANS_COPY.add}
      >
        <View style={styles.addRow}>
          <View style={styles.addDisc}>
            <Feather name="plus" size={14} color={theme.colors.text.onPrimary} />
          </View>

          <Text variant="footnote" tone="brand">
            {PLANS_COPY.add}
          </Text>
        </View>
      </PressableScale>

      <View style={styles.quote}>
        <Feather name="heart" size={14} color={theme.colors.brand.primary} />

        <Text variant="body" tone="body" align="center">
          {`“${PLANS_COPY.quote}”`}
        </Text>

        <Text variant="countdown" tone="placeholder" align="center">
          {PLANS_COPY.quoteAttribution.toUpperCase()}
        </Text>
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    height: 200,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.scrim,
  },
  heroBody: {
    gap: theme.spacing.xs,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  wideRow: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  wideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  wideFill: {
    flex: 1,
    gap: 2,
  },
  tile: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
  },
  wishlist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  addDisc: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  quote: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
}))
