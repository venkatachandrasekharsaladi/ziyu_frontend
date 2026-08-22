import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { ALBUMS_COPY as COPY } from '@/copy/albums'
import { Text } from '@/design-system/primitives/Text'
import type { Album } from '@/sample/albums'

type AlbumCardProps = {
  album: Album
  onPress: (key: string) => void
  /** `grid` is the two-up cell on "Your albums"; `rail` is the home row. */
  layout?: 'grid' | 'rail'
}

/**
 * One album cover — the cell the design repeats six times on "Your albums" and
 * three times in the Memories home rail.
 *
 * The count comes from `album.sampleCount` rather than the list length while
 * the app runs on sample content; see the note in `src/sample/albums.ts`.
 */
export function AlbumCard({ album, onPress, layout = 'grid' }: AlbumCardProps) {
  const { theme } = useUnistyles()

  styles.useVariants({ layout })

  return (
    <Pressable
      onPress={() => onPress(album.key)}
      accessibilityRole="button"
      accessibilityLabel={`${album.label}, ${COPY.list.count(album.sampleCount)}`}
      style={styles.cell}
    >
      <Image
        source={{ uri: album.coverUri }}
        // Plain style object — Unistyles styles do not reach expo-image.
        style={{
          width: '100%',
          height: layout === 'grid' ? 132 : 96,
          borderRadius: theme.radii.field,
          backgroundColor: theme.colors.surface.field,
        }}
        contentFit="cover"
        transition={200}
        testID={`album-cover-${album.key}`}
      />

      <View style={styles.meta}>
        <Text variant="footnote" tone="heading">
          {album.label} {album.emoji}
        </Text>
        <Text variant="caption" tone="body">
          {COPY.list.count(album.sampleCount)}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create((theme) => ({
  cell: {
    gap: theme.spacing.sm,
    variants: {
      layout: {
        grid: { flexBasis: '47%', flexGrow: 1 },
        rail: { width: 116 },
      },
    },
  },
  meta: {
    gap: 2,
  },
}))
