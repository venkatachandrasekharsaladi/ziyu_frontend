import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import type { SharedMapProps } from '@/modules/module-06-plans/components/SharedMap'

/**
 * The WEB half of the platform split. Metro picks this file for
 * `expo export --platform web`; the native `SharedMap.tsx` beside it is picked
 * for iOS and Android.
 *
 * WHY A STAND-IN RATHER THAN A WEB MAP. `expo-maps` has no web implementation,
 * so the choice here was to add a second mapping library (Leaflet, Google Maps
 * JS) purely for the web build — a second API key, a second set of tiles, a
 * second thing to keep in sync with the native map's behaviour — or to render
 * the one thing the web build actually needs: the couple's positions, legibly,
 * without pretending to be a map.
 *
 * It draws the pins it was given rather than a picture of a map, so it stays
 * TRUE as the data changes. If a web map is wanted later, this file is the only
 * one that has to change; `SharedPlacesScreen` never learns which half it got.
 */
export function SharedMap({ pins, accessibilityLabel }: SharedMapProps) {
  const { theme } = useUnistyles()

  return (
    <View style={styles.wrap} accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.head}>
        <Feather name="map" size={14} color={theme.colors.brand.primary} />

        <Text variant="caption" tone="placeholder">
          Live positions
        </Text>
      </View>

      <View style={styles.pins}>
        {pins.map((pin) => (
          <View key={pin.id} style={styles.pin}>
            <View style={styles.dot}>
              <Feather name="map-pin" size={12} color={theme.colors.text.onPrimary} />
            </View>

            <View style={styles.pinFill}>
              <Text variant="footnote" tone="heading">
                {pin.title}
              </Text>

              {pin.snippet ? (
                <Text variant="countdown" tone="placeholder">
                  {pin.snippet}
                </Text>
              ) : null}

              <Text variant="countdown" tone="placeholder">
                {`${pin.coordinate.latitude.toFixed(4)}, ${pin.coordinate.longitude.toFixed(4)}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  wrap: {
    minHeight: 260,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.panel,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border.field,
    backgroundColor: theme.colors.surface.field,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pins: {
    gap: theme.spacing.md,
  },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.card,
  },
  dot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.brand.primary,
  },
  pinFill: {
    flex: 1,
    gap: 2,
  },
}))
