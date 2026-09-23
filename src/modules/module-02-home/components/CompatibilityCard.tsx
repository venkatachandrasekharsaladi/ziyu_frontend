import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { COMPATIBILITY_COPY as COPY } from '@/copy/compatibility'
import { Card } from '@/design-system/primitives/Card'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { formatDate } from '@/utils/formatStoryDate'
import { ZODIAC_LABEL, zodiacSignFor } from '@/utils/zodiac'

type Person = { name: string; birthday: string }

type CompatibilityCardProps = {
  you: Person
  partner: Person
  onPress: () => void
}

/**
 * The Home teaser for `CompatibilityScreen` — both birthdays, both signs, a
 * door to the full reading. See the screen for why this stays sample-only.
 */
export function CompatibilityCard({ you, partner, onPress }: CompatibilityCardProps) {
  const { theme } = useUnistyles()

  const people = [you, partner]

  return (
    <Card>
      <Text variant="caption" tone="muted">
        {COPY.eyebrow.toUpperCase()}
      </Text>

      <Text variant="labelStrong" tone="heading">
        {COPY.heading}
      </Text>

      <View style={styles.row}>
        {people.map((person) => {
          const sign = zodiacSignFor(person.birthday)

          return (
            <View key={person.name} style={styles.person}>
              <Feather name="gift" size={16} color={theme.colors.brand.primary} />
              <Text variant="footnote" tone="heading">
                {person.name}
              </Text>
              <Text variant="caption" tone="body">
                {formatDate(person.birthday)}
              </Text>
              {sign ? (
                <Text variant="caption" tone="brand">
                  {ZODIAC_LABEL[sign]}
                </Text>
              ) : null}
            </View>
          )
        })}
      </View>

      <Button label={COPY.cardCta} onPress={onPress} variant="soft" />
    </Card>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  person: {
    flex: 1,
    gap: 2,
  },
}))
