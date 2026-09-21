import { AppleMaps, GoogleMaps } from 'expo-maps'
import { Platform, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import type { Coordinate } from '@/services/plans/types'

export type MapPin = {
  id: string
  coordinate: Coordinate
  title: string
  snippet?: string
}

export type SharedMapProps = {
  /** Where the camera sits. Usually the midpoint between the two of them. */
  center: Coordinate
  zoom?: number
  pins: MapPin[]
  /** Announced to screen readers, which cannot see a map at all. */
  accessibilityLabel: string
}

/**
 * The map behind "Where we are" — Figma 3482:2499.
 *
 * PLATFORM-SPLIT, and this is the native half. `expo-maps` ships no web build at
 * all (there is no `.web.js` in the package), so importing it into a web bundle
 * throws at module load rather than degrading. `SharedMap.web.tsx` beside this
 * file is what Metro resolves for `expo export --platform web`, which this
 * project runs on every deploy — see `predeploy` in package.json.
 *
 * APPLE ON iOS, GOOGLE EVERYWHERE ELSE. `expo-maps` deliberately does not
 * abstract the two, because they are genuinely different SDKs with different
 * props. The split is here so no screen has to know that.
 *
 * NEEDS A DEV CLIENT — `expo-maps` is native, so Expo Go cannot render this.
 * Google Maps on Android additionally needs an API key in `app.json` before the
 * tiles load; without one the view renders as an empty grey grid, which is a
 * configuration gap and not a bug in this file.
 */
export function SharedMap({ center, zoom = 14, pins, accessibilityLabel }: SharedMapProps) {
  const camera = {
    coordinates: { latitude: center.latitude, longitude: center.longitude },
    zoom,
  }

  return (
    <View style={styles.wrap} accessible accessibilityLabel={accessibilityLabel}>
      {Platform.OS === 'ios' ? (
        <AppleMaps.View
          style={styles.map}
          cameraPosition={camera}
          markers={pins.map((pin) => ({
            id: pin.id,
            coordinates: pin.coordinate,
            title: pin.title,
            // Apple's marker calls the secondary line `systemImage`-adjacent
            // `snippet`, same as Google's — the shapes agree here.
            snippet: pin.snippet,
          }))}
        />
      ) : (
        <GoogleMaps.View
          style={styles.map}
          cameraPosition={camera}
          markers={pins.map((pin) => ({
            id: pin.id,
            coordinates: pin.coordinate,
            title: pin.title,
            snippet: pin.snippet,
          }))}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    height: 260,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface.soft,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
}))
