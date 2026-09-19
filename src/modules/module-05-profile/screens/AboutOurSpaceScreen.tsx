import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SPACE_ABOUT_COPY as COPY } from '@/copy/spaceAbout'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { CountUp } from '@/design-system/primitives/CountUp'
import { Text } from '@/design-system/primitives/Text'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import { useStoryStore } from '@/state/storyStore'
import { daysSince } from '@/utils/daysUntil'
import { formatStoryDate } from '@/utils/formatStoryDate'

/**
 * M05-S35 — Space → About Our Space. Figma `3430:927`.
 *
 * A STATS PAGE. Despite the name it has nothing to do with `PrivacyDetails`
 * next to it on the board; the two were nearly merged on their titles alone.
 *
 * THREE OF THE FOUR TILES ARE COUNTED, one is not. Memories come from
 * `memoriesService` — the same call, with the same sample fallback, that
 * `MemoriesHomeScreen` makes, so the two screens can never disagree about how
 * many there are. Moments and milestones are counted from `storyStore`. TRIPS
 * has no source anywhere in the app, so its tile shows a dash and says it is
 * not counted, rather than borrowing the frame's 3.
 *
 * "Space Founded" reads `met`, because no store holds a founding date. The
 * frame draws them as different years — together since 2018, founded 2020 —
 * so this is an approximation and is flagged as one.
 */
export function AboutOurSpaceScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const met = useStoryStore((state) => state.met)
  const firstDate = useStoryStore((state) => state.firstDate)
  const becameUs = useStoryStore((state) => state.becameUs)
  const firstMemory = useStoryStore((state) => state.firstMemory)
  const keyDates = useStoryStore((state) => state.keyDates)

  const [memoryCount, setMemoryCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.list()
      if (cancelled) return

      const live = result.ok ? result.value : []
      const shown = live.length === 0 && USE_SAMPLE_CONTENT ? SAMPLE_MEMORIES : live

      setMemoryCount(shown.length)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const back = useCallback(() => router.back(), [router])

  const days = daysSince(met?.value)
  const moments = [firstDate, becameUs, firstMemory].filter(Boolean).length
  const milestones = keyDates ? Object.values(keyDates).filter(Boolean).length : 0

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.pill}>
          <Text variant="caption" tone="brand">
            {COPY.timeTogether}
          </Text>
        </View>

        {days === null ? (
          <Text variant="h2" tone="heading">
            {COPY.daysUnknown}
          </Text>
        ) : (
          <CountUp
            value={days}
            variant="countdown"
            tone="heading"
            format={(n) => n.toLocaleString()}
          />
        )}

        <Text variant="h3" tone="brand">
          {COPY.daysOfUs}
        </Text>

        <Text variant="footnote" tone="body">
          {COPY.stillBeingWritten}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatTile icon="book-open" label={COPY.memories} value={memoryCount} />
        <StatTile icon="star" label={COPY.moments} value={moments} />
        <StatTile icon="flag" label={COPY.milestones} value={milestones} />
        <StatTile icon="map" label={COPY.trips} value={null} uncounted />
      </View>

      <View style={styles.founded}>
        <View style={styles.foundedTile}>
          <Feather name="calendar" size={20} color={theme.colors.brand.primary} />
        </View>

        <View>
          <Text variant="h3" tone="heading">
            {COPY.founded}
          </Text>
          <Text variant="body" tone="body">
            {met ? formatStoryDate(met) : COPY.foundedUnknown}
          </Text>
        </View>
      </View>
    </AppScreenLayout>
  )
}

/**
 * One tile in the 2x2 grid.
 *
 * THREE STATES, not two. A number is a number. `value === null` means the
 * count has not ARRIVED yet — memories are fetched, so there is a moment
 * before they land. `uncounted` means nothing in the app will ever count this,
 * which is a different thing and the only one that earns the explanation
 * underneath. Collapsing the two made a loading memories tile claim it was
 * uncountable.
 *
 * Neither state draws a zero. A zero is a claim that there are none.
 */
function StatTile({
  icon,
  label,
  value,
  uncounted = false,
}: {
  icon: FeatherName
  label: string
  value: number | null
  uncounted?: boolean
}) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.tile}>
      <Feather name={icon} size={24} color={theme.colors.brand.primary} />

      <Text variant="h2" tone={value === null ? 'muted' : 'heading'}>
        {value === null ? COPY.uncounted : value.toLocaleString()}
      </Text>

      {/*
        The label is drawn in BOTH states. An uncounted tile that dropped it
        read "— Not counted yet" with no indication of what was not counted,
        which is worse than the number being missing.
      */}
      <Text variant="caption" tone="body" align="center">
        {label}
      </Text>

      {uncounted ? (
        <Text variant="caption" tone="muted" align="center">
          {COPY.uncountedHint}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
  },
  hero: {
    gap: theme.spacing.xs,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[0].soft,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface.field,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  founded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxl,
    marginTop: theme.spacing.md,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  foundedTile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
}))
