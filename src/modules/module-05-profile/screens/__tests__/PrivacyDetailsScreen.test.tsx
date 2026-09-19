import { screen } from '@testing-library/react-native'

import { PRIVACY_PILLARS, SPACE_PRIVACY_COPY as COPY } from '@/copy/spacePrivacy'
import { PrivacyDetailsScreen } from '@/modules/module-05-profile/screens/PrivacyDetailsScreen'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('PrivacyDetailsScreen', () => {
  it('leads with the promise', async () => {
    await renderScreen(<PrivacyDetailsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
  })

  it('makes all four promises, in the order the frame makes them', async () => {
    await renderScreen(<PrivacyDetailsScreen />)

    expect(PRIVACY_PILLARS).toHaveLength(4)
    for (const pillar of PRIVACY_PILLARS) {
      expect(screen.getByText(pillar.title)).toBeTruthy()
      expect(screen.getByText(pillar.body)).toBeTruthy()
    }
  })

  // The claims are quoted from the frame rather than paraphrased, because
  // someone will hold the product to them.
  it('states the encryption claim verbatim', async () => {
    await renderScreen(<PrivacyDetailsScreen />)

    expect(
      screen.getByText(/Every interaction is an encrypted thread between you two/),
    ).toBeTruthy()
  })

  it('signs off with the footer chip', async () => {
    await renderScreen(<PrivacyDetailsScreen />)

    expect(screen.getByText(COPY.footer)).toBeTruthy()
  })
})
