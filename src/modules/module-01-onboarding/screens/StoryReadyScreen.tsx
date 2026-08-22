import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { STORY_READY_COPY as COPY } from '@/copy/storyReady'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useStoryStore } from '@/state/storyStore'
import { formatStoryDate } from '@/utils/formatStoryDate'

/**
 * M01-S19 — Your Story Is Ready. Stitch screen f97fc75c.
 *
 * A checklist of what was captured. Each row states plainly whether it was
 * added or skipped: a tick beside something the user never filled in would be
 * a lie, and skipping was allowed at every step.
 */
export function StoryReadyScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const story = useStoryStore()

  const rows = [
    { key: 'met', label: COPY.rows.met, done: Boolean(story.met) },
    { key: 'firstDate', label: COPY.rows.firstDate, done: Boolean(story.firstDate) },
    { key: 'becameUs', label: COPY.rows.becameUs, done: Boolean(story.becameUs) },
    {
      key: 'keyDates',
      label: COPY.rows.keyDates,
      done: Boolean(story.keyDates && Object.keys(story.keyDates).length > 0),
    },
    { key: 'firstMemory', label: COPY.rows.firstMemory, done: Boolean(story.firstMemory) },
  ]

  const since = formatStoryDate(story.met)

  const personalize = useCallback(() => router.push('/(onboarding)/personalize'), [router])

  return (
    <AuthScreenLayout centred>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
        {since ? (
          <Text variant="footnote" tone="body" align="center">
            {COPY.since(since)}
          </Text>
        ) : null}
      </View>

      <Card>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Feather
              name={row.done ? 'check-circle' : 'circle'}
              size={16}
              color={row.done ? theme.colors.feedback.success : theme.colors.border.field}
            />
            <Text variant="labelStrong" tone="heading">
              {row.label}
            </Text>
            <View style={styles.spacer} />
            <Text variant="footnote" tone="body">
              {row.done ? COPY.added : COPY.skipped}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button label={COPY.submit} onPress={personalize} />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.huge,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  actions: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.huge,
  },
}))
