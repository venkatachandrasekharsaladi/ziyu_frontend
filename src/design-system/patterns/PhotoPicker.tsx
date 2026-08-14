import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Avatar } from '@/design-system/primitives/Avatar'
import { Text } from '@/design-system/primitives/Text'

type PhotoPickerProps = {
  /** Also the accessible name of the control. */
  label: string
  /** Used for the initials fallback. */
  name: string
  uri?: string | null
  onPick: () => void
}

/**
 * A circular photo well with an add affordance.
 *
 * Takes an `onPick` callback rather than owning the picker: `expo-image-picker`
 * is scheduled for Phase 6 in `INSTALL-PLAN.md`, so the layout is real now and
 * the wiring lands with the library. The screen supplies a stub until then.
 */
export function PhotoPicker({ label, name, uri, onPick }: PhotoPickerProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPick}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.well}
      >
        <Avatar size={96} name={name} uri={uri} />

        <View style={styles.badge}>
          <Feather name="camera" size={16} color={theme.colors.text.onPrimary} />
        </View>
      </Pressable>

      <Text variant="caption" tone="body">
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    width: '100%',
  },
  well: {
    width: 96,
    height: 96,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface.page,
  },
}))
