import { useRouter, type Href } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { SPACE_WELCOME_COPY as COPY } from '@/copy/spaceWelcome'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { useSpaceStore } from '@/state/spaceStore'

/**
 * M05-S30 — the Space hub before it has been personalized. Figma `3430:1503`.
 *
 * `SpaceHomeScreen` renders this instead of itself when the pair have not
 * named their space and have not waved the prompt away. It is also its own
 * route so it can be opened directly for review.
 *
 * "MAYBE LATER" ACTUALLY MEANS LATER. It writes
 * `spaceStore.personalizePromptDismissed`, and the hub honours it from then
 * on. A dismissal that did not persist would put the same screen back on the
 * next visit, which is how a polite offer turns into nagging.
 *
 * The orb is decorative and hidden from screen readers — same treatment as
 * `LoveOsAssistantScreen`, and for the same reason: the heading beneath it
 * already carries the meaning.
 */
export function SpaceWelcomeScreen() {
  const router = useRouter()
  const dismiss = useSpaceStore((state) => state.dismissPersonalizePrompt)

  const go = useCallback((href: string) => () => router.push(href as Href), [router])

  return (
    <AppScreenLayout activeTab="space">
      <View style={styles.orbWrap} accessibilityElementsHidden importantForAccessibility="no">
        <View style={styles.orb} />
      </View>

      <View style={styles.copy}>
        <Text variant="h2" tone="heading" align="center">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label={COPY.personalize} onPress={go('/(app)/space/personalize')} />
        <Button label={COPY.later} variant="soft" onPress={dismiss} />
      </View>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  orbWrap: {
    alignItems: 'center',
    paddingTop: theme.spacing.huge,
  },
  /** Built from the brand wash and the medallion shadow — see the assistant's note. */
  orb: {
    width: 205,
    height: 205,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.glow,
    boxShadow: theme.elevation.medallion,
  },
  copy: {
    gap: theme.spacing.xxl,
    paddingVertical: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.md,
  },
}))
