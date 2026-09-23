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
import { FooterPrompt } from '@/design-system/patterns/FooterPrompt'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { AmbientLayer } from '@/modules/module-00-auth/components/AmbientLayer'
import { HeroCollage } from '@/modules/module-00-auth/components/HeroCollage'
import { PrivacyFooter } from '@/modules/module-00-auth/components/PrivacyFooter'

/**
 * M00-S01 — Welcome to Tales of Two. Figma 522:266.
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
      style={GRADIENT_SCREEN}
    >
      <ThemedStatusBar />

      <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* No `onBack`: Welcome is the entry point, so there is nowhere back to. */}
        <AppHeader />

        <View style={styles.main}>
          <AmbientLayer />

          <View testID="welcome-content" style={styles.content}>
            <View style={styles.heroBlock}>
              <HeroCollage />
            </View>

            <View testID="welcome-copy-block" style={styles.copyBlock}>
              {/*
                Its own View, gap-less: `copyBlock`'s `gap` used to apply
                between these two lines as well as between the headline and
                the subtitle below it, so the two halves of one headline sat
                as far apart as the headline sat from the subtitle — it read
                as two separate lines rather than one two-line headline. The
                lines stay separate Text nodes (not a joined `\n` string) so
                `WelcomeScreen.test.tsx` can still find `headlineLines[0]` on
                its own; only the line-height governs their spacing now.
              */}
              <View>
                {WELCOME_COPY.headlineLines.map((line) => (
                  <Text key={line} variant="h1" tone="heading" align="center">
                    {line}
                  </Text>
                ))}
              </View>

              <View style={styles.subtitleWrap}>
                {WELCOME_COPY.subtitleLines.map((line) => (
                  <Text key={line} variant="body" tone="body" align="center">
                    {line}
                  </Text>
                ))}
              </View>
            </View>

            <View testID="welcome-actions" style={styles.actions}>
              <Button label={WELCOME_COPY.primaryCta} onPress={goToSignUp} variant="primary" />
              <FooterPrompt
                text={WELCOME_COPY.secondaryText}
                linkLabel={WELCOME_COPY.secondaryLink}
                onPress={goToSignIn}
              />
            </View>

            <PrivacyFooter />
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

/**
 * Plain style object — Unistyles styles do not reach `LinearGradient`.
 *
 * Same failure mode `HeroCollage` and `AmbientLayer` already carry this note
 * for with `expo-image`: Unistyles binds to the native shadow node and never
 * processes a third-party host component, so a `StyleSheet.create` entry
 * handed to `LinearGradient` arrived with `flex: 1` stripped. The gradient
 * then sized itself to its own content (904px) instead of stretching to the
 * screen (956px on a taller phone), leaving a gap at the bottom where the
 * app's root background colour — a flat, noticeably lighter lavender — showed
 * through below the gradient's darkest stop. Confirmed via the rendered
 * `getBoundingClientRect()` on web: `flex: '0 0 auto'` instead of `'1 1 0%'`.
 */
const GRADIENT_SCREEN = {
  flex: 1,
} as const

const styles = StyleSheet.create((theme) => ({
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
    // centres rather than stretching to the full width. Wider than
    // `theme.layout.column` (see `columnWide`'s comment in `tokens/layout.ts`)
    // because this wraps the hero collage too, not just the copy below it.
    maxWidth: theme.layout.columnWide,
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
    // The same column cap `AppScreenLayout` and `AuthScreenLayout` use, so the
    // headline lines up with every other screen's content once it is wide
    // enough to matter.
    maxWidth: theme.layout.column,
  },
  subtitleWrap: {
    paddingHorizontal: theme.spacing.md,
  },
  actions: {
    width: '100%',
    // Narrower than `theme.layout.column` on purpose — see `columnNarrow`'s
    // comment in `tokens/layout.ts`. Figma draws the CTAs tighter than the
    // copy above them.
    maxWidth: theme.layout.columnNarrow,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
}))
