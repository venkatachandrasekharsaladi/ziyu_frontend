import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { TRIP_ITINERARY_COPY } from '@/copy/trips'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { CoverPhotoField } from '@/design-system/patterns/CoverPhotoField'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { MomentCard } from '@/modules/module-06-plans/components/MomentCard'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
/* ──────────────── ALTERNATE DESIGN PREVIEW · delete to remove ──────────────── */
import { SHOW_ITINERARY_PREVIEW } from '@/modules/module-06-plans/preview/previewFlag'
/* ─────────────────────────── end preview import ────────────────────────────── */

import { SAMPLE_TRIP_EXTRAS, SAMPLE_TRIP_IDEA } from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M06-S03 · The itinerary. Figma 3482:15 ("Our Little Adventure").
 *
 * The longest screen in the cluster — 2866pt in the frame — and the one the trip
 * setup screen produces.
 *
 * DAY SELECTION LIVES IN THE STORE, not in local state, unlike every other
 * control here. Which day you were looking at is the one thing on this screen
 * you would be annoyed to lose by tapping into a moment and coming back, and it
 * is the only piece of this screen's state that another screen could ever want.
 *
 * Three of the four days carry no moments, exactly as the frame draws them
 * (their chips are present, their content is not). That makes the empty state a
 * FIRST-CLASS view here rather than an edge case — it is what three quarters of
 * this screen shows on first open.
 */
