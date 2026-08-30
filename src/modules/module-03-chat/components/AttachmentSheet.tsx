import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type Props = {
  onPickPhoto: () => void
  onClose: () => void
}

/**
 * The attachment sheet — Figma `Ziyu` 3390:384. A 342pt-tall two-column grid
 * of four tiles: Photo, Camera, Voice note, Memory.
 *
 * Only "Photo" wires to real behaviour in this task — `onPickPhoto` stages
 * the mock picker (`ConversationScreen` calls `stagePhoto` with a placeholder
 * uri; real `expo-image-picker` is a follow-up, see the comment there).
 * Camera capture, voice-note-from-this-sheet, and the memories bridge have no
 * feature behind them yet, so pressing those three just dismisses the sheet —
 * the same "no design yet, don't fake it" call `ChatHeader`'s `onMore` and
 * `ReactionBar`'s `onMore` make elsewhere in this module.
 */
export function AttachmentSheet({ onPickPhoto, onClose }: Props) {
  const { theme } = useUnistyles()

  const tiles = [
    // `accessibilityLabel` diverges from the visible text on THIS tile only.
    // `PhotoMessage` (this task's other half) carries `accessibilityLabel=
    // "Photo"` on a photo bubble, and having both mounted at once — this
    // sheet open over a thread that already contains a photo message — would
    // make `getByLabelText('Photo')` ambiguous, which breaks Task 14's
    // end-to-end test. The visible text stays "Photo" (the brief's own test
    // presses `getByText('Photo')`); only the accessible name moves.
    { label: 'Photo', accessibilityLabel: 'Choose photo', icon: 'image', onPress: onPickPhoto },
    { label: 'Camera', accessibilityLabel: 'Camera', icon: 'camera', onPress: onClose },
    { label: 'Voice note', accessibilityLabel: 'Voice note', icon: 'mic', onPress: onClose },
    { label: 'Memory', accessibilityLabel: 'Memory', icon: 'bookmark', onPress: onClose },
  ] as const

  return (
    <View style={styles.sheet}>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.label}
            onPress={tile.onPress}
            accessibilityRole="button"
            accessibilityLabel={tile.accessibilityLabel}
            style={styles.tile}
          >
            <View style={styles.iconWell}>
              <Feather name={tile.icon} size={22} color={theme.colors.chat.accent} />
            </View>
            {/* `heading` — a card row label, same ink `MessageContextMenu`
                reaches for on this same `surface.card` fill. */}
            <Text variant="label" tone="heading">
              {tile.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  sheet: {
    height: 342,
    width: '100%',
    backgroundColor: theme.colors.surface.page,
    borderTopLeftRadius: theme.radii.panel,
    borderTopRightRadius: theme.radii.panel,
    padding: theme.spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radii.tile,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
  },
  iconWell: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chat.accentSoft,
  },
}))
