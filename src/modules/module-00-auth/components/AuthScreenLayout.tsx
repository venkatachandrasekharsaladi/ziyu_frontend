import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { AppHeader } from '@/design-system/patterns/AppHeader'

type AuthScreenLayoutProps = {
  onBack?: () => void
  /** Centres the content vertically when it is shorter than the screen. */
  centred?: boolean
  children: ReactNode
}

/**
 * Shared chrome for the four M00 form screens: flat page fill, the top glow,
 * pinned header, and scroll + keyboard behaviour.
 *
 * The background is a flat fill plus a glow, NOT the hero gradient — a gradient
 * running to `surface.gradientTo` would sit under the primary button and cut its
 * contrast (spec D18). M00-S01 keeps the gradient; it is the only screen with it.
 *
 * Unlike M00-S01 these screens scroll: the frames are 877–971pt tall against an
 * iPhone SE's 667, so fixed layout would push the submit button off-screen.
 */
export function AuthScreenLayout({ onBack, centred = false, children }: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets()
  const { theme } = useUnistyles()

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={{ paddingTop: insets.top }}>
        <AppHeader onBack={onBack} />
      </View>

      <View style={styles.flex}>
        {/*
          A vertical fade, NOT a rounded solid View. The first attempt used a
          border-radius'd solid fill, which rendered as a hard-edged lavender
          ellipse with a crisp curve cutting across the heading — a band, not a
          glow. A gradient to full transparency has no edge to see, and unlike a
          blur it behaves identically on native and web.

          Rendered inside the body rather than at the screen root so it starts
          below the header; at the root, the header's opaque fill would clip it
          and leave a visible step.
        */}
        <LinearGradient
          colors={[theme.colors.surface.glow, 'rgba(206, 189, 255, 0)']}
          style={styles.glow}
          pointerEvents="none"
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              // flexGrow on the CONTENT container, not justifyContent on the
              // ScrollView itself, which would fight the scroll.
              centred && styles.centred,
              { paddingBottom: insets.bottom + 24 },
            ]}
            // Without this, the first tap on the submit button only dismisses the
            // keyboard and the user has to tap twice.
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.column}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  flex: {
    flex: 1,
  },
  // Percentage height rather than Figma's fixed 1161pt circle, so it holds its
  // relationship on any screen height. No border radius and no solid fill: the
  // fade IS the shape.
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  centred: {
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    // Phone is the primary target; on a tablet the column stops growing and
    // centres rather than stretching.
    maxWidth: 448,
    alignSelf: 'center',
  },
}))
