import { Feather } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { HOME_DASHBOARD_COPY as COPY } from '@/copy/homeDashboard'
import { AppHeader } from '@/design-system/patterns/AppHeader'
import { BottomNav } from '@/design-system/patterns/BottomNav'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { daysSince, daysUntilNextOccurrence } from '@/utils/daysUntil'

type DateKey = keyof typeof COPY.dates

/**
 * M02-S01 — Home Dashboard. Stitch screen df11563d.
 *
 * The design shows sample content: "1,248 Days Together", a Paris trip, a
 * birthday 45 days out. None of it is reproduced. Every number here is computed
 * from what the couple actually entered during onboarding, and where they
 * entered nothing the screen says so — a plausible invention on the first
 * screen of the real app would be the worst possible first impression.
 *
 * The bottom bar's other tabs have no destinations yet and are disabled rather
 * than hidden, so the bar does not change shape when they arrive.
 */
export function HomeDashboardScreen() {
  const insets = useSafeAreaInsets()
  const { theme } = useUnistyles()
  const story = useStoryStore()
  const spaceName = useSpaceStore((state) => state.name)

  const together = daysSince(story.met?.value)

  const upcoming: { key: string; label: string; days: number }[] = []

  for (const [key, value] of Object.entries(story.keyDates ?? {})) {
    const days = daysUntilNextOccurrence(value)

    if (days !== null) {
      upcoming.push({ key, label: COPY.dates[key as DateKey], days })
    }
  }

  // Soonest first — an anniversary next week matters more than one in eleven
  // months.
  upcoming.sort((a, b) => a.days - b.days)

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top }}>
        <AppHeader />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {spaceName ? (
            <Text variant="body" tone="body" align="center">
              {spaceName}
            </Text>
          ) : null}

          <Card>
            <Text variant="h1" tone="brand" align="center">
              {together === null ? COPY.daysUnknown : together.toLocaleString()}
            </Text>
            <Text variant="caption" tone="body" align="center">
              {COPY.daysTogether}
            </Text>
            {together === null ? (
              <Text variant="footnote" tone="body" align="center">
                {COPY.daysUnknownHint}
              </Text>
            ) : null}
          </Card>

          <View style={styles.section}>
            <Text variant="caption" tone="body">
              {COPY.quickActionsLabel}
            </Text>

            <View style={styles.actionRow}>
              {COPY.quickActions.map((action) => (
                <View key={action.key} style={styles.action}>
                  <Feather name={action.icon} size={20} color={theme.colors.brand.primary} />
                  <Text variant="footnote" tone="body" align="center">
                    {action.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="caption" tone="body">
              {COPY.upcomingLabel}
            </Text>

            {upcoming.length === 0 ? (
              <Card>
                <Text variant="footnote" tone="body" align="center">
                  {COPY.upcomingEmpty}
                </Text>
              </Card>
            ) : (
              upcoming.map((row) => (
                <Card key={row.key}>
                  <View style={styles.upcomingRow}>
                    <Text variant="labelStrong" tone="heading">
                      {row.label}
                    </Text>
                    <View style={styles.spacer} />
                    <Text variant="footnote" tone="body">
                      {COPY.inDays(row.days)}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNav tabs={COPY.tabs} activeKey="home" />
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  // The same 350pt column every other screen uses.
  column: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
}))
