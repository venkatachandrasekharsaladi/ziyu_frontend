import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
  CARD_STYLES,
  MEMORY_STYLES,
  SPACE_PERSONALIZE_COPY as COPY,
} from '@/copy/spacePersonalize'
import { MOODS } from '@/copy/spaceMood'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { PersonalizeSection } from '@/modules/module-05-profile/components/PersonalizeSection'
import { SpaceOptionTile } from '@/modules/module-05-profile/components/SpaceOptionTile'
import {
  useSpaceStore,
  type CardStyle,
  type MemoryStyle,
  type SpaceMood,
} from '@/state/spaceStore'

/**
 * M05-S23 — Space → Personalize Our Space. Figma `3430:1714`.
 *
 * Three choices on one page: the atmosphere, how a memory is framed, and the
 * texture of a note. All three are held in component state until "Save Our
 * Room", for the reason `SpaceMoodScreen` gives — a screen that applies as you
 * tap makes its own save button meaningless.
 *
 * The mood picker here and `SpaceMoodScreen` change the SAME value and read the
 * same `MOODS` list. This one is the quick row; that one is the full-bleed
 * gallery with a photograph per mood. Two lists would be two things to keep in
 * step, so there is one.
 */
export function PersonalizeOurSpaceScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const storedMood = useSpaceStore((state) => state.mood)
  const storedMemory = useSpaceStore((state) => state.memoryStyle)
  const storedCard = useSpaceStore((state) => state.cardStyle)
  const setRoom = useSpaceStore((state) => state.setRoom)

  const [mood, setMood] = useState<SpaceMood>(storedMood)
  const [memoryStyle, setMemoryStyle] = useState<MemoryStyle>(storedMemory)
  const [cardStyle, setCardStyle] = useState<CardStyle>(storedCard)
  const [isSaved, setIsSaved] = useState(false)

  const back = useCallback(() => router.back(), [router])

  const onSave = useCallback(() => {
    setRoom({ mood, memoryStyle, cardStyle })
    setIsSaved(true)
  }, [mood, memoryStyle, cardStyle, setRoom])

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.sections}>
        <PersonalizeSection title={COPY.moodTitle} detail={COPY.moodDetail} icon="droplet">
          <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={COPY.moodTitle}>
            {MOODS.map((option) => (
              <View key={option.key} style={styles.rowItem}>
                <SpaceOptionTile
                  label={option.name}
                  selected={option.key === mood}
                  selectedLabel={COPY.selected}
                  fill={theme.colors.moods[option.key]}
                  onPress={() => setMood(option.key)}
                />
              </View>
            ))}
          </View>
        </PersonalizeSection>

        <PersonalizeSection title={COPY.memoryTitle} detail={COPY.memoryDetail} icon="image">
          <View
            style={styles.row}
            accessibilityRole="radiogroup"
            accessibilityLabel={COPY.memoryTitle}
          >
            {MEMORY_STYLES.map((option) => (
              <View key={option.key} style={styles.rowItem}>
                <SpaceOptionTile
                  label={option.name}
                  selected={option.key === memoryStyle}
                  selectedLabel={COPY.selected}
                  onPress={() => setMemoryStyle(option.key)}
                />
              </View>
            ))}
          </View>
        </PersonalizeSection>

        <PersonalizeSection title={COPY.cardTitle} detail={COPY.cardDetail} icon="layers">
          <View style={styles.stack} accessibilityRole="radiogroup" accessibilityLabel={COPY.cardTitle}>
            {CARD_STYLES.map((option) => (
              <SpaceOptionTile
                key={option.key}
                label={option.name}
                selected={option.key === cardStyle}
                selectedLabel={COPY.selected}
                sample={COPY.sampleNote}
                onPress={() => setCardStyle(option.key)}
              />
            ))}
          </View>
        </PersonalizeSection>
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
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  sections: {
    gap: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
  },
  /** Wraps rather than scrolls: five moods do not fit a 390pt row. */
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  rowItem: {
    flexGrow: 1,
    flexBasis: 96,
  },
  stack: {
    gap: theme.spacing.xxl,
  },
}))
