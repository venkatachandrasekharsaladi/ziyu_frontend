import { Feather } from '@expo/vector-icons'
import { useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Switch, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ASSISTANT_TOGGLES, SPACE_ASSISTANT_COPY as COPY } from '@/copy/spaceAssistant'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { usePreferencesStore, type BooleanPreferenceKey } from '@/state/preferencesStore'

/**
 * M05-S28 — Space → LoveOS Assistant. Figma `3430:2279`.
 *
 * HELD UNTIL SAVE, unlike `OurPreferencesScreen` two screens over, and the
 * difference is the frame's: that one draws no save button and this one does.
 * It is the right split. Those switches change what your own space shows you;
 * these grant a standing permission to something that acts on its own, and a
 * permission that takes effect the instant a finger brushes it is the kind
 * people discover later and resent.
 *
 * The orb is DECORATIVE. It is drawn as a glow rather than an illustration —
 * there is no asset for it on the board, only a blurred circle and a shadow —
 * and it is hidden from screen readers, with the heading beneath carrying the
 * meaning instead.
 */
export function LoveOsAssistantScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const stored = usePreferencesStore()
  const setPreference = usePreferencesStore((state) => state.setPreference)

  const [draft, setDraft] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ASSISTANT_TOGGLES.map((row) => [row.key, stored[row.key]])),
  )
  const [isSaved, setIsSaved] = useState(false)

  const back = useCallback(() => router.back(), [router])
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  const onSave = useCallback(() => {
    for (const row of ASSISTANT_TOGGLES) {
      setPreference(row.key as BooleanPreferenceKey, draft[row.key] ?? false)
    }
    setIsSaved(true)
  }, [draft, setPreference])

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.orbWrap} accessibilityElementsHidden importantForAccessibility="no">
        <View style={styles.orb} />
      </View>

      <View style={styles.header}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Feather name="zap" size={20} color={theme.colors.brand.primary} />
          <Text variant="h3" tone="heading">
            {COPY.groupTitle}
          </Text>
        </View>

        {ASSISTANT_TOGGLES.map((row, i) => (
          <View key={row.key} style={[styles.row, i > 0 && styles.rowDivided]}>
            <View style={styles.copy}>
              <Text variant="labelStrong" tone="heading">
                {row.label}
              </Text>
              <Text variant="footnote" tone="body">
                {row.detail}
              </Text>
            </View>

            <Switch
              value={draft[row.key] ?? false}
              onValueChange={(next) => {
                setDraft((prev) => ({ ...prev, [row.key]: next }))
                setIsSaved(false)
              }}
              accessibilityLabel={row.label}
              accessibilityState={{ checked: draft[row.key] ?? false }}
              trackColor={{ false: theme.colors.border.field, true: theme.colors.brand.primary }}
              thumbColor={theme.colors.text.onPrimary}
            />
          </View>
        ))}
      </View>

      <View style={styles.more}>
        <SettingsRow
          icon="sliders"
          label={COPY.moreTitle}
          detail={COPY.moreDetail}
          onPress={go('/(app)/space/assistant-preferences')}
        />
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
  orbWrap: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxxl,
  },
  /**
   * The frame's orb is a 224pt circle inside a 256pt glow. There is no asset
   * for it, so it is built from the brand wash and the medallion shadow — the
   * two tokens that already describe "a soft lit thing" in this app.
   */
  orb: {
    width: 224,
    height: 224,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.glow,
    boxShadow: theme.elevation.medallion,
    opacity: 0.9,
  },
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radii.tile,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    boxShadow: theme.elevation.card,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  more: {
    paddingVertical: theme.spacing.xxl,
  },
}))
