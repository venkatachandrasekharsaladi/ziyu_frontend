import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { SPACE_PARTNER_COPY as COPY } from '@/copy/spacePartner'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { SpacePortraits } from '@/modules/module-05-profile/components/SpacePortraits'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useStoryStore } from '@/state/storyStore'
import { formatStoryDate } from '@/utils/formatStoryDate'

/**
 * M05-S25 — Space → Partner & Connection. Figma `3430:1645`.
 *
 * `SettingsScreenLayout`, not `AppScreenLayout`. The frame names itself
 * "Navigation suppressed for a focused, task-like sub-page" and draws no bottom
 * bar, which is exactly the distinction the two layouts already encode: a tab
 * you are inside keeps the bar, a page you back out of does not.
 *
 * The frame's oversized centred heading is drawn by that layout's header
 * instead, so this page matches the twenty other pushed pages in the app rather
 * than being the one that puts its title somewhere else. Same words, app's own
 * chrome — the trade the design-to-code pass is meant to make.
 *
 * TWO DEVIATIONS, both flagged. The prints reuse `SpacePortraits` rather than a
 * second near-identical polaroid pair, so the names sit on pills rather than in
 * a caption between the frames. And the frame only ever draws a CONNECTED
 * partner; the unpaired state below is ours, because the hub links here whether
 * or not anyone has accepted an invite.
 */
export function PartnerConnectionScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)
  const met = useStoryStore((state) => state.met)

  const back = useCallback(() => router.back(), [router])
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  const you = profile?.name ?? 'You'

  if (!partner?.name) {
    return (
      <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={back}>
        <View style={styles.card}>
          <Text variant="h3" tone="heading" align="center">
            {COPY.waitingTitle}
          </Text>
          <Text variant="body" tone="body" align="center">
            {COPY.waitingBody}
          </Text>
        </View>

        <Button label={COPY.invite} onPress={go('/(app)/settings/partner')} />
      </SettingsScreenLayout>
    )
  }

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={back}>
      <SpacePortraits
        name={you}
        partnerName={partner.name}
        photoUri={profile?.photoUri}
        partnerPhotoUri={partner.photoUri}
      />

      <Text variant="footnote" tone="heading" align="center">
        {COPY.pair(you, partner.name)}
      </Text>

      <View style={styles.card}>
        <View style={styles.tile}>
          <Feather name="heart" size={20} color={theme.colors.accents[0].ink} />
        </View>

        <Text variant="h2" tone="heading" align="center">
          {COPY.connected}
        </Text>
        <Text variant="body" tone="body" align="center">
          {met ? COPY.connectedSince(formatStoryDate(met)) : COPY.connectedSinceUnknown}
        </Text>

        <View style={styles.divider} />

        <Text variant="caption" tone="body" align="center">
          {COPY.accessTitle}
        </Text>
        <Text variant="body" tone="heading" align="center">
          {COPY.accessBody(partner.name)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={COPY.editPartner}
          variant="outline"
          onPress={go('/(app)/space/edit-partner')}
        />
        <Button label={COPY.manage} onPress={go('/(app)/settings/partner')} />
      </View>
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[0].soft,
  },
  /** 200pt wide in the frame, centred — a rule between two ideas, not an edge. */
  divider: {
    width: 200,
    height: 1,
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.border.subtle,
  },
  actions: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
}))
