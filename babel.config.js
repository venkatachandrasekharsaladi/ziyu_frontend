/**
 * Babel configuration.
 *
 * The Unistyles plugin is MANDATORY — without it `StyleSheet.create` is not
 * transformed and styles silently fail to react to theme changes. `root` must
 * point at the directory holding app source.
 *
 * The worklets plugin must stay LAST. Reanimated 4 moved its Babel plugin out
 * of `react-native-reanimated/plugin` and into `react-native-worklets/plugin`.
 */
module.exports = function (api) {
  api.cache(true)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-native-unistyles/plugin', { root: 'src' }],
      'react-native-worklets/plugin',
    ],
  }
}
