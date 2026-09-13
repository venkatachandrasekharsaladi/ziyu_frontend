import { Feather } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Text } from '@/design-system/primitives/Text'

type FaqItemProps = {
  question: string
  answer: string
}

/**
 * One question that opens to its answer.
 *
 * `accessibilityState.expanded` carries the open/closed state, so the chevron
 * is decoration rather than the only signal — the same rule the rest of this
 * app follows for selection and error states.
 */
export function FaqItem({ question, answer }: FaqItemProps) {
  const { theme } = useUnistyles()
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((current) => !current), [])

  return (
    <View style={styles.item}>
      <PressableScale onPress={toggle} accessibilityLabel={question}>
        <View style={styles.head} accessibilityState={{ expanded: isOpen }}>
          <Text variant="label" tone="heading">
            {question}
          </Text>

          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.colors.text.muted}
          />
        </View>
      </PressableScale>

      {isOpen ? (
        <Text variant="footnote" tone="body">
          {answer}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  item: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
}))
