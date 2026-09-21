import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { TRIP_SETUP_COPY } from '@/copy/trips'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { plannerService } from '@/services/planner'
import type { BudgetBand, TravelStyle } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

const BUDGET_BANDS: BudgetBand[] = [100, 250, 500, 'flexible']

const STYLES: TravelStyle[] = [
  'relaxing',
  'adventure',
  'romantic',
  'foodie',
  'culture',
  'nature',
  'surprise',
]

/**
 * M06-S02 · Plan Something Together. Figma 3482:374.
 *
 * The form that produces the itinerary on M06-S03.
 *
 * FORM STATE IS LOCAL, not in `plansStore`. `ARCHITECTURE.md` is explicit that a
 * form never gets lifted into a global store, and this one earns the rule twice
 * over: a half-filled trip that the user abandons should leave nothing behind,
 * and the store already holds a trip that this screen has not replaced yet.
 * Only `createTrip` crosses the boundary, on submit.
 *
 * `react-hook-form` is what the other form screens use and is deliberately NOT
 * used here. Every control on this screen is a chip, a stepper or a toggle —
 * there is one free-text field and it cannot be invalid beyond being empty. RHF
 * would have added a resolver and a schema to validate a single non-empty
 * string.
 */
export function TripSetupScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const createTrip = usePlansStore((state) => state.createTrip)
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const names = [profile?.name ?? 'Chandu', partner?.name ?? 'Sarah'].join(' & ')

  const [destination, setDestination] = useState('')
  /*
   * The ceiling comes from the PLANNER, not from a number typed here.
   *
   * The stepper used to run to 14 while the planner could only lay out three
   * full days, so the form cheerfully sold a trip it could not build and the
   * couple got eleven empty days. Reading `maxNights` means the form can never
   * promise more than the provider delivers — and when a real backend replaces
   * the mock, the stepper grows with it rather than needing to be found and
   * edited.
   */
  const maxNights = plannerService.maxNights
  const [nights, setNights] = useState(() => Math.min(4, maxNights))
  const [band, setBand] = useState<BudgetBand>(500)
  const [styles_, setStyles] = useState<TravelStyle[]>(['romantic', 'foodie', 'culture'])
  const [error, setError] = useState<string | undefined>()

  const toggleStyle = useCallback((style: TravelStyle) => {
    setStyles((current) =>
      current.includes(style) ? current.filter((s) => s !== style) : [...current, style],
    )
  }, [])

  const onSubmit = useCallback(() => {
    const place = destination.trim() || TRIP_SETUP_COPY.destination.placeholder

    if (!place) {
      setError(TRIP_SETUP_COPY.destinationRequired)

      return
    }

    /*
     * The draft travels in the URL rather than through the store — a trip that
     * has not been planned yet is not the couple's trip, and if they abandon
     * the generating screen nothing should have changed. `createTrip` is still
     * called so the answers survive a trip back to this form; the PLAN itself
     * arrives later, from `plannerService`, via `setGeneratedTrip`.
     */
    createTrip({ destination: place, nights, budgetBand: band, styles: styles_ })

    router.push({
      pathname: '/(app)/plans/trip/generating',
      params: {
        destination: place,
        nights: String(nights),
        budget: String(band),
        styles: styles_.join(','),
      },
    })
  }, [band, createTrip, destination, nights, router, styles_])

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={TRIP_SETUP_COPY.eyebrow}
        chipIcon="heart"
        title={TRIP_SETUP_COPY.title}
        lede={TRIP_SETUP_COPY.lede}
      />

      {/*
       * The two mode cards. "Plan a Date" is drawn behind "Plan a Trip" in the
       * frame and is not a built destination, so it renders as a real but
       * unselected option rather than a live one — the same honesty rule
       * `BottomNav` applies to an unbuilt tab.
       */}
      <View style={styles.modes}>
        <View style={styles.modeCard}>
          <Feather name="calendar" size={18} color={theme.colors.text.placeholder} />

          <Text variant="labelStrong" tone="placeholder">
            {TRIP_SETUP_COPY.modes.date.title}
          </Text>

          <Text variant="footnote" tone="placeholder">
            {TRIP_SETUP_COPY.modes.date.lede}
          </Text>
        </View>

        <View style={[styles.modeCard, styles.modeCardActive]}>
          <View style={styles.selectedBadge}>
            <Feather name="check" size={10} color={theme.colors.text.onPrimary} />

            <Text variant="countdown" tone="onPrimary">
              SELECTED
            </Text>
          </View>

          <Feather name="map" size={18} color={theme.colors.brand.primary} />

          <Text variant="labelStrong" tone="heading">
            {TRIP_SETUP_COPY.modes.trip.title}
          </Text>

          <Text variant="footnote" tone="body">
            {TRIP_SETUP_COPY.modes.trip.lede}
          </Text>
        </View>
      </View>

      <View style={styles.nextChapter}>
        <Text variant="caption" tone="placeholder">
          {TRIP_SETUP_COPY.nextChapter}
        </Text>

        <Text variant="footnote" tone="heading">
          {TRIP_SETUP_COPY.nextChapterFor(names)}
        </Text>
      </View>

      {/* WHERE */}
      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <Text variant="labelStrong" tone="heading">
            {TRIP_SETUP_COPY.destination.label}
          </Text>

          <Text variant="caption" tone="placeholder">
            {TRIP_SETUP_COPY.destination.hint}
          </Text>
        </View>

        <Input
          label={TRIP_SETUP_COPY.destination.label}
          value={destination}
          onChangeText={(next) => {
            setDestination(next)
            setError(undefined)
          }}
          placeholder={TRIP_SETUP_COPY.destination.placeholder}
          error={error}
        />

        <View style={styles.chipRow}>
          <Chip
            label={TRIP_SETUP_COPY.destination.suggestion}
            icon="heart"
            onPress={() => setDestination('Paris, France')}
          />

          <Chip
            label={TRIP_SETUP_COPY.destination.surprise}
            icon="shuffle"
            onPress={() => setDestination('Surprise us')}
          />
        </View>
      </View>

      {/* HOW MANY DAYS — a stepper, as the frame draws it. */}
      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <View style={styles.fieldFill}>
            <Text variant="labelStrong" tone="heading">
              {TRIP_SETUP_COPY.nights.label}
            </Text>

            <Text variant="footnote" tone="placeholder">
              {TRIP_SETUP_COPY.nights.hint}
            </Text>
          </View>

          <View style={styles.stepper}>
            <Pressable
              onPress={() => setNights((n) => Math.max(1, n - 1))}
              accessibilityRole="button"
              accessibilityLabel={TRIP_SETUP_COPY.nights.decrease}
              style={styles.stepperButton}
              hitSlop={6}
            >
              <Feather name="minus" size={14} color={theme.colors.brand.primary} />
            </Pressable>

            <Text variant="labelStrong" tone="heading">
              {TRIP_SETUP_COPY.nights.unit(nights)}
            </Text>

            <Pressable
              onPress={() => setNights((n) => Math.min(maxNights, n + 1))}
              accessibilityRole="button"
              accessibilityLabel={TRIP_SETUP_COPY.nights.increase}
              style={styles.stepperButton}
              hitSlop={6}
            >
              <Feather name="plus" size={14} color={theme.colors.brand.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* BUDGET */}
      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <Text variant="labelStrong" tone="heading">
            {TRIP_SETUP_COPY.budget.label}
          </Text>

          <Text variant="caption" tone="placeholder">
            {TRIP_SETUP_COPY.budget.hint}
          </Text>
        </View>

        <View style={styles.chipRow}>
          {BUDGET_BANDS.map((option) => (
            <Chip
              key={String(option)}
              label={option === 'flexible' ? TRIP_SETUP_COPY.budget.flexible : `£${option}`}
              selected={band === option}
              onPress={() => setBand(option)}
            />
          ))}
        </View>
      </View>

      {/* STYLE */}
      <View style={styles.field}>
        <View style={styles.fieldHead}>
          <Text variant="labelStrong" tone="heading">
            {TRIP_SETUP_COPY.style.label}
          </Text>

          <Text variant="caption" tone="placeholder">
            {TRIP_SETUP_COPY.style.hint}
          </Text>
        </View>

        <View style={styles.chipRow}>
          {STYLES.map((style) => (
            <Chip
              key={style}
              label={TRIP_SETUP_COPY.style.options[style]}
              icon={styles_.includes(style) ? 'check' : undefined}
              selected={styles_.includes(style)}
              onPress={() => toggleStyle(style)}
            />
          ))}
        </View>
      </View>

      <Button
        label={TRIP_SETUP_COPY.submit}
        onPress={onSubmit}
        trailing={<Feather name="arrow-right" size={16} color={theme.colors.text.onPrimary} />}
      />

      <Text variant="footnote" tone="placeholder" align="center">
        {TRIP_SETUP_COPY.footer}
      </Text>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  modes: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modeCard: {
    flex: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  modeCardActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.field,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  nextChapter: {
    gap: 2,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  field: {
    gap: theme.spacing.md,
  },
  fieldHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  fieldFill: {
    flex: 1,
    gap: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.card,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
}))
