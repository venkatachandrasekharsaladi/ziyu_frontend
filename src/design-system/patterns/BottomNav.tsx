import { Feather } from '@expo/vector-icons'
import { useCallback } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export type NavTab = {
  key: string
  label: string
  icon: React.ComponentProps<typeof Feather>['name']
  /** False while the destination has not been built. */
  live: boolean
}

type BottomNavProps = {
  tabs: readonly NavTab[]
  activeKey: string
  onSelect?: (key: string) => void
}

/**
 * The app's bottom navigation.
 *
 * Tabs whose destination does not exist yet are rendered DISABLED rather than
 * hidden. Hiding them would make the app look finished and then surprise the
 * user when the bar changes shape later; a visibly inactive tab says "coming",
 * which is true. Same rule M01-S11 and S19 follow for their unbuilt exits.
 */
export function BottomNav({ tabs, activeKey, onSelect }: BottomNavProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]} accessibilityRole="tablist">
      {tabs.map((tab) => (
        <NavItem key={tab.key} tab={tab} active={tab.key === activeKey} onSelect={onSelect} />
      ))}
    </View>
  )
}

function NavItem({
  tab,
  active,
  onSelect,
}: {
  tab: NavTab
  active: boolean
  onSelect?: (key: string) => void
}) {
  const { theme } = useUnistyles()
  const onPress = useCallback(() => onSelect?.(tab.key), [onSelect, tab.key])

  styles.useVariants({ state: active ? 'active' : tab.live ? 'rest' : 'disabled' })

  const tint = active
    ? theme.colors.brand.primary
    : tab.live
      ? theme.colors.text.body
      : theme.colors.border.field

  return (
    <Pressable
      onPress={onPress}
      disabled={!tab.live}
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled: !tab.live }}
      accessibilityLabel={tab.label}
    >
      <Feather name={tab.icon} size={20} color={tint} />
      <Text variant="captionAction" tone={active ? 'brand' : 'body'} align="center">
        {tab.label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
    variants: {
      state: {
        active: {},
        rest: {},
        disabled: { opacity: 0.6 },
      },
    },
  },
}))
