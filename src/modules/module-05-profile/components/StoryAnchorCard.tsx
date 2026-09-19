import { Feather } from '@expo/vector-icons'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
import type { FeatherName } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'

type StoryAnchorCardProps = {
  title: string
  icon: FeatherName
  /** Index into `theme.colors.accents` — the tile's colour. */
  accent: number
  /** What the pencil announces, e.g. "Edit First Date". */
  editLabel: string
  onEdit: () => void
  children: ReactNode
}

/**
 * One anchor in the couple's story. Figma `3430:1202` and its three siblings.
 *
 * The pencil's accessible name carries the card's subject — "Edit First Date",
 * not "Edit". Four identical pencils on one page is a screen reader reading
 * the same word four times and the user having to count cards to know which
 * one they are on.
 *
 * The body is a slot rather than a fixed shape because the four cards hold
 * genuinely different things: a date and a count, a place and a note, a place
 * with a photograph, and an empty invitation.
 */
export function StoryAnchorCard({
  title,
  icon,
  accent,
  editLabel,
  onEdit,
  children,
}: StoryAnchorCardProps) {
  const { theme } = useUnistyles()
  const pair = theme.colors.accents[accent] ?? theme.colors.accents[0]

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.title}>
          <View style={[styles.tile, { backgroundColor: pair.soft }]}>
            <Feather name={icon} size={18} color={pair.ink} />
          </View>

          <Text variant="h3" tone="heading">
            {title}
          </Text>
        </View>

        <IconButton icon="edit-2" label={editLabel} onPress={onEdit} size="sm" tone="quiet" />
      </View>

      <View style={styles.body}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.xxxl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.field,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
  },
  body: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
