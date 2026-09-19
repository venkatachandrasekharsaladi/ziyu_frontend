import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SPACE_HOME_COPY as COPY } from '@/copy/spaceHome'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { SpaceNoticeCard } from '@/modules/module-05-profile/components/SpaceNoticeCard'
import { SpacePortraits } from '@/modules/module-05-profile/components/SpacePortraits'
import { SpaceStatCard } from '@/modules/module-05-profile/components/SpaceStatCard'
import { SpaceWelcomeScreen } from '@/modules/module-05-profile/screens/SpaceWelcomeScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'
import { useStoryStore } from '@/state/storyStore'
import { daysSince } from '@/utils/daysUntil'
import { formatStoryDate } from '@/utils/formatStoryDate'

/**
 * M05-S20 — the Space tab's hub. Figma `3430:2338`, "Our Space (Refined)".
 *
 * What the Profile tab used to open. The settings LIST did not move — it is
 * still `SettingsHomeScreen`, still behind the cog in the header — but it is no
 * longer the first thing the tab shows. The board is explicit about the order:
 * who the two of you are, how long it has been, that it is private, and only
 * then the two ways in.
 *
 * The days figure is the SAME one the dashboard and the settings list count,
 * from the same `storyStore.met` through the same `daysSince`. Three screens
 * showing three different totals for "how long have we been together" is the
 * one number in this app that must never disagree with itself.
 *
 * A pair who skipped the "when did you meet" question have no total to show, so
 * the stat card is not drawn at all. A zero there would be a claim, and the
 * wrong one.
 *
 * BEFORE ANY OF THAT, the hub may not be a hub. `3430:1503` draws this tab as
 * an invitation for a pair who have not named their space yet, and that frame
 * is a STATE of this screen rather than a destination of its own — it carries
 * the Space tab active and offers no way back to a populated hub. So it is
 * rendered here, until the space has a name or the offer has been waved away.
 */
export function SpaceHomeScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const met = useStoryStore((state) => state.met)
  const spaceName = useSpaceStore((state) => state.name)
  const promptDismissed = useSpaceStore((state) => state.personalizePromptDismissed)

  const daysTogether = daysSince(met?.value)
  const since = met ? COPY.since(formatStoryDate(met)) : COPY.sinceUnknown

  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  if (!spaceName && !promptDismissed) {
    return <SpaceWelcomeScreen />
  }

  return (
    <AppScreenLayout activeTab="space">
      <View style={styles.header}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <SpacePortraits
        name={profile?.name ?? 'You'}
        partnerName={partner?.name}
        photoUri={profile?.photoUri}
        partnerPhotoUri={partner?.photoUri}
      />

      <View style={styles.bento}>
        {typeof daysTogether === 'number' ? (
          <SpaceStatCard
            eyebrow={COPY.timeTogether}
            value={daysTogether}
            label={COPY.daysLabel}
            footnote={since}
            footnoteIcon="calendar"
          />
        ) : null}

        <SpaceNoticeCard
          icon="lock"
          title={COPY.privateTitle}
          body={partner?.name ? COPY.privateBody(partner.name) : COPY.privateBodySolo}
        />
      </View>

      <Button label={COPY.personalize} onPress={go('/(app)/space/personalize')} />

      <View style={styles.links}>
        <SettingsRow
          icon="user"
          label={COPY.identityTitle}
          detail={COPY.identityBody}
          onPress={go('/(app)/space/identity')}
        />
        <SettingsRow
          icon="sliders"
          label={COPY.preferencesTitle}
          detail={COPY.preferencesBody}
          onPress={go('/(app)/space/preferences')}
        />
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxxl,
  },
  /** Two stacked cards. Figma calls the group a bento; on 390pt it is a column. */
  bento: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  links: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
  },
}))
