/**
 * JEST CONFIGURATION.
 *
 * Unistyles is a native Nitro module and cannot run under Jest, so the package's
 * own mock is loaded first — it calls `jest.mock` for both
 * `react-native-unistyles` and `react-native-nitro-modules`.
 *
 * ORDER MATTERS. The mock must register before `themes/unistyles` runs, because
 * that file calls `StyleSheet.configure(...)`, and the mock's `configure` is what
 * populates the theme registry that `useUnistyles()` reads back. Reverse the two
 * and every `theme.*` lookup in a component resolves to `undefined`.
 *
 * NOTE: the mock strips `variants` and `compoundVariants`, and `useVariants` is
 * a no-op. Variant style values are therefore NOT assertable in tests — see
 * "Known testing limitation" in docs/superpowers/plans/2026-08-13-auth-cluster.md.
 */
module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    'react-native-unistyles/mocks',
    '<rootDir>/src/design-system/themes/unistyles.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
}
