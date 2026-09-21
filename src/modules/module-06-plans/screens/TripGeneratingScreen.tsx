import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PLANNER_COPY } from '@/copy/planner'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ProgressBar } from '@/modules/module-06-plans/components/ProgressBar'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { samplePhoto } from '@/sample/photos'
import { PLANNER_CATALOGUE } from '@/sample/plannerCatalogue'
import type { BudgetBand, TravelStyle } from '@/services/plans/types'
import { plannerService, type PlannerErrorCode, type PlannerStage } from '@/services/planner'
import { usePlansStore } from '@/state/plansStore'

const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

const STAGE_ICON: Record<PlannerStage['key'], keyof typeof Feather.glyphMap> = {
  reading: 'heart',
  searching: 'search',
  routing: 'map',
  budgeting: 'credit-card',
  writing: 'edit-3',
}

const STAGE_ORDER: PlannerStage['key'][] = [
  'reading',
  'searching',
  'routing',
  'budgeting',
  'writing',
]

/**
 * M06-S13 · Building the plan. The screen between "Create our plan" and the
 * itinerary.
 *
 * WHY THIS SCREEN EXISTS AT ALL. The planner takes a few seconds and the couple
 * has just answered five questions. A spinner would throw that away — it says
 * nothing was considered. Showing the work, stage by stage, is what makes the
 * wait read as care rather than as latency, and each line names something the
 * planner genuinely does (see `copy/planner.ts` for the rule that keeps those
 * lines honest).
 *
 * THE DRAFT ARRIVES THROUGH THE URL, not through the store. A half-answered trip
 * has no business in global state — `TripSetupScreen` says the same thing about
 * its own form. Params also mean this screen can be reloaded or deep-linked and
 * still knows what it was asked for.
 *
 * `started` guards against React 18's double-invoked effects in development
 * running the planner twice; without it the stage list restarts halfway through
 * and looks broken.
 */
