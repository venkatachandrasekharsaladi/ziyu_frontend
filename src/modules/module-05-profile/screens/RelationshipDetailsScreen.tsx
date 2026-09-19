import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { Image, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SPACE_RELATIONSHIP_COPY as COPY } from '@/copy/spaceRelationship'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { StoryAnchorCard } from '@/modules/module-05-profile/components/StoryAnchorCard'
import type { Moment } from '@/services/story/types'
import { useStoryStore } from '@/state/storyStore'
import { daysSince } from '@/utils/daysUntil'
import { formatDate, formatStoryDate } from '@/utils/formatStoryDate'
import { useBackTo } from '@/hooks/useBackTo'

/**
 * M05-S32 — Space → Relationship Details. Figma `3430:1187`.
 *
 * NO "SAVE DETAILS" BUTTON, and the frame draws one. Deliberate, and the one
 * place this screen departs from the board.
 *
 * Nothing on this page is editable in place — every card is a summary with a
 * pencil, and the pencil's job is to open the screen that owns that value.
 * A save button under four read-only cards has nothing to write; it would sit
 * there looking like the thing that commits your story and in fact commit
 * nothing. Flagged for review: if the cards are meant to become inline
 * editors, the button comes back with them.
 *
 * "First Trip" maps to `storyStore.firstMemory`, which is the only Moment in
 * that store holding a place and a photograph. `becameUs` is deliberately not
 * drawn here — no card on the board corresponds to it.
 */
export function RelationshipDetailsScreen() {
  const router = useRouter()
  const met = useStoryStore((state) => state.met)
  const firstDate = useStoryStore((state) => state.firstDate)
  const firstMemory = useStoryStore((state) => state.firstMemory)

  const back = useBackTo('/(app)/space/identity')
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  const days = daysSince(met?.value)

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

      <View style={styles.cards}>
        <StoryAnchorCard
          title={COPY.togetherSince}
          icon="heart"
          accent={0}
          editLabel={COPY.edit(COPY.togetherSince)}
          onEdit={go('/(app)/settings/dates')}
        >
          {met ? (
            <>
              <Text variant="h2" tone="brand" align="center">
                {formatStoryDate(met)}
              </Text>
              {days === null ? null : (
                <Text variant="caption" tone="body" align="center">
                  {COPY.daysOfUs(days)}
                </Text>
              )}
            </>
          ) : (
            <Text variant="body" tone="body" align="center">
              {COPY.togetherSinceEmpty}
            </Text>
          )}
        </StoryAnchorCard>

        <MomentCard
          title={COPY.firstDate}
          icon="coffee"
          accent={2}
          moment={firstDate}
          onEdit={go('/(app)/settings/dates')}
        />

        <MomentCard
          title={COPY.firstTrip}
          icon="map-pin"
          accent={1}
          moment={firstMemory}
          onEdit={go('/(app)/settings/dates')}
        />

        <StoryAnchorCard
          title={COPY.nextMilestone}
          icon="flag"
          accent={1}
          editLabel={COPY.edit(COPY.nextMilestone)}
          onEdit={go('/(app)/calendar')}
        >
          <View style={styles.dashed}>
            <Text variant="body" tone="body" align="center">
              {COPY.milestoneEmpty}
            </Text>
          </View>
        </StoryAnchorCard>
      </View>
    </AppScreenLayout>
  )
}

/**
 * The two cards that hold a place, a note and maybe a photograph. Pulled out
 * because they are the same card twice; leaving them inline made the screen
 * read as four different things when it is really two.
 */
function MomentCard({
  title,
  icon,
  accent,
  moment,
  onEdit,
}: {
  title: string
  icon: 'coffee' | 'map-pin'
  accent: number
  moment: Moment | undefined
  onEdit: () => void
}) {
  const hasSomething = Boolean(moment?.location || moment?.note || moment?.photoUri)

  return (
    <StoryAnchorCard
      title={title}
      icon={icon}
      accent={accent}
      editLabel={COPY.edit(title)}
      onEdit={onEdit}
    >
      {hasSomething ? (
        <>
          {moment?.location ? (
            <Text variant="h2" tone="heading" align="center">
              {moment.location}
            </Text>
          ) : null}

          {moment?.note ? (
            <Text variant="body" tone="body" align="center">
              {moment.note}
            </Text>
          ) : null}

          {moment?.date ? (
            <View style={styles.pill}>
              <Text variant="caption" tone="body">
                {formatDate(moment.date)}
              </Text>
            </View>
          ) : null}

          {moment?.photoUri ? (
            <Image
              source={{ uri: moment.photoUri }}
              style={styles.photo}
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </>
      ) : (
        <Text variant="body" tone="body" align="center">
          {COPY.momentEmpty}
        </Text>
      )}
    </StoryAnchorCard>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  cards: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  pill: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
  photo: {
    width: '100%',
    height: 136,
    marginTop: theme.spacing.sm,
    borderRadius: theme.radii.field,
  },
  /** The frame's dashed well for a milestone nobody has added yet. */
  dashed: {
    width: '100%',
    paddingVertical: theme.spacing.huge,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.page,
  },
}))
