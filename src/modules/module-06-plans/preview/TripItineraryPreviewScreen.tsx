import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import {
  PREVIEW_COPY,
  PREVIEW_DAYS,
  PREVIEW_EXTRAS,
  PREVIEW_MOMENTS,
} from '@/modules/module-06-plans/preview/itineraryPreviewCopy'
import { ProgressMedallion } from '@/modules/module-06-plans/preview/ProgressMedallion'
import { samplePhoto } from '@/sample/photos'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * Fills its parent, as a PLAIN object — Unistyles styles do not survive into
 * expo-image. See `expoImageStyles.test.ts`.
 */
const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/**
 * ALTERNATE ITINERARY DESIGN — Figma `Tales of Two` / `New Features` /
 * 3482:965 ("Our Paris Adventure").
 *
 * A SECOND design for the same screen `/plans/trip` already ships. It exists to
 * be looked at and then kept or deleted; `README.md` in this folder says how to
 * do either, in three steps.
 *
 * REBUILT IN OUR TOKENS, NOT ITS OWN GREYS. The frame is the earlier iteration
 * and is drawn in placeholder grey with empty image boxes. Reproducing that
 * faithfully would have produced a screen nobody could judge — it would lose on
 * looking unfinished rather than win or lose on its layout. So every surface,
 * ink and accent here comes from `theme.colors`, the same as the shipped
 * screen, and the real sample photography is used. What is being compared is
 * the DESIGN: a numbered timeline, a gauge instead of a bar, stat tiles, a
 * prompt pinned inside a moment, and extras that each carry an instruction.
 *
 * SELF-CONTAINED ON PURPOSE. Its copy sits beside it rather than in `src/copy/`
 * so that deleting the design is one folder, not a hunt. It reads the shared
 * `plansStore` but writes nothing to it — showing this screen to someone cannot
 * change the trip the real screen is holding.
 */
