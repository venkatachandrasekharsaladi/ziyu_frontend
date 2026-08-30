import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

type Props = {
  uri: string
  onSend: (uri: string, caption: string) => void
  onCancel: () => void
}

/**
 * The full-screen "about to send this" preview — Figma `Ziyu`'s photo-share
 * step. Covers the whole conversation rather than sitting in its flex layout
 * (`StyleSheet.absoluteFillObject`), the same way `PhotoLightbox` covers the
 * screen to VIEW a photo — this is the same idea for SENDING one.
 *
 * Owns its own caption text and nothing else: no `useChatStore` import here
 * (this module's components take props in, callbacks out) — `onSend` hands
 * `(uri, caption)` back to whichever screen supplied `uri`.
 */
export function PhotoSharePreview({ uri, onSend, onCancel }: Props) {
  const { theme } = useUnistyles()
  const [caption, setCaption] = useState('')

  return (
    <View style={styles.layer}>
      <Image
        source={{ uri }}
        // Plain style object — Unistyles styles do not reach expo-image (see
        // `PhotoCarousel.tsx` / `AlbumCard.tsx`).
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        testID="photo-preview-image"
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel photo"
          style={styles.round}
        >
          <Feather name="x" size={20} color={theme.colors.text.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.bottomBar}>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Add a caption…"
          placeholderTextColor={theme.colors.text.placeholder}
          accessibilityLabel="Caption"
          style={styles.input}
        />

        <Pressable
          onPress={() => onSend(uri, caption)}
          accessibilityRole="button"
          accessibilityLabel="Send photo"
          style={styles.send}
        >
          <Feather name="arrow-up" size={20} color={theme.colors.chat.onAccent} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  layer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface.page,
    // Above the thread, composer, and either long-press overlay — this is a
    // full-screen step of its own, not something those should show through.
    zIndex: 20,
  },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Translucent-on-photo is the whole point of reaching for `scrim` here
    // rather than a solid surface token — a solid circle would read as a
    // stray chip floating over someone's photo.
    backgroundColor: theme.colors.surface.scrim,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.card,
    ...theme.typography.body,
    color: theme.colors.text.body,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.chat.accent,
  },
}))
