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
 * Shared chrome for every screen inside `(app)`: header, the 350pt content
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

  const body = <View style={styles.column}>{children}</View>

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
    maxWidth: 448,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
}))
