import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CAPSULES_COPY } from '@/copy/capsules'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { Chip } from '@/modules/module-06-plans/components/Chip'
import { ScreenIntro } from '@/modules/module-06-plans/components/ScreenIntro'
import type { Capsule, CapsuleItemKind } from '@/services/plans/types'
import { usePlansStore } from '@/state/plansStore'

/** Days between now and an ISO date, floored at zero. */
function daysUntil(iso: string): number {
  const then = new Date(`${iso}T00:00:00`).getTime()
  const now = Date.now()

  return Math.max(0, Math.ceil((then - now) / 86_400_000))
}

/** "17 September 2027" — the long form the seal is printed in. */
function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "Sep 2027" — the short form the list rows use. */
function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  })
}

/**
 * M06-S06 · Time Capsules — the vault. Figma 3482:2146, upper half.
 *
 * COUNTDOWNS ARE COMPUTED, NOT STORED. The frame prints "478 days remaining",
 * which was true on the day it was drawn and is a lie on every day after. A
 * capsule knows the date it opens; how long that is from now is a function of
 * when you look at it.
 *
 * A SEALED CAPSULE SHOWS ITS COUNTS, NEVER ITS CONTENTS. The strip says "3
 * photos, 2 letters" and stops there. That is the whole product promise, and it
 * is why `Capsule` carries `contents` as counts rather than items — there is no
 * shape here that could leak what is inside.
 */
export function CapsulesScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()

  const capsules = usePlansStore((state) => state.capsules)
  const sealed = capsules.filter((capsule) => !capsule.opened)
  const featured = sealed[0] ?? null

  return (
    <AppScreenLayout activeTab="plans" onBack={() => router.back()}>
      <ScreenIntro
        chip={CAPSULES_COPY.eyebrow}
        chipIcon="lock"
        title={CAPSULES_COPY.title}
        lede={CAPSULES_COPY.lede}
      />

      {featured ? (
        <View style={styles.featured}>
          <View style={styles.featuredTop}>
            <Chip label={CAPSULES_COPY.featured.label} icon="lock" tone="brand" />

            <Text variant="countdown" tone="placeholder">
              {CAPSULES_COPY.featured.remaining(daysUntil(featured.opensAt))}
            </Text>
          </View>

          <View style={styles.seal}>
            <Feather name="lock" size={18} color={theme.colors.text.onPrimary} />
          </View>

          <Text variant="caption" tone="placeholder" align="center">
            {CAPSULES_COPY.featured.opensOn}
          </Text>

          <Text variant="h3" tone="brand" align="center">
            {longDate(featured.opensAt)}
          </Text>

          {featured.sealNote ? (
            <Text variant="footnote" tone="body" align="center">
              {`“${featured.sealNote}”`}
            </Text>
          ) : null}

          <View style={styles.contents}>
            <View style={styles.contentsHead}>
              <Text variant="caption" tone="placeholder">
                {CAPSULES_COPY.featured.sealedInside}
              </Text>

              <Text variant="countdown" tone="brand">
                {CAPSULES_COPY.featured.vault(1)}
              </Text>
            </View>

            <View style={styles.countRow}>
              {(Object.entries(featured.contents) as [CapsuleItemKind, number][]).map(
                ([kind, count]) => (
                  <View key={kind} style={styles.countTile}>
                    <Text variant="labelStrong" tone="heading">
                      {count}
                    </Text>

                    <Text variant="countdown" tone="placeholder">
                      {CAPSULES_COPY.contents[kind].toUpperCase()}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Feather name="inbox" size={20} color={theme.colors.brand.primary} />

          <Text variant="labelStrong" tone="heading" align="center">
            {CAPSULES_COPY.empty.heading}
          </Text>

          <Text variant="footnote" tone="body" align="center">
            {CAPSULES_COPY.empty.lede}
          </Text>
        </View>
      )}

      <Button
        label={CAPSULES_COPY.create}
        onPress={() => router.push('/(app)/plans/capsules/new')}
      />

      <View style={styles.listHead}>
        <Text variant="caption" tone="placeholder">
          {CAPSULES_COPY.listLabel}
        </Text>

        <Text variant="countdown" tone="brand">
          {CAPSULES_COPY.listCount(sealed.length)}
        </Text>
      </View>

      {capsules.map((capsule) => (
        <CapsuleRow key={capsule.id} capsule={capsule} />
      ))}
    </AppScreenLayout>
  )
}

function CapsuleRow({ capsule }: { capsule: Capsule }) {
  const { theme } = useUnistyles()

  const items = Object.values(capsule.contents).reduce((sum, n) => sum + n, 0)

  return (
    <PressableScale
      onPress={() => {}}
      accessibilityLabel={`${capsule.title}. ${CAPSULES_COPY.opensIn(shortDate(capsule.opensAt))}`}
    >
      <View style={styles.row}>
        <View style={styles.rowIcon}>
          <Feather name="mail" size={16} color={theme.colors.brand.primary} />
        </View>

        <View style={styles.rowFill}>
          <View style={styles.rowTop}>
            <View style={styles.rowTitleFill}>
              <Text variant="labelStrong" tone="heading">
                {capsule.title}
              </Text>
            </View>

            <Chip label={CAPSULES_COPY.sealed} tone="brand" />
          </View>

          <Text variant="countdown" tone="placeholder">
            {CAPSULES_COPY.createdOn(shortDate(capsule.createdAt), capsule.sealNote ?? 'Both of us')}
          </Text>

          <View style={styles.rowFoot}>
            <Feather name="lock" size={11} color={theme.colors.brand.primary} />

            <Text variant="countdown" tone="brand">
              {CAPSULES_COPY.opensIn(shortDate(capsule.opensAt))}
            </Text>

            <Text variant="countdown" tone="placeholder">
              {`· ${CAPSULES_COPY.itemsEnclosed(items)}`}
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create((theme) => ({
  featured: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.card,
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: theme.spacing.md,
  },
  seal: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  contents: {
    alignSelf: 'stretch',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  contentsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  countTile: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
  },
  empty: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xxl,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
  },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
  },
  rowFill: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowTitleFill: {
    flex: 1,
  },
  rowFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
}))
