import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PRIVACY_PILLARS, SPACE_PRIVACY_COPY as COPY } from '@/copy/spacePrivacy'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { SpacePillarCard } from '@/modules/module-05-profile/components/SpacePillarCard'
import { useBackTo } from '@/hooks/useBackTo'

/**
 * M05-S26 — Space → Privacy Details. Figma `3430:1563`.
 *
 * A page that only says things. There is nothing to change here — the switches
 * that actually govern privacy are in Settings → Privacy, and this screen
 * deliberately does not duplicate them. Its job is the promise; that screen's
 * job is the control, and a page that mixed the two would let a reassuring
 * paragraph sit where a toggle belongs.
 *
 * `AppScreenLayout`, because the frame keeps the bottom bar — unlike
 * `PartnerConnectionScreen`, which suppresses it. The board is consistent
 * about which pages are tabs you are inside and which are tasks you leave.
 */
export function PrivacyDetailsScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const back = useBackTo('/(app)/space/preferences')

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <View style={styles.crest}>
          <Feather name="lock" size={20} color={theme.colors.accents[0].ink} />
        </View>

        <Text variant="h1" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.pillars}>
        {PRIVACY_PILLARS.map((pillar) => (
          <SpacePillarCard
            key={pillar.key}
            icon={pillar.icon}
            title={pillar.title}
            body={pillar.body}
            accent={pillar.accent}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text variant="footnote" tone="brand">
          {COPY.footer}
        </Text>
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: 'center',
    gap: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  crest: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.accents[0].soft,
  },
  pillars: {
    gap: theme.spacing.xxl,
  },
  /** The tilted chip the frame signs the page off with. */
  footer: {
    alignSelf: 'center',
    marginTop: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
    opacity: 0.7,
  },
}))
