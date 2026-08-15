import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { RELATIONSHIP_SETUP_COPY as COPY } from '@/copy/relationshipSetup'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'

/**
 * M01-S01 — Relationship Setup. Figma 522:302.
 *
 * The fork of the whole cluster: invite someone, redeem someone's invite, or
 * neither. Profile creation sits on the invite branch only — the person
 * entering a code is identified by the invite they redeem (spec §8).
 *
 * Reuses `AuthScreenLayout` rather than introducing an onboarding chrome: the
 * content column, insets and scroll behaviour are identical, and the drawn
 * 350pt column is exactly its inset (spec §6).
 */
export function RelationshipSetupScreen() {
  const router = useRouter()

  const goToProfile = useCallback(() => router.push('/(onboarding)/profile'), [router])
  const goToEnterCode = useCallback(() => router.push('/(onboarding)/enter-code'), [router])
  const goToStoryBegins = useCallback(() => router.push('/(onboarding)/story-begins'), [router])

  return (
    <AuthScreenLayout centred>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label={COPY.invite} onPress={goToProfile} />
        <Button label={COPY.haveCode} onPress={goToEnterCode} variant="outline" />
        <Button label={COPY.later} onPress={goToStoryBegins} variant="link" />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.huge,
  },
  actions: {
    gap: theme.spacing.md,
  },
}))
