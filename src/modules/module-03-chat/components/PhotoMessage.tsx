import { Image } from 'expo-image'
import { useUnistyles } from 'react-native-unistyles'

type Props = {
  uri: string
}

/**
 * The photo variant of a message bubble — Figma `Ziyu` 3390:665 (photo
 * state). `MessageBubble` swaps this in for the text body when
 * `message.kind === 'photo'`; the bubble itself still supplies the row
 * layout, reactions, and meta row around it.
 *
 * A fixed 4:3 `aspectRatio` (rather than the source image's real one) keeps
 * every photo bubble a predictable shape in the thread — `Message` carries
 * only a `mediaUri` string (`services/chat/types.ts`), no width or height, so
 * there is nothing else to preserve it FROM.
 */
export function PhotoMessage({ uri }: Props) {
  const { theme } = useUnistyles()

  return (
    <Image
      source={{ uri }}
      // Plain style object — Unistyles styles do not reach expo-image (see
      // `PhotoCarousel.tsx` / `AlbumCard.tsx`).
      style={{
        width: 220,
        aspectRatio: 4 / 3,
        borderRadius: theme.radii.panel,
        backgroundColor: theme.colors.surface.field,
      }}
      contentFit="cover"
      accessibilityLabel="Photo"
      transition={150}
    />
  )
}
