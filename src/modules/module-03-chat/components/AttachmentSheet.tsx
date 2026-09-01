import { Feather } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type Props = {
  onPickPhoto: () => void
  /** Starts the real voice-note recorder (`chatStore.startRecording`) and closes this sheet. */
  onVoiceNote: () => void
  /** Navigates to the Memories module (`/(app)/memories`) and closes this sheet. */
  onMemory: () => void
  onClose: () => void
}

/**
 * The attachment sheet — Figma `Ziyu` 3390:384. A 342pt-tall two-column grid
 * of four tiles: Photo, Camera, Voice note, Memory.
 *
 * Three of the four tiles wire to real behaviour: `onPickPhoto` stages the
 * mock picker (`ConversationScreen` calls `stagePhoto` with a placeholder
 * uri; real `expo-image-picker` is a follow-up, see the comment there),
 * `onVoiceNote` hands off to the recorder the store already has
 * (`chatStore.startRecording`), and `onMemory` is the bridge into the
 * Memories module. Camera capture is the one tile with nothing behind it —
 * it needs `expo-image-picker`/`expo-camera`, neither installed — so it is
 * rendered `disabled` rather than dismissing the sheet like a working tile
 * would: a control that looks pressable and silently does nothing is worse
 * than one that visibly is not available yet, same call `SocialButton` makes
 * for OAuth.
 */
export function AttachmentSheet({ onPickPhoto, onVoiceNote, onMemory, onClose }: Props) {
  const tiles = [
    // `accessibilityLabel` diverges from the visible text on THIS tile only.
    // `PhotoMessage` (this task's other half) carries `accessibilityLabel=
    // "Photo"` on a photo bubble, and having both mounted at once — this
    // sheet open over a thread that already contains a photo message — would
    // make `getByLabelText('Photo')` ambiguous, which breaks Task 14's
    // end-to-end test. The visible text stays "Photo" (the brief's own test
    // presses `getByText('Photo')`); only the accessible name moves.
    {
      label: 'Photo',
      accessibilityLabel: 'Choose photo',
      icon: 'image',
      onPress: onPickPhoto,
      disabled: false,
    },
    {
      label: 'Camera',
      accessibilityLabel: 'Camera',
      icon: 'camera',
      onPress: onClose,
      disabled: true,
    },
    {
      label: 'Voice note',
      accessibilityLabel: 'Voice note',
      icon: 'mic',
      onPress: onVoiceNote,
      disabled: false,
    },
    {
      label: 'Memory',
      accessibilityLabel: 'Memory',
      icon: 'bookmark',
      onPress: onMemory,
      disabled: false,
    },
  ] as const

  return (
    <View style={styles.sheet}>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <Tile key={tile.label} {...tile} />
        ))}
      </View>
    </View>
  )
}

type TileProps = {
  label: string
  accessibilityLabel: string
  icon: React.ComponentProps<typeof Feather>['name']
  onPress: () => void
  disabled: boolean
}

/**
 * One tile, split out (rather than mapped inline) for the same reason
 * `BottomNav`'s `NavItem` is: `styles.useVariants` reads and sets the variant
 * for the CURRENT render of the component instance that calls it. Calling it
 * once per iteration inside a shared `.map()` — instead of once per component
 * instance — would apply whichever tile's variant happened to run last to
 * every tile's `style={styles.tile}` lookup, since they would all be sharing
 * one call site instead of one each.
 */
function Tile({ label, accessibilityLabel, icon, onPress, disabled }: TileProps) {
  const { theme } = useUnistyles()

  styles.useVariants({ disabled })

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={styles.tile}
    >
      <View style={styles.iconWell}>
        <Feather name={icon} size={22} color={disabled ? theme.colors.border.field : theme.colors.chat.accent} />
      </View>
      {/* `heading` — a card row label, same ink `MessageContextMenu` reaches
          for on this same `surface.card` fill. `muted` when disabled, same as
          `BottomNav`'s own not-yet-built tabs. */}
      <Text variant="label" tone={disabled ? 'muted' : 'heading'}>
        {label}
      </Text>
    </Pressable>
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
    variants: {
      // Same 0.6 dimming `BottomNav` uses for a tab whose destination is not
      // built yet — one "not available" look, reused everywhere it applies.
      disabled: {
        true: { opacity: 0.6 },
        false: {},
      },
    },
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
