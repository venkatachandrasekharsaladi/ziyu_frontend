import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { WELCOME_COPY } from '@/copy/welcome'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { AppHeader } from '@/design-system/patterns/AppHeader'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { AmbientLayer } from '@/modules/module-00-auth/components/AmbientLayer'
import { HeroCollage } from '@/modules/module-00-auth/components/HeroCollage'
import { PrivacyFooter } from '@/modules/module-00-auth/components/PrivacyFooter'

/**
 * M00-S01 — Welcome to LoveOS. Figma 522:266.
 *
 * The first screen a new user sees. Presentation only: no session check, no
 * auth. Both buttons hand off to Module 00's other screens.
 *
 * Layout note — the Figma frame is a fixed 390×920. Reproducing its absolute
 * offsets would push the primary button off a 667pt-tall iPhone SE, so the
 * blocks are stacked in flex order instead, with the hero as the only element
 * permitted to shrink. Header and footer stay put; the middle absorbs the
 * difference.
 */
export function WelcomeScreen() {
  const router = useRouter()
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()

  const goToSignUp = useCallback(() => router.push('/(auth)/sign-up'), [router])
  const goToSignIn = useCallback(() => router.push('/(auth)/sign-in'), [router])

  return (
    <LinearGradient
      colors={[theme.colors.surface.gradientFrom, theme.colors.surface.gradientTo]}
      style={styles.screen}
    >
      <ThemedStatusBar />

      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* No `onBack`: Welcome is the entry point, so there is nowhere back to. */}
        <AppHeader />

        <View style={styles.main}>
          <AmbientLayer />

          <View style={styles.content}>
            <View style={styles.heroBlock}>
              <HeroCollage />
            </View>

            <View style={styles.copyBlock}>
              {WELCOME_COPY.headlineLines.map((line) => (
                <Text key={line} variant="h1" tone="heading" align="center">
                  {line}
                </Text>
              ))}

              <View style={styles.subtitleWrap}>
                {WELCOME_COPY.subtitleLines.map((line) => (
                  <Text key={line} variant="body" tone="body" align="center">
                    {line}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button label={WELCOME_COPY.primaryCta} onPress={goToSignUp} variant="primary" />
              <View style={styles.secondaryWrap}>
                <Button label={WELCOME_COPY.secondaryCta} onPress={goToSignIn} variant="link" />
              </View>
            </View>

            <PrivacyFooter />
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  main: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    width: '100%',
    // Phone is the primary target; on a tablet the column stops growing and
    // centres rather than stretching to the full width.
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  heroBlock: {
    flexShrink: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.heroInset,
  },
  copyBlock: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    alignSelf: 'center',
    maxWidth: 448,
  },
  subtitleWrap: {
    paddingHorizontal: theme.spacing.md,
  },
  actions: {
    width: '100%',
    maxWidth: 384,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  secondaryWrap: {
    paddingTop: theme.spacing.md,
  },
}))
