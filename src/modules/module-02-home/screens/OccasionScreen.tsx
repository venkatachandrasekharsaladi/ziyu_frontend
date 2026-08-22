import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { OCCASION_COPY as COPY } from '@/copy/occasion'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { dateInDays, findComingUp, isBirthday } from '@/modules/module-02-home/comingUp'
import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_HOME } from '@/sample/home'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { useStoryStore } from '@/state/storyStore'
import { formatDate } from '@/utils/formatStoryDate'

/** A `Date` as the `YYYY-MM-DD` that `formatDate` understands. */
function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * The occasion behind a "Coming up" row.
 *
 * NO FIGMA FRAME. The dashboard drew these rows as flat text, so tapping one did
 * nothing; this gives each of them somewhere to go. Deliberately generic — it
 * resolves ANY key date, not just a birthday, so every row on the dashboard is
 * a door rather than only the one that prompted it.
 *
 * The two actions are the ones the birthday spotlight already draws, so the
 * screen introduces no vocabulary the design has not used.
 */
export function OccasionScreen() {
  const { theme } = useUnistyles()
  const router = useRouter()
  const { key } = useLocalSearchParams<{ key: string }>()
  const keyDates = useStoryStore((state) => state.keyDates)

  const row = findComingUp(keyDates, decodeURIComponent(key ?? ''))

  const back = useCallback(() => router.back(), [router])
  const addMemory = useCallback(() => router.push('/(app)/memories/new'), [router])
  const calendar = useCallback(() => router.push('/(app)/calendar'), [router])
  const openMemory = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])

  if (!row) {
    return (
      <AppScreenLayout activeTab="home" onBack={back}>
        <Text variant="body" tone="body">
          {COPY.missing}
        </Text>
        <Button label={COPY.back} onPress={back} variant="outline" />
      </AppScreenLayout>
    )
  }

  const birthday = isBirthday(row)
  const when = formatDate(iso(dateInDays(row.days)))

  // Only a birthday gets the spotlight photo and the past-birthdays rail; a
  // first-date anniversary borrowing a birthday portrait would be nonsense.
  const photoUri = birthday && USE_SAMPLE_CONTENT ? SAMPLE_HOME.spotlight.photoUri : undefined
  const past =
    birthday && USE_SAMPLE_CONTENT
      ? SAMPLE_MEMORIES.filter((m) => m.tags.includes('Birthdays'))
      : []

  return (
    <AppScreenLayout activeTab="home" onBack={back}>
      <View style={styles.head}>
        <View style={styles.chip}>
          <Text variant="caption" tone="brand">
            {COPY.countdown(row.days).toUpperCase()}
          </Text>
        </View>

        <Text variant="h1" tone="heading">
          {row.label}
        </Text>

        {when ? (
          <Text variant="body" tone="body">
            {COPY.onDate(when)}
          </Text>
        ) : null}
      </View>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          // Plain style object — Unistyles styles do not reach expo-image.
          style={{
            width: '100%',
            height: 220,
            borderRadius: theme.radii.field,
            backgroundColor: theme.colors.surface.field,
          }}
          contentFit="cover"
          transition={200}
          testID="occasion-photo"
        />
      ) : null}

      <View style={styles.actions}>
        {birthday ? (
          <>
            <Button label={COPY.planSurprise} onPress={addMemory} />
            <Button label={COPY.createCard} onPress={addMemory} variant="outline" />
          </>
        ) : (
          <Button label={COPY.addMemory} onPress={addMemory} variant="soft" />
        )}
      </View>

      {birthday ? (
        <View style={styles.section}>
          <Text variant="labelStrong" tone="heading">
            {COPY.pastLabel}
          </Text>

          {past.length === 0 ? (
            <Text variant="footnote" tone="body">
              {COPY.pastEmpty}
            </Text>
          ) : (
            past.map((memory) =>
              memory.photoUri ? (
                <PhotoMemoryCard key={memory.id} memory={memory} onPress={openMemory} />
              ) : (
                <MemoryCard key={memory.id} memory={memory} onPress={openMemory} />
              ),
            )
          )}
        </View>
      ) : null}

      <Button label={COPY.calendar} onPress={calendar} variant="link" />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  actions: {
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.md,
  },
}))
