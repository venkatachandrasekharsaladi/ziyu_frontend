import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import {
  SPACE_MORE_LINKS,
  SPACE_PREFERENCE_GROUPS,
  SPACE_PREFERENCES_COPY as COPY,
} from '@/copy/spacePreferences'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { Text } from '@/design-system/primitives/Text'
import { PreferenceGroup } from '@/modules/module-05-profile/components/PreferenceGroup'
import { usePreferencesStore } from '@/state/preferencesStore'

/**
 * M05-S24 — Space → Our Preferences. Figma `3430:1878`.
 *
 * NO SAVE BUTTON, and the frame draws none. Every other screen in this section
 * holds its answer until a save because the answer is one thing the user is
 * composing; here each switch is its own decision and takes effect at once,
 * which is how the rest of the app's settings already behave. A save here
 * would be the odd one out in both directions.
 *
 * The whole screen is driven by `SPACE_PREFERENCE_GROUPS`. Adding a ninth
 * switch is a row in that array and a key in `preferencesStore`, not a change
 * here.
 */
export function OurPreferencesScreen() {
  const router = useRouter()
  const preferences = usePreferencesStore()
  const toggle = usePreferencesStore((state) => state.toggle)

  const back = useCallback(() => router.back(), [router])
  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  return (
    <AppScreenLayout activeTab="space" onBack={back}>
      <View style={styles.header}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.groups}>
        {SPACE_PREFERENCE_GROUPS.map((group) => (
          <PreferenceGroup
            key={group.title}
            title={group.title}
            icon={group.icon}
            accent={group.accent}
            rows={group.rows.map((row) => ({
              key: row.key,
              label: row.label,
              srLabel: `${group.spoken}, ${row.label}`,
              detail: row.detail,
              value: preferences[row.key],
              onValueChange: () => toggle(row.key),
            }))}
          />
        ))}
      </View>

      <View style={styles.more}>
        <Text variant="caption" tone="body">
          {COPY.moreTitle}
        </Text>

        {SPACE_MORE_LINKS.map((link) => (
          <SettingsRow
            key={link.key}
            icon={link.icon}
            label={link.label}
            detail={link.detail}
            onPress={go(link.href)}
          />
        ))}
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.huge,
  },
  groups: {
    gap: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
  },
  more: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
}))