export function TripItineraryPreviewScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const trip = usePlansStore((state) => state.trip)
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const names = [profile?.name ?? 'Chandu', partner?.name ?? 'Sarah'].join(' & ')

  // Local, not the store: this screen is a mock-up being judged, and a day
  // chosen here must not change what `/plans/trip` shows afterwards.
  const [day, setDay] = useState(1)
  const [saved, setSaved] = useState(false)

  const planned = 3
  const total = 7
  const perDay = Math.round(trip.estimatedCost / Math.max(1, trip.nights))

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      {/* A standing reminder that this is a candidate, not the shipped screen. */}
      <View style={styles.previewBanner}>
        <Feather name="eye" size={12} color={theme.colors.brand.primary} />

        <Text variant="countdown" tone="brand">
          {PREVIEW_COPY.previewBadge.toUpperCase()}
        </Text>
      </View>

      <View style={styles.headerBlock}>
        <Text variant="caption" tone="brand" align="center">
          {PREVIEW_COPY.eyebrow}
        </Text>

        <Text variant="h3" tone="heading" align="center">
          {PREVIEW_COPY.headerTitle}
        </Text>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Chip label={PREVIEW_COPY.dateRange} icon="calendar" />
          <Chip label={PREVIEW_COPY.couple(names)} icon="heart" tone="brand" />
        </View>

        <View style={styles.heroArt}>
          <Image
            source={{ uri: samplePhoto('parisDusk', 800, 400) }}
            style={IMAGE_FILL}
            contentFit="cover"
            transition={200}
          />
        </View>

        <Text variant="caption" tone="placeholder">
          {PREVIEW_COPY.badge}
        </Text>

        <Text variant="h3" tone="heading">
          {PREVIEW_COPY.title}
        </Text>
      </View>

      {/* STAT TILES */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Feather name="users" size={14} color={theme.colors.brand.primary} />

          <Text variant="caption" tone="placeholder">
            {PREVIEW_COPY.duration}
          </Text>

          <Text variant="labelStrong" tone="heading">
            {PREVIEW_COPY.durationValue(trip.nights, trip.travellers)}
          </Text>
        </View>

        <View style={styles.stat}>
          <Feather name="credit-card" size={14} color={theme.colors.accents[1].ink} />

          <Text variant="caption" tone="placeholder">
            {PREVIEW_COPY.budget}
          </Text>

          <Text variant="labelStrong" tone="heading">
            {PREVIEW_COPY.budgetValue(
              `${trip.currency}${trip.estimatedCost}`,
              `${trip.currency}${perDay}`,
            )}
          </Text>
        </View>
      </View>

      {/* PROGRESS — the gauge this design uses instead of a bar */}
      <View style={styles.progress}>
        <View style={styles.progressFill}>
          <View style={styles.progressTitle}>
            <View style={styles.dot} />

            <Text variant="labelStrong" tone="heading">
              {PREVIEW_COPY.planned(planned, total)}
            </Text>
          </View>

          <Text variant="footnote" tone="body">
            {PREVIEW_COPY.serendipity}
          </Text>
        </View>

        <ProgressMedallion
          value={planned / total}
          label={PREVIEW_COPY.planned(planned, total)}
        />
      </View>

      {/* DAY SELECTOR */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="caption" tone="placeholder">
            {PREVIEW_COPY.selectDay}
          </Text>

          <Text variant="countdown" tone="placeholder">
            {PREVIEW_COPY.dayOf(day, PREVIEW_DAYS.length)}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScroll}
        >
          {PREVIEW_DAYS.map((d) => {
            const active = d.number === day

            return (
              <Pressable
                key={d.number}
                onPress={() => setDay(d.number)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${PREVIEW_COPY.dayChip(d.number)}, ${d.title}`}
                style={[styles.dayPill, active && styles.dayPillActive]}
              >
                <View style={[styles.dayIndex, active && styles.dayIndexActive]}>
                  <Text variant="countdown" tone={active ? 'brand' : 'placeholder'}>
                    {d.number}
                  </Text>
                </View>

                <View>
                  <Text variant="countdown" tone={active ? 'onPrimary' : 'placeholder'}>
                    {PREVIEW_COPY.dayChip(d.number).toUpperCase()}
                  </Text>

                  <Text variant="footnote" tone={active ? 'onPrimary' : 'body'}>
                    {d.title}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* THE DAY */}
      <View style={styles.sectionHead}>
        <View style={styles.dayHeading}>
          <Text variant="h3" tone="heading">
            {PREVIEW_COPY.dayTitle}
          </Text>

          <Text variant="footnote" tone="body">
            {PREVIEW_COPY.daySubtitle}
          </Text>
        </View>

        <Chip label={PREVIEW_COPY.plannedBadge(PREVIEW_MOMENTS.length)} tone="success" />
      </View>

      {day === 1 ? (
        <View style={styles.timeline}>
          {PREVIEW_MOMENTS.map((moment, index) => (
            <View key={moment.id} style={styles.momentRow}>
              {/* Numbered rail — the detail that distinguishes this design. */}
              <View style={styles.rail} importantForAccessibility="no-hide-descendants">
                <View style={styles.railBadge}>
                  <Text variant="countdown" tone="onPrimary">
                    {moment.index}
                  </Text>
                </View>

                {index === PREVIEW_MOMENTS.length - 1 ? null : <View style={styles.railLine} />}
              </View>

              <View style={styles.momentCard}>
                <View style={styles.momentHead}>
                  <View style={styles.momentTime}>
                    <Text variant="countdown" tone="brand">
                      {moment.time}
                    </Text>

                    <Text variant="countdown" tone="placeholder">
                      {moment.slot}
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

                {moment.photoKey ? (
                  <View style={styles.momentPhoto}>
                    <Image
                      source={{ uri: samplePhoto(moment.photoKey, 700, 420) }}
                      style={IMAGE_FILL}
                      contentFit="cover"
                      transition={200}
                    />

                    {moment.photoCaption ? (
                      <View style={styles.photoCaption}>
                        <Text variant="countdown" tone="onPrimary">
                          {moment.photoCaption}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {moment.prompt ? (
                  <View style={styles.prompt}>
                    <View style={styles.promptHead}>
                      <Feather name="zap" size={11} color={theme.colors.accents[0].ink} />

                      <Text variant="countdown" tone="placeholder">
                        {PREVIEW_COPY.promptLabel.toUpperCase()}
                      </Text>
                    </View>

                    <Text variant="footnote" tone="heading">
                      {moment.prompt}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.momentActions}>
                  <View style={styles.action}>
                    <Feather
                      name="bookmark"
                      size={11}
                      color={
                        moment.saved ? theme.colors.brand.primary : theme.colors.text.placeholder
                      }
                    />

                    <Text variant="countdown" tone={moment.saved ? 'brand' : 'placeholder'}>
                      {moment.saved ? PREVIEW_COPY.saved : PREVIEW_COPY.save}
                    </Text>
                  </View>

                  <View style={styles.action}>
                    <Feather
                      name="refresh-cw"
                      size={11}
                      color={theme.colors.text.placeholder}
                    />

                    <Text variant="countdown" tone="placeholder">
                      {PREVIEW_COPY.replace}
                    </Text>
                  </View>

                  {moment.index === 1 ? (
                    <View style={styles.action}>
                      <Feather name="plus" size={11} color={theme.colors.text.placeholder} />

                      <Text variant="countdown" tone="placeholder">
                        {PREVIEW_COPY.addNote}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.otherDay}>
          <Feather name="sunrise" size={18} color={theme.colors.brand.primary} />

          <Text variant="footnote" tone="body" align="center">
            {PREVIEW_COPY.serendipity}
          </Text>
        </View>
      )}

      {/* ONE LITTLE IDEA */}
      <View style={styles.idea}>
        <View style={styles.promptHead}>
          <Feather name="feather" size={12} color={theme.colors.accents[0].ink} />

          <Text variant="caption" tone="placeholder">
            {PREVIEW_COPY.ideaLabel}
          </Text>
        </View>

        <Text variant="body" tone="heading">
          {`“${PREVIEW_COPY.ideaQuote}”`}
        </Text>

        <Text variant="footnote" tone="body">
          {PREVIEW_COPY.ideaBody}
        </Text>
      </View>

      {/* ADD A LITTLE SOMETHING — a 2×2 grid, not a chip row */}
      <View style={styles.sectionHead}>
        <View style={styles.dayHeading}>
          <Text variant="labelStrong" tone="heading">
            {PREVIEW_COPY.extrasLabel}
          </Text>

          <Text variant="footnote" tone="body">
            {PREVIEW_COPY.extrasLede}
          </Text>
        </View>

        <Text variant="countdown" tone="brand">
          {PREVIEW_COPY.viewAll}
        </Text>
      </View>

      <View style={styles.extras}>
        {PREVIEW_EXTRAS.map((extra, index) => (
          <View key={extra.key} style={styles.extraCell}>
            <View style={styles.extraCard}>
              <View
                style={[
                  styles.extraIcon,
                  { backgroundColor: theme.colors.accents[index % 3].soft },
                ]}
              >
                <Feather
                  name={extra.icon}
                  size={13}
                  color={theme.colors.accents[index % 3].ink}
                />
              </View>

              <Text variant="labelStrong" tone="heading">
                {extra.title}
              </Text>

              <Text variant="countdown" tone="placeholder">
                {extra.body}
              </Text>

              <Text variant="countdown" tone="brand">
                {`${extra.action} +`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.secondary}>
        <Chip label={PREVIEW_COPY.regenerate(day)} icon="refresh-cw" />
        <Chip label={PREVIEW_COPY.adjustBudget} icon="sliders" />
        <Chip label={PREVIEW_COPY.changeVibe} icon="heart" />
      </View>

      <Button
        label={saved ? PREVIEW_COPY.savedConfirmation : PREVIEW_COPY.primary}
        onPress={() => setSaved(true)}
        disabled={saved}
      />

      <Text variant="footnote" tone="placeholder" align="center">
        {PREVIEW_COPY.footnote}
      </Text>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.brand.primary,
  },
  headerBlock: {
    alignItems: 'center',
    gap: 2,
  },
  hero: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.field,
  },
  heroTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  heroArt: {
    height: 140,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stat: {
    flex: 1,
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  progressFill: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  progressTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  dayHeading: {
    flex: 1,
    gap: 2,
  },
  dayScroll: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xl,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  dayPillActive: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.brand.primary,
  },
  dayIndex: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  dayIndexActive: {
    backgroundColor: theme.colors.surface.card,
  },
  timeline: {
    gap: theme.spacing.md,
  },
  momentRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rail: {
    alignItems: 'center',
    width: 24,
  },
  railBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  railLine: {
    flex: 1,
    width: 1,
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.border.subtle,
  },
  momentCard: {
    flex: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  momentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  momentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  momentPhoto: {
    height: 140,
    justifyContent: 'flex-end',
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  photoCaption: {
    alignSelf: 'flex-start',
    margin: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.scrim,
  },
  prompt: {
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.accents[0].soft,
  },
  promptHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  momentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  otherDay: {
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
  extras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  extraCell: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  extraCard: {
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  extraIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
  },
  secondary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
}))
