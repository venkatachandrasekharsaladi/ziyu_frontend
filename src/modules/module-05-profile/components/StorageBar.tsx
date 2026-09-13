import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import type { StorageSlice } from '@/modules/module-05-profile/data/mock'

type StorageBarProps = {
  slices: StorageSlice[]
  totalBytes: number
}

/**
 * One bar, divided in proportion to what is using the space.
 *
 * Colours come from `theme.colors.accents`, the palette the app already uses
 * for categorical fills, so this reads as part of the same system in both
 * themes rather than four colours invented here. Each accent is a `soft`/`ink`
 * pair; a segment takes the `ink` half, because the tints are close enough to
 * each other and to `surface.field` that a bar built from them would read as
 * one undivided bar.
 *
 * Hidden from the accessibility tree: it is a second rendering of the numbers
 * listed directly underneath, and announcing "image" four times adds nothing a
 * screen reader user cannot already hear.
 */
export function StorageBar({ slices, totalBytes }: StorageBarProps) {
  const { theme } = useUnistyles()
  const accents = theme.colors.accents

  return (
    <View style={styles.bar} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {slices.map((slice, index) => (
        <View
          key={slice.key}
          style={{
            flex: totalBytes > 0 ? slice.bytes / totalBytes : 1,
            backgroundColor: accents[index % accents.length].ink,
          }}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.field,
  },
}))
