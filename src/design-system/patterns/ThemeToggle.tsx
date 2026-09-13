import { Feather } from '@expo/vector-icons'
import { useUnistyles } from 'react-native-unistyles'

import { APPEARANCE_COPY as COPY } from '@/copy/appearance'
import { Button } from '@/design-system/primitives/Button'
import { useThemeMode } from '@/design-system/themes/useThemeMode'

/**
 * The control that switches the app between lavender and midnight.
 *
 * Deliberately propless and self-contained: it reads the active theme itself
 * and needs nothing from whatever renders it. Moving it — to a header, a
 * settings row, a modal — is moving one line, which is the point, because the
 * settings hub it currently sits in (`OurSpaceScreen`) is still a stub and this
 * is not its final home.
 *
 * Built on `Button` rather than a bespoke pressable. That primitive's own doc
 * calls itself "the only button in the app" and it already owns the control
 * height, the label variant and the double-tap guard; a second one here would
 * be a second set of all three.
 *
 * `variant="outline"` on purpose. `primary` would make changing the theme the
 * loudest thing on a screen whose actual job is elsewhere.
 */
export function ThemeToggle() {
  const { theme } = useUnistyles()
  const { isDark, toggle } = useThemeMode()

  return (
    <Button
      label={isDark ? COPY.toLight : COPY.toDark}
      onPress={toggle}
      variant="outline"
      trailing={
        <Feather
          name={isDark ? 'sun' : 'moon'}
          size={18}
          color={theme.colors.brand.primary}
          // The label already says which way this goes; the glyph repeating it
          // would just be read out twice.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      }
    />
  )
}
