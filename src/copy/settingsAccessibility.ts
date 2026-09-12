/**
 * Copy for Settings → Accessibility.
 *
 * Reduce motion earns its own row rather than hiding under Appearance: this app
 * animates screen entrances, row presses, the days-together counter and every
 * chat bubble, and someone who needs that to stop needs to find it by looking
 * for the word "motion".
 */
export const SETTINGS_ACCESSIBILITY_COPY = {
  title: 'Accessibility',
  lede: 'Make the app easier to read and easier on the eyes.',

  displayGroup: 'Display',
  textSizeLabel: 'Text size',
  textSmall: 'Small',
  textDefault: 'Default',
  textLarge: 'Large',
  highContrastLabel: 'Higher contrast',
  highContrastDetail: 'Stronger borders and deeper text colours.',

  motionGroup: 'Motion & feedback',
  reduceMotionLabel: 'Reduce motion',
  reduceMotionDetail: 'Turns off screen and list animations.',
  hapticsLabel: 'Haptics',
  hapticsDetail: 'A small vibration when something is confirmed.',
} as const
