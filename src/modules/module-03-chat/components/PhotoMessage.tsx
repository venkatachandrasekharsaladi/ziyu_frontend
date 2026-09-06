import { Image } from 'expo-image'
import { useWindowDimensions } from 'react-native'
import { useUnistyles } from 'react-native-unistyles'

/**
 * The widest a photo bubble is ever drawn, however wide the device is.
 *
 * Past roughly this, a photo stops reading as an inline message and starts
 * reading as a gallery item — and on a tablet the thread is already capped at
 * `layout.column` anyway, so without a cap the image would just grow to fill
 * a column that exists to stop exactly that.
 */
const MAX_PHOTO_WIDTH = 280

type Props = {
  uri: string
  /**
   * A formatted clock reading (`MessageBubble`'s own `clockTime(sentAt)`),
   * folded into the accessible name so two photo messages in the same
   * thread — a captionless photo is the normal path, and nothing else about
   * a bare image differs — don't share one fixed "Photo" name. Optional: a
   * bare unit render with no message behind it keeps the plain name.
   */
  time?: string
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
export function PhotoMessage({ uri, time }: Props) {
  const { theme } = useUnistyles()
  const { width: windowWidth } = useWindowDimensions()

  /*
   * WHY THIS IS COMPUTED AND NOT A CONSTANT.
   *
   * This was `width: 220`, a number copied off the 390pt frame — and at 390
   * it happens to fit. It does not fit a 320pt phone: `MessageBubble` caps a
   * row at `maxWidth: '76%'` and the bubble adds `spacing.lg` of padding
   * either side, so the room a photo actually has is
   *
   *     0.76 × contentWidth − 2 × spacing.lg
   *
   * which at 320pt is ~211pt. A fixed 220 overflowed its own bubble by ~9pt
   * on every small Android in the target market, and on a 430pt Pro Max it
   * left ~75pt of bubble unused. Deriving it from the same two numbers the
   * bubble itself uses means the photo cannot disagree with its container.
   *
   * `contentWidth` clamps to `layout.column` rather than using the raw window:
   * on a tablet `AppScreenLayout` already centres the thread inside that
   * column, so the window width is not the width this photo lives in.
   */
  const contentWidth = Math.min(windowWidth, theme.layout.column)
  const width = Math.min(MAX_PHOTO_WIDTH, contentWidth * 0.76 - theme.spacing.lg * 2)

  return (
    <Image
      source={{ uri }}
      // Plain style object — Unistyles styles do not reach expo-image (see
      // `PhotoCarousel.tsx` / `AlbumCard.tsx`).
      style={{
        width,
        aspectRatio: 4 / 3,
        borderRadius: theme.radii.panel,
        backgroundColor: theme.colors.surface.field,
      }}
      contentFit="cover"
      accessibilityLabel={time ? `Photo, sent at ${time}` : 'Photo'}
      transition={150}
    />
  )
}
