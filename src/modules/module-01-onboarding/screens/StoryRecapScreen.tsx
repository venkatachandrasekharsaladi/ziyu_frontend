import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { STORY_RECAP_COPY as COPY } from '@/copy/storyRecap'
import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { storyService } from '@/services/story'
import { useStoryStore } from '@/state/storyStore'
import { formatDate, formatStoryDate } from '@/utils/formatStoryDate'

type Row = { key: string; label: string; when: string; detail?: string; icon: 'heart' | 'coffee' | 'star' | 'camera' }

/**
 * M01-S18 — Our Story Recap. Stitch screen 230c258d.
 *
 * The only screen in the cluster that shows rather than asks, and the point at
 * which the story is actually saved. Everything before this wrote to the store
 * alone, so a user who abandons setup half-way leaves nothing behind.
 *
 * A story with nothing in it is a real outcome — every step was skippable — so
 * the empty state says so plainly instead of rendering an empty timeline.
 */
export function StoryRecapScreen() {
  const router = useRouter()
  const back = useBackTo('/(onboarding)/setup')
  const { theme } = useUnistyles()
  const story = useStoryStore()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const rows: Row[] = []

  if (story.met) {
    rows.push({ key: 'met', label: COPY.rows.met, when: formatStoryDate(story.met), icon: 'star' })
  }
  if (story.firstDate) {
    rows.push({
      key: 'firstDate',
      label: COPY.rows.firstDate,
      when: formatDate(story.firstDate.date),
      detail: story.firstDate.location ?? story.firstDate.note,
      icon: 'coffee',
    })
  }
  if (story.becameUs) {
    rows.push({
      key: 'becameUs',
      label: COPY.rows.becameUs,
      when: formatDate(story.becameUs.date),
      detail: story.becameUs.location ?? story.becameUs.note,
      icon: 'heart',
    })
  }
  if (story.firstMemory) {
    rows.push({
      key: 'firstMemory',
      label: COPY.rows.firstMemory,
      when: formatDate(story.firstMemory.date),
      detail: story.firstMemory.note,
      icon: 'camera',
    })
  }

  const started = formatStoryDate(story.met)

  const submit = useCallback(async () => {
    setSaving(true)
    setError(null)

    const result = await storyService.saveStory(story.toStory())

    setSaving(false)

    if (!result.ok) {
      setError(COPY.errors[result.error.code])
      return
    }

    router.replace('/(onboarding)/story-ready')
  }, [story, router])

  return (
    <AuthScreenLayout onBack={back}>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {started ? COPY.lede(started) : COPY.ledeUndated}
        </Text>
      </View>

      {rows.length === 0 ? (
        <Card>
          <Text variant="labelStrong" tone="heading" align="center">
            {COPY.emptyTitle}
          </Text>
          <Text variant="footnote" tone="body" align="center">
            {COPY.emptyBody}
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {rows.map((row) => (
            <Card key={row.key}>
              <View style={styles.rowHead}>
                <Feather name={row.icon} size={16} color={theme.colors.brand.primary} />
                <Text variant="labelStrong" tone="heading">
                  {row.label}
                </Text>
              </View>

              {row.when ? (
                <Text variant="footnote" tone="body">
                  {row.when}
                </Text>
              ) : null}

              {row.detail ? (
                <Text variant="footnote" tone="body">
                  {row.detail}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Text variant="body" tone="body" align="center">
          {COPY.closing}
        </Text>

        {error ? (
          <Text variant="footnote" tone="error" align="center">
            {error}
          </Text>
        ) : null}

        <Button label={COPY.submit} onPress={submit} loading={saving} />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  list: {
    gap: theme.spacing.md,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.huge,
  },
}))
