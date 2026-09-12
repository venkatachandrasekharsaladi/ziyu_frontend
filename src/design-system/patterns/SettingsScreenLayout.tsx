import type { ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { IconButton } from '@/design-system/patterns/IconButton'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { Text } from '@/design-system/primitives/Text'

type SettingsScreenLayoutProps = {
  title: string
  /** Omit only on a screen that cannot be backed out of. Every settings page has one. */
  onBack?: () => void
  /** One line under the title explaining what the screen is for. */
  lede?: string
  /** Turns off the scroll view for a screen that manages its own list. */
  scroll?: boolean
  children?: ReactNode
}

/**
 * Chrome for a pushed settings page.
 *
 * The counterpart to `AppScreenLayout`, and deliberately the same 350pt column
 * and the same scroll behaviour — the two differences are the ones the
 * navigation model asks for: this bar carries the SCREEN's title rather than
 * the brand wordmark, and there is NO `BottomNav`. A settings detail page is a
 * full screen you back out of, not a tab you are inside.
 *
 * The back control sits in a fixed 44pt slot with a matching spacer opposite,
 * so the title is centred by symmetry rather than by an inset that only works
 * at one screen width — the same fix `AppHeader` carries.
 */
export function SettingsScreenLayout({
  title,
  onBack,
  lede,
  scroll = true,
  children,
}: SettingsScreenLayoutProps) {
  const insets = useSafeAreaInsets()

  const body = (
    <View testID="settings-screen-column" style={styles.column}>
      {lede ? (
        <Text variant="body" tone="body">
          {lede}
        </Text>
      ) : null}

      {children}
    </View>
  )

  return (
    <View style={styles.screen}>
      <ThemedStatusBar />

      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <View style={styles.edge}>
          {onBack ? (
            <IconButton icon="arrow-left" label="Go back" onPress={onBack} tone="plain" />
          ) : null}
        </View>

        <Text variant="h3" tone="heading" align="center">
          {title}
        </Text>

        <View style={styles.edge} />
      </View>

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          /*
           * Copied verbatim from `AppScreenLayout`, comments included, because
           * each one was a separate fix and every reason applies here too:
           * dragging dismisses the keyboard; the first tap on a button while
           * the keyboard is up is not swallowed; iOS handles the notch inset
           * itself; and Android's blue overscroll glow — an unthemed colour —
           * stays off.
           */
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          overScrollMode="never"
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content]}>{body}</View>
      )}
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface.page,
  },
  /** Matches `IconButton`'s `md` diameter, so the title stays centred. */
  edge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  column: {
    width: '100%',
    // The single lever — see `tokens/layout.ts`. `width: '100%'` keeps a phone
    // fluid; `maxWidth` only stops a tablet from stretching it. Same value and
    // same gap as `AppScreenLayout`, so a pushed page and a tab page measure
    // identically.
    maxWidth: theme.layout.column,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
}))
