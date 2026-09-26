import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useCallback, useState } from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { COVER_PHOTO_COPY } from '@/copy/coverPhoto'
import { Divider } from '@/design-system/primitives/Divider'
import { Text } from '@/design-system/primitives/Text'
import { IconButton } from '@/design-system/patterns/IconButton'
import { Overlay } from '@/design-system/patterns/Overlay'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { usePhotoPick } from '@/hooks/usePhotoPick'
import { curatedCoverChoices } from '@/services/media/coverPhotoSuggestions'

/**
 * Fills the parent, as a PLAIN object — `expo-image` never sees a Unistyles
 * `StyleSheet.create` entry. See `expoImageStyles.test.ts`.
 */
const IMAGE_FILL = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const

/** Plain object, on purpose — see the note where this is used. */
const CURATED_THUMB_SIZE = { width: 96, height: 72 } as const

type CoverPhotoFieldProps = {
  /** The current cover, or `null` for the "add a photo" empty state. */
  uri: string | null
  onChange: (uri: string) => void
  /** Passed straight to the native picker's crop step. Matches the card. */
  aspect?: [number, number]
  testID?: string
}

/**
 * A plan's cover photo, with the "change it" affordance built in.
 *
 * RENDERS NO WRAPPER OF ITS OWN — this is a fragment of absolutely-positioned
 * layers (the photo, the edit badge) meant to sit inside a caller's own
 * `position: 'relative'` hero box, alongside whatever scrim and text that
 * hero already draws over its photo. That is what lets `TripItineraryScreen`
 * and `PlansHubScreen` adopt this without restructuring their own layout.
 *
 * THREE WAYS TO SET A COVER: a curated pick (`services/media/
 * coverPhotoSuggestions` — hand-verified photos, not a keyword guess, see
 * that file's header for why), the device photo library, or the camera —
 * both real, via `usePhotoPick`. `aspect` is handed to the native picker's
 * own crop step (`allowsEditing`), so "fit to the card" is the OS's crop UI,
 * not a hand-rolled one.
 */
export function CoverPhotoField({ uri, onChange, aspect = [16, 10], testID }: CoverPhotoFieldProps) {
  const { theme } = useUnistyles()
  const [sheetOpen, setSheetOpen] = useState(false)

  const openSheet = useCallback(() => setSheetOpen(true), [])
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  const choose = useCallback(
    (nextUri: string) => {
      onChange(nextUri)
      closeSheet()
    },
    [onChange, closeSheet],
  )

  const { pick, capture, error, clearError, busy } = usePhotoPick(choose, {
    allowsEditing: true,
    aspect,
  })

  return (
    <>
      {uri ? (
        <Image
          source={{ uri }}
          style={IMAGE_FILL}
          contentFit="cover"
          transition={200}
          testID={testID}
        />
      ) : (
        <View style={[IMAGE_FILL, styles.empty]} testID={testID}>
          <Feather name="image" size={28} color={theme.colors.text.placeholder} />
          <Text variant="footnote" tone="muted">
            {COVER_PHOTO_COPY.emptyLabel}
          </Text>
        </View>
      )}

      <View style={styles.editBadge}>
        <IconButton
          icon="camera"
          label={COVER_PHOTO_COPY.editLabel}
          onPress={openSheet}
          tone="onMedia"
          testID={testID ? `${testID}-edit` : undefined}
        />
      </View>

      {sheetOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeSheet}>
          <Overlay onDismiss={closeSheet} dismissLabel={COVER_PHOTO_COPY.cancel} align="bottom">
            <View
              style={styles.sheet}
              accessibilityRole="alert"
              accessibilityViewIsModal
              testID={testID ? `${testID}-sheet` : undefined}
            >
              <Text variant="h3" tone="heading">
                {COVER_PHOTO_COPY.sheetTitle}
              </Text>

              <Text variant="footnote" tone="body">
                {COVER_PHOTO_COPY.curatedHeading}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.curatedRow}>
                  {curatedCoverChoices(300, 200).map((choice) => (
                    <Pressable
                      key={choice.key}
                      onPress={() => choose(choice.uri)}
                      accessibilityRole="button"
                      accessibilityLabel={choice.key}
                      testID={`${testID ?? 'cover-photo'}-choice-${choice.key}`}
                      style={styles.curatedThumbWell}
                    >
                      {/* `expo-image` never receives a Unistyles style — see
                          `expoImageStyles.test.ts`. Size lives here, as a
                          plain object; the visible radius/border are the
                          wrapping `Pressable`'s, via `curatedThumbWell`. */}
                      <Image source={{ uri: choice.uri }} style={CURATED_THUMB_SIZE} contentFit="cover" />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Divider />

              <SettingsRow
                icon="image"
                label={COVER_PHOTO_COPY.libraryRow}
                onPress={busy ? undefined : pick}
                testID={testID ? `${testID}-library` : undefined}
              />
              <SettingsRow
                icon="camera"
                label={COVER_PHOTO_COPY.cameraRow}
                onPress={busy ? undefined : capture}
                testID={testID ? `${testID}-camera` : undefined}
              />

              {error ? (
                <Pressable onPress={clearError} accessibilityRole="button" accessibilityLabel={error}>
                  <Text variant="footnote" tone="error">
                    {error}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Overlay>
        </Modal>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create((theme) => ({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface.field,
  },
  editBadge: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    // A caller's own hero text (e.g. `TripItineraryScreen`'s title/subtitle
    // block) is ordinary flow, not absolutely positioned, and paints AFTER
    // this badge purely because it comes later in the caller's JSX — which
    // on web makes its full-width, invisible-but-live box swallow the
    // badge's taps even though only its text glyphs are visually there. A
    // fixed `zIndex` keeps the badge tappable regardless of sibling order in
    // whichever hero adopts this field.
    zIndex: 2,
    boxShadow: theme.elevation.control,
    borderRadius: theme.radii.pill,
  },
  sheet: {
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: theme.layout.column,
    alignSelf: 'center',
    padding: theme.spacing.xl,
    borderTopLeftRadius: theme.radii.panel,
    borderTopRightRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.held,
  },
  curatedRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  // The Image itself only ever gets `CURATED_THUMB_SIZE`, a plain object —
  // this wrapper carries the radius/border/clip, none of which expo-image
  // would honour either.
  curatedThumbWell: {
    borderRadius: theme.radii.field,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
}))
