import { screen } from '@testing-library/react-native'

import { COMPATIBILITY_COPY as COPY } from '@/copy/compatibility'
import { CompatibilityScreen } from '@/modules/module-02-home/screens/CompatibilityScreen'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/sample', () => ({
  ...jest.requireActual('@/sample'),
  USE_SAMPLE_CONTENT: false,
}))

/**
 * There is no genuine version of this screen — see its header comment. With
 * the switch off it has nothing to show, which is the point of this file.
 */
describe('Compatibility screen — no sample content', () => {
  it('states nothing about anyone', async () => {
    await renderScreen(<CompatibilityScreen />)

    expect(screen.queryByText(COPY.factsHeading)).toBeNull()
    expect(screen.queryByText(COPY.togetherHeading)).toBeNull()
  })
})
