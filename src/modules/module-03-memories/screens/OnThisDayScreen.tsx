import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { ON_THIS_DAY_COPY as COPY } from '@/copy/onThisDay'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { MemoryCard } from '@/modules/module-03-memories/components/MemoryCard'
import { PhotoMemoryCard } from '@/modules/module-03-memories/components/PhotoMemoryCard'
import { USE_SAMPLE_CONTENT } from '@/sample'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { memoriesService } from '@/services/memories'
import type { Memory } from '@/services/memories/types'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** `2023-10-14` -> `{ year: 2023, month: 10, day: 14 }`, or null if malformed. */
function parts(date: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)

  if (!m) return null

  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
}

/**
 * Groups memories that fall on one calendar day, newest year first.
 *
 * Exported so the grouping is testable without a screen — it is the only real
 * logic here.
 */
export function groupByYear(memories: Memory[], month: number, day: number) {
  const groups = new Map<number, Memory[]>()

  for (const memory of memories) {
    const p = parts(memory.date)

    if (!p || p.month !== month || p.day !== day) continue

    const bucket = groups.get(p.year)

    if (bucket) bucket.push(memory)
    else groups.set(p.year, [memory])
  }

  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }))
}

/**
 * M03-S07 — On this day. Figma `Ziyu`, Memories Page frame 4.
 *
 * The date is today's, which is the whole point of the screen. When today holds
 * nothing and sample content is on, it anchors to the day the design draws
 * (October 14) so the layout has something to show — otherwise a real couple
 * would meet an empty rail on 364 days out of 365.
 */
export function OnThisDayScreen() {
  const router = useRouter()
  const back = useBackTo('/(app)/memories')
  const [memories, setMemories] = useState<Memory[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const result = await memoriesService.list()

      if (cancelled) return

      const live = result.ok ? result.value : []

      setMemories(live.length === 0 && USE_SAMPLE_CONTENT ? SAMPLE_MEMORIES : live)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const add = useCallback(() => router.push('/(app)/memories/new'), [router])
  const open = useCallback((id: string) => router.push(`/(app)/memories/${id}`), [router])

  if (memories === null) return <AppScreenLayout activeTab="memories" />

  const now = new Date()
  let month = now.getMonth() + 1
  let day = now.getDate()
  let groups = groupByYear(memories, month, day)

  // Nothing today: fall back to the day the design draws, so the rail is not
  // empty for the sake of realism nobody can see yet.
  if (groups.length === 0 && USE_SAMPLE_CONTENT) {
    month = 10
    day = 14
    groups = groupByYear(memories, month, day)
  }

  return (
    <AppScreenLayout activeTab="memories" onBack={back}>
      <View style={styles.head}>
        <Text variant="caption" tone="body" align="center">
          {COPY.eyebrow}
        </Text>
        <Text variant="h1" tone="brand" align="center">
          {MONTHS[month - 1]} {day}
        </Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.head}>
          <Text variant="labelStrong" tone="heading" align="center">
            {COPY.empty.heading}
          </Text>
          <Text variant="footnote" tone="body" align="center">
            {COPY.empty.lede}
          </Text>
          <Button label={COPY.add} onPress={add} variant="soft" />
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.year} style={styles.group}>
            <View style={styles.marker}>
              <View style={styles.dot} />
              <Text variant="labelStrong" tone="brand">
                {group.year}
              </Text>
              <View style={styles.chip}>
                <Text variant="caption" tone="body">
                  {COPY.yearsAgo(now.getFullYear() - group.year)}
                </Text>
              </View>
            </View>

            {group.items.map((memory) =>
              memory.photoUri ? (
                <PhotoMemoryCard key={memory.id} memory={memory} onPress={open} />
              ) : (
                <MemoryCard key={memory.id} memory={memory} onPress={open} />
              ),
            )}
          </View>
        ))
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.sm,
  },
  group: {
    gap: theme.spacing.md,
  },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
  },
}))
