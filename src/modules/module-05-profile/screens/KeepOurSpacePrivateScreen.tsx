import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
  ASSISTANT_ACCESS_OPTIONS,
  KEEP_PRIVATE_PRINCIPLES,
  SPACE_KEEP_PRIVATE_COPY as COPY,
} from '@/copy/spaceKeepPrivate'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { usePreferencesStore } from '@/state/preferencesStore'

/**
 * M05-S33 — Space → Keep Our Space Private. Figma `3430:489`.
 *
 * Two promises with a status chip each, then one real control.
 *
 * THE CHIPS ARE NOT BUTTONS. "Hidden" and "Internal Only" report what the app
 * already does; the frame draws them flat and they do nothing here either.
 * Making them pressable would have been the easy read of a rounded rectangle
 * and would have promised a setting that does not exist.
 *
 * THE ACCESS LEVEL IS. It writes `preferencesStore.assistantAccess` on tap —
 * no save button, because the frame has none and because this page's only CTA
 * goes somewhere else entirely. It is the same rule `OurPreferencesScreen`
 * follows: a lone switch with nowhere to commit lands where it is tapped.
 */
export function KeepOurSpacePrivateScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const access = usePreferencesStore((state) => state.assistantAccess)
  const setPreference = usePreferencesStore((state) => state.setPreference)

  const back = useCallback(() => router.back(), [router])
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <View style={styles.crest} accessibilityElementsHidden importantForAccessibility="no" />

        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.cards}>
        {KEEP_PRIVATE_PRINCIPLES.map((principle) => {
          const pair = theme.colors.accents[principle.accent] ?? theme.colors.accents[0]

          return (
            <View key={principle.key} style={styles.card}>
              <View style={styles.principleHead}>
                <View style={[styles.tile, { backgroundColor: pair.soft }]}>
                  <Feather name={principle.icon} size={18} color={pair.ink} />
                </View>

                <View style={styles.principleCopy}>
                  <Text variant="h3" tone="heading">
                    {principle.title}
                  </Text>
                  <Text variant="body" tone="body">
                    {principle.body}
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Text variant="caption" tone="body">
                  {principle.statusLabel}
                </Text>

                <View style={styles.chip}>
                  <Text variant="label" tone="brand">
                    {principle.statusValue}
                  </Text>
                </View>
              </View>
            </View>
          )
        })}

        <View style={styles.card}>
          <View style={styles.principleCopy}>
            <Text variant="h3" tone="heading">
              {COPY.assistantTitle}
            </Text>
            <Text variant="body" tone="body">
              {COPY.assistantBody}
            </Text>
          </View>

          <View style={styles.accessWell}>
            <Text variant="caption" tone="body">
              {COPY.assistantAccessLabel}
            </Text>

            <View
              style={styles.options}
              accessibilityRole="radiogroup"
              accessibilityLabel={COPY.assistantAccessLabel}
            >
              {ASSISTANT_ACCESS_OPTIONS.map((option) => {
                const selected = option.key === access

                return (
                  <PressableScale
                    key={option.key}
                    onPress={() => setPreference('assistantAccess', option.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={
                      selected ? `${option.label}, ${COPY.selected}` : option.label
                    }
                  >
                    <View style={styles.option}>
                      <View style={[styles.radio, selected && styles.radioOn]}>
                        {selected ? (
                          <Feather
                            name="check"
                            size={11}
                            color={theme.colors.text.onPrimary}
                          />
                        ) : null}
                      </View>

                      <Text variant="label" tone="heading">
                        {option.label}
                      </Text>
                    </View>
                  </PressableScale>
                )
              })}
            </View>
          </View>
        </View>
      </View>

      <Button label={COPY.review} onPress={go('/(app)/settings/privacy')} />

      <Text variant="footnote" tone="body" align="center">
        {COPY.reviewHint}
      </Text>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  /** The frame's blurred lavender medallion. Decorative, so it is hidden. */
  crest: {
    width: 160,
    height: 160,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.glow,
    boxShadow: theme.elevation.medallion,
    marginBottom: theme.spacing.lg,
  },
  cards: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  principleHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  },
  principleCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  tile: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
  },
  accessWell: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  options: {
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  radio: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.card,
  },
  radioOn: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
}))
