import { useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SPACE_IDENTITY_COPY as COPY } from '@/copy/spaceIdentity'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { formatStoryDate } from '@/utils/formatStoryDate'
import { useBackTo } from '@/hooks/useBackTo'

/**
 * M05-S21b — Space → Our Identity, the refined frame. Figma `3430:1813`.
 *
 * The alternate to `OurIdentityScreen`, which holds the route. See that file
 * for why: this frame drops every editable thing and keeps the save.
 *
 * ONE DEVIATION, and it is deliberate. The frame draws the two portraits as
 * flat images and offers no way to reach the edit screens, which leaves the
 * save with nothing to save. Here each portrait IS the way in — tapping one
 * opens that person's edit screen. That is the smallest change that makes the
 * page work, and it adds no pixel the design did not already draw. Flagged for
 * review.
 */
export function OurIdentityRefinedScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const met = useStoryStore((state) => state.met)

  const [isSaved, setIsSaved] = useState(false)

  const go = useCallback((href: string) => () => router.push(href as Href), [router])
  const back = useBackTo('/(app)/space')
  const onSave = useCallback(() => setIsSaved(true), [])

  const you = profile?.name ?? 'You'

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <Text variant="h1" tone="heading" align="center">
          {partner?.name ? COPY.pair(you, partner.name) : you}
        </Text>

        {met ? (
          <Text variant="h3" tone="brand" align="center">
            {COPY.togetherSince(formatStoryDate(met))}
          </Text>
        ) : null}

        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.portraits}>
        <Pressable
          onPress={go('/(app)/space/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel={COPY.editMine}
        >
          <Avatar name={you} uri={profile?.photoUri} size={160} ring />
        </Pressable>

        {partner?.name ? (
          <Pressable
            style={styles.overlap}
            onPress={go('/(app)/space/edit-partner')}
            accessibilityRole="button"
            accessibilityLabel={COPY.editPartner}
          >
            <Avatar name={partner.name} uri={partner.photoUri} size={160} ring />
          </Pressable>
        ) : null}
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
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxxl,
  },
  portraits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  /** Figma pulls the second portrait 24pt over the first. */
  overlap: {
    marginLeft: -theme.spacing.xxl,
  },
}))
