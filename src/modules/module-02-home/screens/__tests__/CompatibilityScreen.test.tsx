import { screen } from '@testing-library/react-native'

import { COMPATIBILITY_COPY as COPY } from '@/copy/compatibility'
import { CompatibilityScreen } from '@/modules/module-02-home/screens/CompatibilityScreen'
import { SAMPLE_HOME } from '@/sample/home'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}))

describe('Compatibility screen', () => {
  it('shows both names, birthdays and signs', async () => {
    await renderScreen(<CompatibilityScreen />)

    const { you, partner } = SAMPLE_HOME.compatibility

    expect(screen.getByText(you.name)).toBeTruthy()
    expect(screen.getByText(partner.name)).toBeTruthy()
    // 2001-07-14 -> Cancer, 2004-12-18 -> Sagittarius.
    expect(screen.getByText('Cancer')).toBeTruthy()
    expect(screen.getByText('Sagittarius')).toBeTruthy()
  })

  it('only ever states positive traits', async () => {
    await renderScreen(<CompatibilityScreen />)

    expect(screen.getByText(COPY.factsHeading)).toBeTruthy()
    expect(screen.getByText(COPY.togetherHeading)).toBeTruthy()
    expect(screen.getByText(COPY.detailsHeading)).toBeTruthy()
  })
})
