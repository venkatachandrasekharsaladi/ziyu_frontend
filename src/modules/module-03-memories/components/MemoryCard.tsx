import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import type { Memory } from '@/services/memories/types'
import { formatDate } from '@/utils/formatStoryDate'

type MemoryCardProps = {
  memory: Memory
  onPress: (id: string) => void
}

/**
 * One memory in a list.
 *
 * A `Card` rather than the polaroid the design draws: the polaroid treatment
 * depends on a photo, and `expo-image-picker` is not installed, so every card
 * would be an empty frame. The card carries the same information and matches
 * every other list in the app.
 */
export function MemoryCard({ memory, onPress }: MemoryCardProps) {
  const { theme } = useUnistyles()

  return (
    <PressableScale onPress={() => onPress(memory.id)} accessibilityLabel={memory.title}>
      <Card>
        <View style={styles.head}>
          <Text variant="labelStrong" tone="heading">
            {memory.title}
          </Text>
          <View style={styles.spacer} />
          {memory.favorite ? (
            <Feather name="heart" size={14} color={theme.colors.brand.primary} />
          ) : null}
        </View>

        {memory.date ? (
          <Text variant="footnote" tone="body">
            {formatDate(memory.date)}
            {memory.location ? ` · ${memory.location}` : ''}
          </Text>
        ) : null}

        {memory.caption ? (
          <Text variant="footnote" tone="body">
            {memory.caption}
          </Text>
        ) : null}
      </Card>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
})
