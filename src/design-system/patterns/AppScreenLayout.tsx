import { useRouter } from 'expo-router'
import { useCallback, type ReactNode } from 'react'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { APP_NAV, type AppTabKey } from '@/copy/appNav'
import { AppHeader } from '@/design-system/patterns/AppHeader'
import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { BottomNav } from '@/design-system/patterns/BottomNav'

type AppScreenLayoutProps = {
  activeTab: AppTabKey
  onBack?: () => void
  /** Turns off the scroll view for screens that manage their own list. */
  scroll?: boolean
  /**
   * Optional so a screen still loading its data can render the chrome alone.
   * That keeps the header and bottom bar steady instead of flashing a spinner
   * for the length of one request.
   */
  children?: ReactNode
}

/**
 * Shared chrome for every screen inside `(app)`: header, the 448pt content
 * column, and the bottom bar.
 *
 * The counterpart to `AuthScreenLayout`, and deliberately the same shape — same
 * inset, same column cap, same header — so moving from onboarding into the app
 * is not a change of visual language.
 */
export function AppScreenLayout({
  activeTab,
  onBack,
  scroll = true,
  children,
}: AppScreenLayoutProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const onSelect = useCallback(
    (key: string) => {
      const tab = APP_NAV.tabs.find((t) => t.key === key)

      if (!tab?.live || !tab.href || key === activeTab) return

      router.replace(tab.href as '/(app)/home')
    },
    [router, activeTab],
  )

  const body = (
    <View testID="app-screen-column" style={styles.column}>
      {children}
    </View>
  )

  return (
    <View style={styles.screen}>
      <ThemedStatusBar />

      <View style={{ paddingTop: insets.top }}>
        <AppHeader onBack={onBack} />
      </View>

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          /*
           * SCROLL FEEL. Every one of these was absent, and this is the
           * scroller most screens in the app are rendered inside — so each
           * fix lands everywhere at once.
           *
           * `keyboardDismissMode="on-drag"`: dragging the content pushes the
           * keyboard away, instead of it staying up and covering the thing
           * the user just scrolled to see.
           *
           * `keyboardShouldPersistTaps="handled"`: without it, the first tap
           * on a button while the keyboard is open only dismisses the
           * keyboard and the user has to tap twice. `AuthScreenLayout`
           * already learned this and carries the same prop with the same
           * note — this brings the app group in line with it.
           *
           * `contentInsetAdjustmentBehavior="automatic"`: lets iOS handle
           * the inset under a notch/Dynamic Island itself rather than the
           * content starting under it on first paint.
           *
           * `overScrollMode="never"`: Android's blue glow at the top and
           * bottom is a stock-Android affordance that reads as a foreign
           * object in a themed surface. iOS rubber-banding is kept, because
           * it is the platform's own idea of the same thing and does not
           * paint an unthemed colour.
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

      <BottomNav tabs={APP_NAV.tabs} activeKey={activeTab} onSelect={onSelect} />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  column: {
    width: '100%',
    // The single lever — see `tokens/layout.ts`. `width: '100%'` is what keeps
    // a phone fluid; `maxWidth` is only what stops a tablet from stretching it.
    maxWidth: theme.layout.column,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
}))
