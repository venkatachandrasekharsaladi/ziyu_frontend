import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { PLACES_COPY } from '@/copy/sharedPlaces'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import { SharedMap } from '@/modules/module-06-plans/components/SharedMap'
import { SAMPLE_MEETUP, SAMPLE_PLACES } from '@/sample/plans'
import type { ShareWindow } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'

const WINDOWS: ShareWindow[] = ['1h', 'tonight', 'until-off']

/**
 * M06-S12 · Where we are. Figma 3482:2499.
 *
 * THE ONLY SCREEN IN THE CLUSTER WITH AN OFF SWITCH, and the pause is real: it
 * clears `sharingWindow` in the store and the map stops being handed the user's
 * own pin. A "pause" that kept broadcasting and only dimmed a button would be
 * the single worst bug this screen could ship, so the pin list is derived from
 * the sharing state rather than sitting beside it.
 *
 * The map itself is platform-split — see `SharedMap.tsx` and its `.web.tsx`
 * sibling. This screen never learns which half it rendered.
 */
export function SharedPlacesScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const sharingWindow = usePlansStore((state) => state.sharingWindow)
  const minutesRemaining = usePlansStore((state) => state.minutesRemaining)
  const setSharingWindow = usePlansStore((state) => state.setSharingWindow)

  const profile = useRelationshipStore((state) => state.profile)
  const partner = useRelationshipStore((state) => state.partner)

  const myName = profile?.name ?? SAMPLE_PLACES.me.name
  const partnerName = partner?.name ?? 'Sarah'

  const places = SAMPLE_PLACES
  const sharing = sharingWindow !== null

  /*
   * My own pin is included ONLY while sharing is on. See the header — this is
   * the line that makes the pause mean something.
   */
  const pins = [
    ...(sharing
      ? [
          {
            id: 'me',
            coordinate: places.me.coordinate,
            title: myName,
            snippet: places.me.detail,
          },
        ]
      : []),
    {
      id: 'partner',
      coordinate: places.partner.coordinate,
      title: places.partner.name,
      snippet: places.partner.detail,
    },
    {
      id: 'meetup',
      coordinate: SAMPLE_MEETUP.coordinate,
      title: SAMPLE_MEETUP.name,
      snippet: SAMPLE_MEETUP.walkLabel,
    },
  ]

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={PLACES_COPY.eyebrow}
        chipIcon="map-pin"
        title={PLACES_COPY.title}
        lede={PLACES_COPY.lede}
        aside={PLACES_COPY.onlyYouTwo}
      />

      <SharedMap
        center={SAMPLE_MEETUP.coordinate}
        pins={pins}
        accessibilityLabel={PLACES_COPY.mapLabel(places.area)}
      />

      <View style={styles.areaRow}>
        <Feather name="navigation" size={12} color={theme.colors.text.placeholder} />

        <Text variant="countdown" tone="placeholder">
          {places.area}
        </Text>
      </View>

      {/* TOGETHER RIGHT NOW */}
      <View style={styles.sectionHead}>
        <View style={styles.live}>
          <View style={styles.liveDot} />

          <Text variant="caption" tone="placeholder">
            {PLACES_COPY.togetherNow}
          </Text>
        </View>

        <Text variant="countdown" tone="brand">
          {PLACES_COPY.apart(places.distanceLabel)}
        </Text>
      </View>

      <View style={styles.partnerCard}>
        <Avatar name={partnerName} size={40} ring />

        <View style={styles.partnerFill}>
          <View style={styles.partnerTop}>
            <View style={styles.partnerTitleFill}>
              <Text variant="labelStrong" tone="heading">
                {places.partner.name}
              </Text>
            </View>

            <Chip label={PLACES_COPY.liveNow} tone="success" />
          </View>

          <Text variant="footnote" tone="body">
            {places.partner.detail}
          </Text>

          <View style={styles.partnerMeta}>
            <Feather name="battery" size={11} color={theme.colors.text.placeholder} />

            <Text variant="countdown" tone="placeholder">
              {PLACES_COPY.battery(places.partner.battery)}
            </Text>

            <Feather name="navigation-2" size={11} color={theme.colors.text.placeholder} />

            <Text variant="countdown" tone="placeholder">
              {places.partner.activity}
            </Text>

            <Text variant="countdown" tone="placeholder">
              {PLACES_COPY.updated(places.partner.updatedMinutesAgo)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chipRow}>
        <Chip label={PLACES_COPY.sendKiss} icon="heart" onPress={() => router.push('/(app)/chat')} />
        <Chip label={PLACES_COPY.onMyWay} icon="send" onPress={() => router.push('/(app)/chat')} />
      </View>

      {/* SHARING DURATION */}
      <View style={styles.panel}>
        <View style={styles.sectionHead}>
          <View style={styles.panelFill}>
            <Text variant="labelStrong" tone="heading">
              {PLACES_COPY.durationLabel}
            </Text>

            {sharing ? (
              <Text variant="footnote" tone="body">
                {sharingWindow === 'until-off'
                  ? PLACES_COPY.activeIndefinitely
                  : PLACES_COPY.activeFor(minutesRemaining)}
              </Text>
            ) : (
              <Text variant="footnote" tone="body">
                {PLACES_COPY.paused.lede(partnerName)}
              </Text>
            )}
          </View>

          {sharing ? (
            <Chip label={PLACES_COPY.expiring(places.expiresAtLabel)} tone="warning" />
          ) : null}
        </View>

        <View style={styles.chipRow}>
          {WINDOWS.map((window) => (
            <Chip
              key={window}
              label={PLACES_COPY.windows[window]}
              selected={sharingWindow === window}
              onPress={() => setSharingWindow(window)}
            />
          ))}
        </View>

        <View style={styles.panelFoot}>
          <Chip
            label={sharing ? PLACES_COPY.pause : PLACES_COPY.resume}
            icon={sharing ? 'pause-circle' : 'play-circle'}
            tone="brand"
            onPress={() => setSharingWindow(sharing ? null : '1h')}
          />

          <Text variant="countdown" tone="placeholder">
            {PLACES_COPY.editBounds}
          </Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actions}>
        {(
          [
            ['suggest', 'map-pin'],
            ['halfway', 'git-merge'],
            ['save', 'bookmark'],
          ] as const
        ).map(([key, icon]) => (
          <View key={key} style={styles.action}>
            <View style={styles.actionDisc}>
              <Feather name={icon} size={14} color={theme.colors.brand.primary} />
            </View>

            <Text variant="footnote" tone="heading" align="center">
              {PLACES_COPY.actions[key].label}
            </Text>

            <Text variant="countdown" tone="placeholder" align="center">
              {PLACES_COPY.actions[key].hint}
            </Text>
          </View>
        ))}
      </View>

      {/* PRIVACY */}
      <View style={styles.privacy}>
        <Feather name="lock" size={14} color={theme.colors.brand.primary} />

        <View style={styles.privacyFill}>
          <Text variant="footnote" tone="body">
            {PLACES_COPY.encryption}
          </Text>
        </View>
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.feedback.success,
  },
  partnerCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  partnerFill: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  partnerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  partnerTitleFill: {
    flex: 1,
  },
  partnerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  panel: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  panelFill: {
    flex: 1,
    gap: 2,
  },
  panelFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  actionDisc: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.field,
  },
  privacy: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.field,
  },
  privacyFill: {
    flex: 1,
  },
}))