export function TripGeneratingScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const setGeneratedTrip = usePlansStore((state) => state.setGeneratedTrip)

  const params = useLocalSearchParams<{
    destination?: string
    nights?: string
    budget?: string
    styles?: string
  }>()

  /*
   * Params arrive as strings from a URL anyone can edit, so every one of them is
   * validated rather than cast. `Number('')` is 0 and `Number('abc')` is NaN;
   * either would reach the planner as a nonsense night count and come back as an
   * empty trip rather than an error.
   */
  const destination = params.destination ?? ''
  const parsedNights = Number(params.nights)
  const nights = Number.isFinite(parsedNights) && parsedNights > 0 ? Math.floor(parsedNights) : 4

  const parsedBudget = Number(params.budget)
  const budgetBand: BudgetBand =
    params.budget === 'flexible'
      ? 'flexible'
      : parsedBudget === 100 || parsedBudget === 250 || parsedBudget === 500
        ? parsedBudget
        : 500

  const styles_ = (params.styles ? params.styles.split(',').filter(Boolean) : []) as TravelStyle[]

  const [stage, setStage] = useState<PlannerStage | null>(null)
  const [stageIndex, setStageIndex] = useState(0)
  const [failure, setFailure] = useState<PlannerErrorCode | null>(null)

  /*
   * WHAT THE GUARD IS ACTUALLY FOR, and why it is keyed rather than a boolean.
   *
   * `run` gets a new identity on every render — `styles_` is a fresh array from
   * `split()` and `router` is a fresh object from `useRouter()` — so the effect
   * below re-fires constantly. A bare `if (started) return` would stop that, but
   * it would ALSO stop the retry: the error screen's chips `replace` onto this
   * same route, and if the navigator reuses the mounted component rather than
   * remounting it, the flag is still set, the planner never re-runs, and the
   * couple sits on an error screen naming a destination they have just changed.
   *
   * Keying on the draft fixes both: the same draft never runs twice, a different
   * draft always does.
   */
  const signature = `${destination}|${nights}|${budgetBand}|${styles_.join(',')}`
  const startedFor = useRef<string | null>(null)

  const run = useCallback(async () => {
    setFailure(null)
    setStageIndex(0)
    setStage(null)

    const result = await plannerService.generate({
      draft: { destination, nights, budgetBand, styles: styles_ },
      onProgress: (next, index) => {
        setStage(next)
        setStageIndex(index)
      },
    })

    if (!result.ok) {
      setFailure(result.error.code)

      return
    }

    setGeneratedTrip(result.value)
    // `replace`, not `push`: pressing back from the finished itinerary should
    // return to the setup form, not to a progress screen with nothing left to do.
    router.replace('/(app)/plans/trip')
  }, [budgetBand, destination, nights, router, setGeneratedTrip, styles_])

  useEffect(() => {
    if (startedFor.current === signature) return

    startedFor.current = signature
    void run()
  }, [run, signature])

  /* ---------------- it did not work ---------------- */

  if (failure) {
    const copy = PLANNER_COPY.errors[failure]

    /*
     * Only the unknown-destination case takes the place back into its own
     * sentence, so only that one's `lede` is a function. Narrowing on the CODE
     * rather than probing the value keeps the copy table free to add another
     * parameterised message later without this branch guessing.
     */
    const lede =
      failure === 'DESTINATION_UNKNOWN'
        ? PLANNER_COPY.errors.DESTINATION_UNKNOWN.lede(destination)
        : (copy.lede as string)

    return (
      <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
        <ScreenIntro
          chip={PLANNER_COPY.eyebrow}
          chipIcon="alert-circle"
          title={copy.heading}
          lede={lede}
        />

        {failure === 'DESTINATION_UNKNOWN' ? (
          <View style={styles.section}>
            <Text variant="caption" tone="placeholder">
              {PLANNER_COPY.weKnow}
            </Text>

            <View style={styles.chipRow}>
              {PLANNER_CATALOGUE.map((entry) => (
                <Chip
                  key={entry.name}
                  label={entry.name.split(',')[0]}
                  icon="map-pin"
                  onPress={() =>
                    router.replace({
                      pathname: '/(app)/plans/trip/generating',
                      params: {
                        destination: entry.name,
                        nights: String(nights),
                        budget: String(budgetBand),
                        styles: styles_.join(','),
                      },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        <Button label={copy.action} onPress={() => router.replace('/(app)/plans/trip/new')} />
      </AppScreenLayout>
    )
  }

  /* ---------------- working ---------------- */

  const total = STAGE_ORDER.length
  const currentKey = stage?.key ?? 'reading'

  return (
    <AppScreenLayout activeTab="plans">
      <View style={styles.art}>
        <Image
          source={{ uri: samplePhoto('planeWing', 800, 400) }}
          style={IMAGE_FILL}
          contentFit="cover"
          transition={300}
        />
      </View>

      <ScreenIntro
        chip={PLANNER_COPY.eyebrow}
        chipIcon="zap"
        title={PLANNER_COPY.title}
        lede={PLANNER_COPY.lede(destination || 'something good')}
      />

      <ProgressBar
        value={(stageIndex + 1) / total}
        label={PLANNER_COPY.stepOf(stageIndex + 1, total)}
      />

      <View style={styles.stages}>
        {STAGE_ORDER.map((key, index) => {
          const done = index < stageIndex
          const active = key === currentKey

          return (
            <View key={key} style={[styles.stage, active && styles.stageActive]}>
              <View style={styles.stageIcon}>
                {done ? (
                  <Feather name="check" size={14} color={theme.colors.feedback.success} />
                ) : active ? (
                  <ActivityIndicator size="small" color={theme.colors.brand.primary} />
                ) : (
                  <Feather
                    name={STAGE_ICON[key]}
                    size={14}
                    color={theme.colors.text.muted}
                  />
                )}
              </View>

              <View style={styles.stageFill}>
                <Text
                  variant="labelStrong"
                  tone={done ? 'body' : active ? 'heading' : 'placeholder'}
                >
                  {PLANNER_COPY.stages[key]}
                </Text>

                {active && stage ? (
                  <Text variant="countdown" tone="brand">
                    {stage.detail}
                  </Text>
                ) : null}
              </View>
            </View>
          )
        })}
      </View>

      <Text variant="footnote" tone="placeholder" align="center">
        {PLANNER_COPY.footnote}
      </Text>

      <Button
        label={PLANNER_COPY.cancel}
        variant="link"
        onPress={() => router.replace('/(app)/plans/trip/new')}
      />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  art: {
    height: 140,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  section: {
    gap: theme.spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  stages: {
    gap: theme.spacing.sm,
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  stageActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.field,
  },
  stageIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageFill: {
    flex: 1,
    gap: 2,
  },
}))
