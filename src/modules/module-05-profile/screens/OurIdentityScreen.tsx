import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SPACE_IDENTITY_COPY as COPY } from '@/copy/spaceIdentity'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { IdentityCard } from '@/modules/module-05-profile/components/IdentityCard'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { formatStoryDate } from '@/utils/formatStoryDate'

/**
 * M05-S21 — Space → Our Identity. Figma `3430:138`, "Our Identity (Module 05)".
 *
 * WHY THIS FRAME AND NOT THE REFINED ONE. The board carries two versions and
 * the refined one (`3430:1813`, shipped beside this as
 * `OurIdentityRefinedScreen`) is a STRICT SUBSET — it keeps the header, the two
 * portraits and the save, and drops the identity cards and the journey date
 * that are the only editable things on the page. A "Save Our Identity" button
 * over a screen with nothing to change is a button that cannot mean anything,
 * so the fuller frame takes the route and the refined one ships as the
 * alternate. Flagged for review rather than decided quietly.
 *
 * The epithets are PLACEHOLDERS. No store holds them and no frame on the board
 * draws a field for them, so they come from copy and are the same two words for
 * every couple. Inventing one per person from their name would be worse: it
 * would look like the app knows something about them that it does not.
 */
export function OurIdentityScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const met = useStoryStore((state) => state.met)

  const [isSaved, setIsSaved] = useState(false)

  const go = useCallback((href: string) => () => router.push(href as Href), [router])
  const back = useCallback(() => router.back(), [router])
  const onSave = useCallback(() => setIsSaved(true), [])

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
        <IdentityCard
          name={profile?.name ?? 'You'}
          photoUri={profile?.photoUri}
          epithet={COPY.youEpithet}
          actionLabel={COPY.editMine}
          onPress={go('/(app)/space/edit-profile')}
        />

        {partner?.name ? (
          <IdentityCard
            name={partner.name}
            photoUri={partner.photoUri}
            epithet={COPY.partnerEpithet}
            actionLabel={COPY.editPartner}
            onPress={go('/(app)/space/edit-partner')}
          />
        ) : null}

        {/*
          The journey card is the way into Relationship Details. The board
          draws no link to that screen from anywhere; this card names the same
          date it opens, so it is the one place the link belongs.
        */}
        <PressableScale
          onPress={go('/(app)/space/relationship')}
          accessibilityLabel={COPY.journeyBegan}
        >
          <View style={styles.journey}>
          <View style={styles.journeyRow}>
            <View style={styles.tile}>
              <Feather name="calendar" size={20} color={theme.colors.brand.primary} />
            </View>

            <View>
              <Text variant="caption" tone="body">
                {COPY.journeyBegan}
              </Text>
              <Text variant="h3" tone="heading">
                {met ? formatStoryDate(met) : COPY.journeyUnknown}
              </Text>
            </View>
          </View>

          <Text variant="footnote" tone="body" align="center">
            {COPY.forever}
          </Text>
          </View>
        </PressableScale>
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
    paddingTop: theme.spacing.xxxl,
  },
  cards: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.huge,
  },
  journey: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
}))
