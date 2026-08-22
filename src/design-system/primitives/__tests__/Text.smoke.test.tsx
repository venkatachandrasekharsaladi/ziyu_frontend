import { render, screen } from '@testing-library/react-native'

import { Text } from '@/design-system/primitives/Text'

/**
 * Harness smoke test.
 *
 * Proves the Unistyles + Jest path works before the rest of the cluster depends
 * on it: the Nitro module is mocked, the theme registry is configured, and the
 * `@/` alias resolves. If this fails, nothing else in the suite is trustworthy.
 */
describe('test harness', () => {
  // NOTE: `render` is ASYNC in @testing-library/react-native v14 and must be
  // awaited. Without the await, `screen` is still the default stub and every
  // query throws "`render` function has not been called".
  it('renders a Unistyles-styled primitive without touching native code', async () => {
    await render(<Text variant="body">Harness is alive</Text>)

    expect(screen.getByText('Harness is alive')).toBeTruthy()
  })

  it('resolves theme values through the Unistyles mock', async () => {
    // If `setupFiles` ordering were wrong, the theme registry would be empty and
    // `theme.typography.body` inside Text would be undefined, throwing here.
    await render(<Text variant="caption" tone="brand">Themed</Text>)

    expect(screen.getByText('Themed')).toBeTruthy()
  })
})
