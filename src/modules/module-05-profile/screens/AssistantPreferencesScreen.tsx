import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Switch, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import {
  ASSISTANT_FREQUENCIES,
  ASSISTANT_SUGGESTIONS,
  ASSISTANT_TONES,
  FREQUENCY_PROMISE,
  SPACE_ASSISTANT_PREFERENCES_COPY as COPY,
} from '@/copy/spaceAssistantPreferences'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { SegmentedControl } from '@/design-system/primitives/SegmentedControl'
import { Text } from '@/design-system/primitives/Text'
import { usePreferencesStore, type AssistantFrequency } from '@/state/preferencesStore'

/**
 * M05-S34 — Space → Assistant Preferences. Figma `3430:1276`.
 *
 * The deep version of `LoveOsAssistantScreen`: the same subject, three sections
 * instead of one. Both frames are on the board and both are built; that screen
 * grants standing permissions behind a save, this one tunes voice and pace.
 *
 * NO SAVE HERE, and the frame draws none. Every control lands where it is
 * tapped — the split `OurPreferencesScreen` documents. It is the right side of
 * that line: changing the assistant's tone is reversible, visible immediately,
 * and nothing is granted by it.
 *
 * THE FREQUENCY IS A SEGMENTED CONTROL, not the slider the frame draws. Three
 * labelled stops with no values between them is a choice of three, and a slider
 * is the wrong instrument for that — it implies a continuum, cannot be operated
 * precisely by touch, and has no good keyboard or screen-reader story. The
 * stops and their order are unchanged. Flagged for review.
 */
export function AssistantPreferencesScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const preferences = usePreferencesStore()
  const toggle = usePreferencesStore((state) => state.toggle)
  const setPreference = usePreferencesStore((state) => state.setPreference)

  const back = useCallback(() => router.back(), [router])

  const onFrequency = useCallback(
    (next: AssistantFrequency) => setPreference('assistantFrequency', next),
    [setPreference],
  )

  return (
    <SettingsScreenLayout title={COPY.barTitle} onBack={back}>
      <View style={styles.header}>
        <View style={styles.orb} accessibilityElementsHidden importantForAccessibility="no" />

        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.sections}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Feather name="gift" size={18} color={theme.colors.brand.primary} />
            <Text variant="h3" tone="heading">
              {COPY.suggestTitle}
            </Text>
          </View>

          {ASSISTANT_SUGGESTIONS.map((row) => (
            <View key={row.key} style={styles.suggestion}>
              <View style={styles.suggestionCopy}>
                <Text variant="labelStrong" tone="heading">
                  {row.label}
                </Text>
                <Text variant="caption" tone="body">
                  {row.detail}
                </Text>
              </View>

              <Switch
                value={preferences[row.key]}
                onValueChange={() => toggle(row.key)}
                accessibilityLabel={row.label}
                accessibilityState={{ checked: preferences[row.key] }}
                trackColor={{
                  false: theme.colors.border.field,
                  true: theme.colors.brand.primary,
                }}
                thumbColor={theme.colors.text.onPrimary}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Feather name="message-circle" size={18} color={theme.colors.brand.primary} />
            <Text variant="h3" tone="heading">
              {COPY.toneTitle}
            </Text>
          </View>

          <Text variant="body" tone="body">
            {COPY.toneLede}
          </Text>

          <View
            style={styles.tones}
            accessibilityRole="radiogroup"
            accessibilityLabel={COPY.toneTitle}
          >
            {ASSISTANT_TONES.map((tone) => {
              const selected = tone.key === preferences.assistantTone

              return (
                <PressableScale
                  key={tone.key}
                  onPress={() => setPreference('assistantTone', tone.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={selected ? `${tone.label}, ${COPY.selected}` : tone.label}
                >
                  <View style={[styles.tone, selected && styles.toneSelected]}>
                    <View style={styles.toneHead}>
                      <Feather
                        name={tone.icon}
                        size={18}
                        color={
                          selected ? theme.colors.brand.primary : theme.colors.text.body
                        }
                      />
                      <Text variant="h3" tone="heading">
                        {tone.label}
                      </Text>
                    </View>

                    <Text variant="label" tone="body">
                      {tone.detail}
                    </Text>
                  </View>
                </PressableScale>
              )
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Feather name="clock" size={18} color={theme.colors.brand.primary} />
            <Text variant="h3" tone="heading">
              {COPY.frequencyTitle}
            </Text>
          </View>

          {/*
            `labelHidden`: the card already draws this heading above, and the
            control's caption would be the same words again in a lighter style.
            The NAME is unaffected — the radiogroup still announces as
            "How often I chime in".
          */}
          <SegmentedControl
            label={COPY.frequencyTitle}
            labelHidden
            segments={ASSISTANT_FREQUENCIES.map((f) => ({ value: f.key, label: f.label }))}
            value={preferences.assistantFrequency}
            onChange={onFrequency}
          />

          <View style={styles.promise}>
            <Text variant="body" tone="heading" align="center">
              {FREQUENCY_PROMISE[preferences.assistantFrequency]}
            </Text>
          </View>
        </View>
      </View>
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.huge,
  },
  /** Built from the brand wash and the medallion shadow — see the assistant's note. */
  orb: {
    width: 128,
    height: 128,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.glow,
    boxShadow: theme.elevation.medallion,
    marginBottom: theme.spacing.md,
  },
  sections: {
    gap: theme.spacing.lg,
  },
  card: {
    gap: theme.spacing.lg,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.field,
    boxShadow: theme.elevation.card,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  suggestionCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  tones: {
    gap: theme.spacing.md,
  },
  tone: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 2,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
  toneSelected: {
    borderColor: theme.colors.brand.primary,
    backgroundColor: theme.colors.surface.soft,
  },
  toneHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  promise: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.page,
  },
}))
