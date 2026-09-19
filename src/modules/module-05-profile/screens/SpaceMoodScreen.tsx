import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { MOODS, SPACE_MOOD_COPY as COPY } from '@/copy/spaceMood'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { MoodCard } from '@/modules/module-05-profile/components/MoodCard'
import { useSpaceStore, type SpaceMood } from '@/state/spaceStore'

/**
 * M05-S22 — Space → Space Mood. Figma `3430:2036`, "Space Mood (Refined)".
 *
 * The mood is held in COMPONENT state until the save, not written to the store
 * on each tap. The frame ends in "Use This Mood", and a screen that has already
 * applied the choice has made that button a lie — worse, backing out of the
 * screen would leave the space repainted by a mood the user was still only
 * looking at.
 *
 * The five cards are a `radiogroup`. Each card carries `radio` and its own
 * selected state; the group wrapper names the question. Without the wrapper a
 * reader announces five options and never says what they are options FOR.
 */
export function SpaceMoodScreen() {
  const router = useRouter()
  const stored = useSpaceStore((state) => state.mood)
  const setMood = useSpaceStore((state) => state.setMood)

  const [choice, setChoice] = useState<SpaceMood>(stored)
  const [isSaved, setIsSaved] = useState(false)

  const back = useCallback(() => router.back(), [router])

  const onSave = useCallback(() => {
    setMood(choice)
    setIsSaved(true)
  }, [choice, setMood])

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

      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={COPY.title}>
        {MOODS.map((mood) => (
          <MoodCard
            key={mood.key}
            mood={mood.key}
            name={mood.name}
            detail={mood.detail}
            selected={mood.key === choice}
            selectedLabel={COPY.selected}
            onPress={() => setChoice(mood.key)}
          />
        ))}
      </View>

      <Button label={COPY.save} onPress={onSave} />

      {isSaved ? (
        <Text variant="footnote" tone="success">
          {COPY.saved}
        </Text>
      ) : null}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  grid: {
    gap: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
  },
}))
