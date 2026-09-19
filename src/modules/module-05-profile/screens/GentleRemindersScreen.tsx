import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SPACE_REMINDERS_COPY as COPY } from '@/copy/spaceReminders'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { daysUntilNextOccurrence } from '@/utils/daysUntil'
import { formatDayMonth } from '@/utils/formatStoryDate'
import { useBackTo } from '@/hooks/useBackTo'

/**
 * M05-S27 — Space → Gentle Reminders. Figma `3430:2209`.
 *
 * EVERY FIGURE IS COMPUTED. The frame's worked example — a 3rd anniversary 18
 * days away, a birthday on Oct 12 — was tempting to ship as written. What ships
 * instead reads `storyStore`: the anniversary card appears only when there is
 * an anniversary, each birthday row only when that birthday was given, and the
 * whole page falls back to an empty state when none of it was.
 *
 * The "Unfinished Memories" card has NO data source — nothing in the app tracks
 * a half-written memory yet. Rather than dressing the frame's coastal-drive
 * draft up as real, the card keeps its heading and says plainly that there is
 * nothing waiting. It will start listing drafts the day something stores them.
 */
export function GentleRemindersScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const partner = useRelationshipStore((state) => state.partner)
  const keyDates = useStoryStore((state) => state.keyDates)
  const met = useStoryStore((state) => state.met)

  const back = useBackTo('/(app)/space/preferences')
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  // The anniversary falls back to the day they met: a pair who answered the
  // meeting question but skipped the anniversary one still have a date.
  const anniversaryDate = keyDates?.anniversary ?? met?.value
  const daysAway = daysUntilNextOccurrence(anniversaryDate)
  const years = yearsOf(anniversaryDate)

  const birthdays = [
    { key: 'you', name: COPY.yourBirthday, date: keyDates?.yourBirthday },
    { key: 'partner', name: partner?.name ?? '', date: keyDates?.partnerBirthday },
  ].filter((row) => Boolean(row.date) && Boolean(row.name))

  const header = (
    <View style={styles.header}>
      <Text variant="h1" tone="heading" align="center">
        {COPY.title}
      </Text>
      <Text variant="body" tone="body" align="center">
        {COPY.lede}
      </Text>
    </View>
  )

  if (daysAway === null && birthdays.length === 0) {
    return (
      <AppScreenLayout activeTab="space" onBack={back}>
        {header}

        <View style={styles.card}>
          <Text variant="h3" tone="heading" align="center">
            {COPY.emptyTitle}
          </Text>
          <Text variant="body" tone="body" align="center">
            {COPY.emptyBody}
          </Text>
        </View>

        <Button label={COPY.addDates} onPress={go('/(app)/settings/dates')} />
      </AppScreenLayout>
    )
  }

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      {header}

      <View style={styles.cards}>
        {daysAway !== null ? (
          <View style={styles.highlight}>
            <View style={styles.pill}>
              <Text variant="caption" tone="brand">
                {COPY.comingUp}
              </Text>
            </View>

            <Text variant="h2" tone="heading">
              {COPY.anniversary}
            </Text>
            <Text variant="body" tone="body">
              {years === null ? COPY.anniversaryBodyPlain : COPY.anniversaryBody(years + 1)}
            </Text>

            <View style={styles.countRow}>
              <View>
                {daysAway === 0 ? null : (
                  <Text variant="countdown" tone="brand">
                    {String(daysAway)}
                  </Text>
                )}
                <Text variant="caption" tone="body">
                  {daysAway === 0 ? COPY.today : COPY.daysAway}
                </Text>
              </View>

              <Button label={COPY.plan} onPress={go('/(app)/calendar')} />
            </View>
          </View>
        ) : null}

        {birthdays.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.tile}>
                <Feather name="gift" size={18} color={theme.colors.accents[0].ink} />
              </View>
              <Text variant="h3" tone="heading">
                {COPY.birthdays}
              </Text>
            </View>

            {birthdays.map((row) => (
              <View key={row.key} style={styles.birthdayRow}>
                <Text variant="body" tone="heading">
                  {row.name}
                </Text>
                <Text variant="footnote" tone="body">
                  {formatDayMonth(row.date)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.tile}>
              <Feather name="edit-3" size={18} color={theme.colors.accents[2].ink} />
            </View>
            <Text variant="h3" tone="heading">
              {COPY.unfinished}
            </Text>
          </View>

          <Text variant="body" tone="body">
            {COPY.unfinishedEmpty}
          </Text>
        </View>
      </View>
    </AppScreenLayout>
  )
}

/** Completed years between a recurring date's first year and today. */
function yearsOf(value: string | undefined, today = new Date()): number | null {
  if (!value) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const started = Number(match[1])
  const years = today.getFullYear() - started

  return years >= 0 ? years : null
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  cards: {
    gap: theme.spacing.lg,
  },
  highlight: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xxxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
    marginBottom: theme.spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
  },
  card: {
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[0].soft,
  },
  birthdayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
}))
