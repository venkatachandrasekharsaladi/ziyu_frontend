import { Feather } from '@expo/vector-icons'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

type PersonalizeSectionProps = {
  title: string
  detail: string
  icon: FeatherName
  children: ReactNode
}

/**
 * One of the three choices on Personalize Our Space. Figma `3430:1722`.
 *
 * A titled card with its own icon tile and whatever picker belongs inside it.
 * NOT `SectionPanel`, which is the settings-list grouping — that one draws a
 * lavender surface holding white rows, and these are single white cards with a
 * 24pt corner. Reusing it would have made a personalization card look like a
 * settings group, which is the opposite of what this screen is.
 */
export function PersonalizeSection({ title, detail, icon, children }: PersonalizeSectionProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.text}>
          <Text variant="h3" tone="heading">
            {title}
          </Text>
          <Text variant="body" tone="body">
            {detail}
          </Text>
        </View>

        <View style={styles.tile} accessibilityElementsHidden importantForAccessibility="no">
          <Feather name={icon} size={20} color={theme.colors.brand.primary} />
        </View>
      </View>

      {children}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.xxl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  text: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  tile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
}))
