import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { HOME_DASHBOARD_COPY as COPY } from '@/copy/homeDashboard'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { CountUp } from '@/design-system/primitives/CountUp'
import { EventRow } from '@/design-system/patterns/EventRow'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { buildComingUp } from '@/modules/module-02-home/comingUp'
import { NextAdventureCard } from '@/modules/module-06-plans/components/NextAdventureCard'
import { StatTile } from '@/modules/module-02-home/components/StatTile'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_HOME } from '@/sample/home'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { daysSince } from '@/utils/daysUntil'

type DateKey = keyof typeof COPY.dates

/**
 * Which glyph a saved key date wears on its "Coming up" row.
 *
 * Lives beside the `COPY.dates` lookup because it answers the same question
 * about the same keys. `buildComingUp` also returns sample rows keyed the same
 * way, so both sources resolve here; anything unlisted gets a calendar rather
 * than rendering an empty tile.
 */
const DATE_ICONS: Partial<Record<DateKey | string, keyof typeof Feather.glyphMap>> = {
  anniversary: 'heart',
  yourBirthday: 'gift',
  partnerBirthday: 'gift',
  firstDate: 'coffee',
  firstMeeting: 'star',
}

/**
 * M02-S01 — Home Dashboard. Figma `Ziyu`, the three dashboard variants plus the
 * "List of Feature on Home Screen" note pinned beside them.
 *
 * The three frames are one screen in three states, not three screens, so they
 * are assembled here in the order they are drawn: greeting, the memory worth
 * keeping, "Your little world", the relationship pulse, "Coming up", "Little
 * things". The two sections the canvas annotates `←need this section` are the
 * stat tiles and "Coming up".
 *
 * The list sections are `SectionPanel` + `EventRow`, per the Stitch frame: an
 * `h3` title and inset row cards on one grouped surface, replacing the muted
 * uppercase caption over loose cards. "Coming up" and "Upcoming" both get it —
 * they are the same pattern twice on one screen, and giving them two different
 * treatments would only read as a bug.
 *
 * Real data wins wherever the story store holds it — days together and the
 * countdowns are still computed, never invented. Sample content fills the rest
 * while `USE_SAMPLE_CONTENT` is on; see `src/sample`.
 *
 * `quickActions` is gone: it appeared in no frame, and two of its three buttons
 * pointed at features that do not exist.
 */