export function TripItineraryScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const trip = usePlansStore((state) => state.trip)
  const selectedDay = usePlansStore((state) => state.selectedDay)
  const selectDay = usePlansStore((state) => state.selectDay)
  const toggleMomentSaved = usePlansStore((state) => state.toggleMomentSaved)
  const setTripCover = usePlansStore((state) => state.setTripCover)

  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const names = [profile?.name ?? 'Chandu', partner?.name ?? 'Sarah'].join(' & ')
  const partnerName = partner?.name ?? 'Sarah'

  const [saved, setSaved] = useState(false)

  const day = trip.days.find((d) => d.number === selectedDay) ?? trip.days[0]
  const percent = Math.round((trip.momentsPlanned / trip.momentsTotal) * 100)
  const bandLabel = trip.budgetBand === 'flexible' ? 'Flexible' : `${trip.currency}${trip.budgetBand}`

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      {/* HERO */}
      <View style={styles.hero}>
        <CoverPhotoField uri={trip.coverUri} onChange={setTripCover} testID="trip-cover" />

        <LinearGradient
          colors={['transparent', theme.colors.surface.scrim]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroBadge}>
          <Feather name="award" size={11} color={theme.colors.text.onPrimary} />

          <Text variant="countdown" tone="onPrimary">
            {TRIP_ITINERARY_COPY.handcrafted.toUpperCase()}
          </Text>
        </View>

        <View style={styles.heroBody}>
          <Text variant="h3" tone="onPrimary">
            {TRIP_ITINERARY_COPY.heroTitle(trip.nights, trip.destination)}
          </Text>

          <Text variant="footnote" tone="onPrimary">
            {TRIP_ITINERARY_COPY.craftedFor(names)}
          </Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        <Chip label={trip.dateRange} icon="calendar" />
        <Chip label={TRIP_ITINERARY_COPY.travellers(trip.nights, trip.travellers)} icon="users" />
        <Chip
          label={TRIP_ITINERARY_COPY.budget(trip.currency, trip.estimatedCost, bandLabel)}
          icon="credit-card"
          tone="success"
        />
      </View>

      {/* PROGRESS */}
      <View style={styles.panel}>
        <ProgressBar
          value={trip.momentsPlanned / trip.momentsTotal}
          label={TRIP_ITINERARY_COPY.momentsPlanned(trip.momentsPlanned, trip.momentsTotal)}
          trailing={TRIP_ITINERARY_COPY.momentsSet(percent)}
          footnote={TRIP_ITINERARY_COPY.roomForSerendipity}
        />
      </View>

      {/* DAY SELECTOR */}
      <View style={styles.daySection}>
        <Text variant="caption" tone="placeholder">
          {TRIP_ITINERARY_COPY.selectDay}
        </Text>

        {/*
         * Horizontally scrolled rather than wrapped: a 14-day trip is reachable
         * from the setup screen's stepper, and four wrapped rows of day chips
         * would push the timeline off the screen entirely.
         */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScroll}
        >
          {trip.days.map((d) => {
            const active = d.number === selectedDay

            return (
              <Pressable
                key={d.id}
                onPress={() => selectDay(d.number)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${TRIP_ITINERARY_COPY.dayChip(d.number)}, ${d.title}`}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text variant="countdown" tone={active ? 'onPrimary' : 'placeholder'}>
                  {TRIP_ITINERARY_COPY.dayChip(d.number).toUpperCase()}
                </Text>

                <Text variant="footnote" tone={active ? 'onPrimary' : 'body'}>
                  {d.title}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* THE DAY */}
      <View style={styles.daySection}>
        <Text variant="h3" tone="heading">
          {TRIP_ITINERARY_COPY.dayHeading(day.number, day.title)}
        </Text>

        <Text variant="footnote" tone="body">
          {day.subtitle}
        </Text>
      </View>

      {day.moments.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="sunrise" size={20} color={theme.colors.brand.primary} />

          <Text variant="labelStrong" tone="heading" align="center">
            {TRIP_ITINERARY_COPY.dayEmpty.heading}
          </Text>

          <Text variant="footnote" tone="body" align="center">
            {TRIP_ITINERARY_COPY.dayEmpty.lede}
          </Text>

          <Chip label={TRIP_ITINERARY_COPY.dayEmpty.action} icon="plus" selected />
        </View>
      ) : (
        <View style={styles.timeline}>
          {day.moments.map((moment, index) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              last={index === day.moments.length - 1}
              onToggleSaved={() => toggleMomentSaved(moment.id)}
            />
          ))}
        </View>
      )}

      {/* ONE LITTLE IDEA */}
      <View style={styles.idea}>
        <View style={styles.ideaHead}>
          <Feather name="zap" size={12} color={theme.colors.accents[0].ink} />

          <Text variant="caption" tone="placeholder">
            {SAMPLE_TRIP_IDEA.label}
          </Text>
        </View>

        <Text variant="body" tone="heading">
          {`“${SAMPLE_TRIP_IDEA.quote}”`}
        </Text>

        <Text variant="countdown" tone="placeholder">
          {SAMPLE_TRIP_IDEA.attribution}
        </Text>
      </View>

      {/* ADD A LITTLE SOMETHING */}
      <View style={styles.daySection}>
        <Text variant="labelStrong" tone="heading">
          {TRIP_ITINERARY_COPY.extrasLabel}
        </Text>

        <Text variant="footnote" tone="body">
          {TRIP_ITINERARY_COPY.extrasLede}
        </Text>

        <View style={styles.chipRow}>
          {SAMPLE_TRIP_EXTRAS.map((extra) => (
            <Chip key={extra.key} label={extra.label} icon={extra.icon} />
          ))}
        </View>
      </View>

      <Button
        label={saved ? TRIP_ITINERARY_COPY.savedConfirmation : TRIP_ITINERARY_COPY.primary}
        onPress={() => setSaved(true)}
        disabled={saved}
      />

      <Button
        label={TRIP_ITINERARY_COPY.share(partnerName)}
        variant="soft"
        onPress={() => router.push('/(app)/chat')}
      />

      <View style={styles.secondary}>
        <Chip label={TRIP_ITINERARY_COPY.regenerate} icon="refresh-cw" />
        <Chip label={TRIP_ITINERARY_COPY.adjustBudget} icon="sliders" />
        <Chip
          label={TRIP_ITINERARY_COPY.changeVibe}
          icon="heart"
          onPress={() => router.push('/(app)/plans/trip/new')}
        />
      </View>

      {/* ─────────── ALTERNATE DESIGN PREVIEW · delete this block to remove ───────────
        * The only way into the second itinerary design. Flip the flag in
        * `preview/previewFlag.ts` to hide it without deleting anything, or
        * follow `preview/README.md` to remove it for good.
        */}
      {SHOW_ITINERARY_PREVIEW ? (
        <Chip
          label="Alternate design"
          icon="eye"
          onPress={() => router.push('/(app)/plans/trip/preview')}
        />
      ) : null}
      {/* ────────────────────────── end preview block ─────────────────────────────── */}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  hero: {
    height: 220,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.soft,
    boxShadow: theme.elevation.illustration,
    overflow: 'hidden',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.scrim,
  },
  heroBody: {
    gap: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  panel: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  daySection: {
    gap: theme.spacing.sm,
  },
  // Negative margin lets the chip rail bleed to the screen edge while the rest
  // of the column keeps its inset — the frame scrolls them off-edge, and a rail
  // that stops short reads as a list that has ended.
  dayScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xl,
  },
  dayChip: {
    gap: 2,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  dayChipActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primary,
  },
  timeline: {
    gap: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  idea: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.accents[0].soft,
  },
  ideaHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  secondary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
}))
