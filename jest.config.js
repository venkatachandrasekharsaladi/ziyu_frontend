/**
 * JEST CONFIGURATION.
 *
 * Unistyles is a native Nitro module and cannot run under Jest, so the package's
 * own mock is loaded first — it calls `jest.mock` for both
 * `react-native-unistyles` and `react-native-nitro-modules`.
 *
 * ORDER MATTERS. The mock must register before the Unistyles setup runs, because
 * that setup calls `StyleSheet.configure(...)`, and the mock's `configure` is what
 * populates the theme registry that `useUnistyles()` reads back. Reverse the two
 * and every `theme.*` lookup in a component resolves to `undefined`.
 *
 * NOTE: the mock strips `variants` and `compoundVariants`, and `useVariants` is
 * a no-op. Variant style values are therefore NOT assertable in tests — see
 * "Known testing limitation" in docs/superpowers/plans/2026-08-13-auth-cluster.md.
 *
 * TWO PROJECTS, one per theme. The mock cannot switch themes at runtime — see
 * the header of `src/test/unistyles.midnight.ts` — so dark mode is covered by
 * running the SAME suite a second time against a midnight-first registry. Every
 * screen therefore renders in both themes, which is the only way a hardcoded
 * colour or a token that only exists in one theme gets caught.
 *
 * `npx jest` runs both. `npx jest --selectProjects lavender` runs one.
 */
const base = {
  preset: 'jest-expo',
  // Reanimated and its worklets engine are native and cannot initialise under
  // Jest; both need their mocks registered before any component imports them.
  // Belongs in `base` rather than at the root — in a multi-project config the
  // root's setup files do not reach the projects.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
}

module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  // The FIRST test in a screen suite pays the cost of compiling the whole
  // dependency graph — react-hook-form, zod, the icon set — which exceeds Jest's
  // 5s default on a cold cache. Later tests in the same file run in ~100ms.
  //
  // ROOT LEVEL, not inside a project. Jest rejects `testTimeout` in a `projects`
  // entry ("Unknown option") and then silently falls back to 5s, which fails
  // every slow screen suite for a reason the output does not name.
  testTimeout: 30_000,
  projects: [
    {
      ...base,
      displayName: 'lavender',
      setupFiles: [
        'react-native-unistyles/mocks',
        '<rootDir>/src/design-system/themes/unistyles.ts',
      ],
    },
    {
      ...base,
      displayName: 'midnight',
      setupFiles: ['react-native-unistyles/mocks', '<rootDir>/src/test/unistyles.midnight.ts'],
    },
  ],
}