export function HomeDashboardScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const story = useStoryStore()
  const spaceName = useSpaceStore((state) => state.name)

  const computedTogether = daysSince(story.met?.value)
  const together = computedTogether ?? (USE_SAMPLE_CONTENT ? SAMPLE_HOME.daysTogether : null)

  // Shared with the occasion screen, which resolves the same row from a route
  // key — see `module-02-home/comingUp.ts`.
  const upcoming = buildComingUp(story.keyDates)

  const name = spaceName ?? (USE_SAMPLE_CONTENT ? SAMPLE_HOME.greetingName : null)
  // "A memory worth keeping" is a pager, not a single card: swiping it moves to
  // the next memory. The frame draws one card, but it clips the next album card
  // too — the same gesture reading applies.
  const featuredSet = USE_SAMPLE_CONTENT
    ? SAMPLE_MEMORIES.filter((m) => m.photoUri).slice(0, 4)
    : []
  const featured = featuredSet[0]

  // Tiles the app can genuinely count, added because the frame clips a 140pt
  // tile 74pt past the edge — a scroller holding more than three.
  const statTiles = USE_SAMPLE_CONTENT
    ? [
        ...SAMPLE_HOME.stats,
        {
          key: 'memories',
          icon: 'book-open',
          value: String(SAMPLE_MEMORIES.length),
          label: 'Memories',
          unit: '',
        },
        {
          key: 'photos',
          icon: 'image',
          value: String(SAMPLE_MEMORIES.filter((m) => m.photoUri).length),
          label: 'Photos',
          unit: '',
        },
      ]
    : []
  const spotlight = USE_SAMPLE_CONTENT ? SAMPLE_HOME.spotlight : undefined

  const addMemory = useCallback(() => router.push('/(app)/memories/new'), [router])
  const openMemory = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])
  const openMemories = useCallback(() => router.replace('/(app)/memories'), [router])

  const [pagerWidth, setPagerWidth] = useState(0)

  const onPagerLayout = useCallback((e: LayoutChangeEvent) => {
    setPagerWidth(e.nativeEvent.layout.width)
  }, [])

  const [featuredIndex, setFeaturedIndex] = useState(0)

  const onPagerScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pagerWidth <= 0) return

      const next = Math.round(e.nativeEvent.contentOffset.x / pagerWidth)

      setFeaturedIndex(Math.max(0, Math.min(featuredSet.length - 1, next)))
    },
    [pagerWidth, featuredSet.length],
  )
  const openOccasion = useCallback(
    // Object form: expo-router types the dynamic segment as a param here and
    // handles the encoding, which a template string does not.
    (key: string) => router.push({ pathname: '/(app)/occasions/[key]', params: { key } }),
    [router],
  )
  const openCalendar = useCallback(() => router.push('/(app)/calendar'), [router])

  return (
    <AppScreenLayout activeTab="home">
      <View style={styles.head}>
        {name ? (
          <Text variant="h2" tone="heading" align="center">
            {COPY.greeting(name, new Date().getHours())}
          </Text>
        ) : null}

        {together === null ? (
          <>
            <Text variant="h1" tone="brand" align="center">
              {COPY.daysUnknown}
            </Text>
            <Text variant="footnote" tone="body" align="center">
              {COPY.daysUnknownHint}
            </Text>
          </>
        ) : (
          <Text variant="body" tone="body" align="center">
            {COPY.daysTogetherLine(together)}
          </Text>
        )}
      </View>

      {featured ? (
        <View style={styles.section}>
          <Text variant="h3" tone="heading">
            {COPY.featuredLabel}
          </Text>

          <View onLayout={onPagerLayout}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onPagerScroll}
              onScrollEndDrag={onPagerScroll}
              testID="featured-pager"
            >
              {featuredSet.map((memory) => (
                <View key={memory.id} style={{ width: pagerWidth || '100%' }}>
                  <PhotoMemoryCard memory={memory} onPress={openMemory} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.featuredActions}>
            <Button
              label={COPY.featuredOpen}
              onPress={() => openMemory((featuredSet[featuredIndex] ?? featured).id)}
              variant="soft"
            />
            <Button label={COPY.featuredFavorite} onPress={openMemories} variant="outline" />
          </View>
        </View>
      ) : null}

      {/*
       * THE WAY INTO PLANS. Home is where the couple already is, so the plans
       * cluster is named here rather than living only behind its own tab. The
       * card owns both its states (a trip, or an invitation to make one) — see
       * `NextAdventureCard`.
       */}
      <NextAdventureCard />

      {USE_SAMPLE_CONTENT ? (
        <View style={styles.section}>
          <Text variant="h3" tone="heading">
            {COPY.littleWorldLabel}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={140 + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.tileRow}
            testID="stat-rail"
          >
            {statTiles.map((stat) => (
              <View key={stat.key} style={styles.statCell}>
                <StatTile
                  icon={stat.icon as keyof typeof Feather.glyphMap}
                  value={stat.value}
                  label={stat.label}
                  unit={stat.unit || undefined}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {spotlight ? (
        <Card>
          <Text variant="caption" tone="muted">
            {spotlight.eyebrow.toUpperCase()}
          </Text>

          <Image
            source={{ uri: spotlight.photoUri }}
            // Plain style object — Unistyles styles do not reach expo-image.
            style={{
              width: '100%',
              height: 180,
              borderRadius: theme.radii.field,
              backgroundColor: theme.colors.surface.field,
            }}
            contentFit="cover"
            transition={200}
            testID="spotlight-photo"
          />

          <Text variant="labelStrong" tone="heading">
            {spotlight.heading}
          </Text>
          <Text variant="footnote" tone="body">
            {spotlight.lede}
          </Text>

          <Button label={spotlight.primary} onPress={addMemory} />
          <Button label={spotlight.secondary} onPress={addMemory} variant="outline" />
        </Card>
      ) : null}

      {USE_SAMPLE_CONTENT ? (
        <Card>
          <Text variant="caption" tone="muted">
            {SAMPLE_HOME.pulse.label.toUpperCase()}
          </Text>

          <View style={styles.pulseRow}>
            <CountUp value={Number(SAMPLE_HOME.pulse.value.replace(/,/g, ''))} />
            <Text variant="footnote" tone="body">
              {SAMPLE_HOME.pulse.unit}
            </Text>
          </View>

          <Text variant="footnote" tone="body">
            {SAMPLE_HOME.pulse.caption}
          </Text>
        </Card>
      ) : null}

      <SectionPanel title={COPY.comingUpLabel}>
        {upcoming.length === 0 ? (
          <Card>
            <Text variant="labelStrong" tone="heading">
              {COPY.emptyCalendar.heading}
            </Text>
            <Text variant="footnote" tone="body">
              {COPY.emptyCalendar.lede}
            </Text>
            <Button label={COPY.emptyCalendar.action} onPress={openCalendar} variant="soft" />
          </Card>
        ) : (
          upcoming.map((row, i) => (
            <EventRow
              key={row.key}
              icon={DATE_ICONS[row.key] ?? 'calendar'}
              label={row.label}
              detail={row.detail}
              trailing={COPY.daysShort(row.days)}
              index={i}
              onPress={() => openOccasion(row.key)}
            />
          ))
        )}
      </SectionPanel>

      {USE_SAMPLE_CONTENT ? (
        <SectionPanel title={COPY.upcomingLabel}>
          {SAMPLE_HOME.upcomingEvents.map((event, i) => (
            <EventRow
              key={event.key}
              icon={event.icon as keyof typeof Feather.glyphMap}
              label={event.label}
              detail={event.detail}
              index={i}
            />
          ))}
        </SectionPanel>
      ) : null}

      <SectionPanel title={COPY.littleThingsLabel}>
        {USE_SAMPLE_CONTENT && SAMPLE_HOME.littleThings.length > 0 ? (
          SAMPLE_HOME.littleThings.map((thing) => (
            <Pressable
              key={thing.key}
              onPress={openCalendar}
              style={styles.note}
              accessibilityRole="button"
              accessibilityLabel={thing.text}
            >
              <Feather name="bookmark" size={16} color={theme.colors.brand.primary} />

              <View style={styles.noteText}>
                <Text variant="footnote" tone="body">
                  {thing.text}
                </Text>
              </View>

              <Feather name="chevron-right" size={16} color={theme.colors.brand.primary} />
            </Pressable>
          ))
        ) : (
          <Card>
            <Text variant="labelStrong" tone="heading">
              {COPY.emptyNote.heading}
            </Text>
            <Text variant="footnote" tone="body">
              {COPY.emptyNote.lede}
            </Text>
            <Button label={COPY.emptyNote.action} onPress={addMemory} variant="soft" />
          </Card>
        )}
      </SectionPanel>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCell: {
    // The width the frame actually draws, rather than three squeezed to fit.
    width: 140,
    flexDirection: 'row',
  },
  tileRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  /**
   * A pinned reminder. Not an `EventRow`: it is one sentence with no time and
   * no title, so a tinted tile and a bold heading line would both misdescribe
   * its shape. It borrows the row card's fill, border and radius so the two
   * still read as the same kind of thing inside a panel.
   */
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  noteText: {
    flex: 1,
  },
}))
