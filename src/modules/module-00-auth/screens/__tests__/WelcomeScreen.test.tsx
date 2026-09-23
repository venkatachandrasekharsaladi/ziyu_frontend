import { screen } from '@testing-library/react-native'

import { WELCOME_COPY } from '@/copy/welcome'
import { lavenderTheme } from '@/design-system/themes/theme'
import { WelcomeScreen } from '@/modules/module-00-auth/screens/WelcomeScreen'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}))

describe('WelcomeScreen', () => {
  it('renders the headline and both calls to action', async () => {
    await renderScreen(<WelcomeScreen />)

    expect(screen.getByText(WELCOME_COPY.headlineLines[0])).toBeTruthy()
    expect(screen.getByRole('button', { name: WELCOME_COPY.primaryCta })).toBeTruthy()
    expect(screen.getByRole('link', { name: WELCOME_COPY.secondaryLink })).toBeTruthy()
  })

  /**
   * `content`, `copyBlock` and `actions` are the three hardcoded numbers this
   * screen used to own outright (480 / 448 / 384). Each is now a distinct
   * `theme.layout.*` token, and each must hold its own fluid contract at both
   * ends of the phone range — a regression that only widened `content` back
   * into a raw pixel value, say, would still pass a single-width render.
   */
  it.each([320, 430])('keeps every content block fluid at a %dpt frame', async (width) => {
    await renderScreen(<WelcomeScreen />, { width })

    const content = screen.getByTestId('welcome-content')
    const copyBlock = screen.getByTestId('welcome-copy-block')
    const actions = screen.getByTestId('welcome-actions')

    expect(content.props.style.width).toBe('100%')
    expect(content.props.style.maxWidth).toBe(lavenderTheme.layout.columnWide)

    expect(copyBlock.props.style.maxWidth).toBe(lavenderTheme.layout.column)

    expect(actions.props.style.width).toBe('100%')
    expect(actions.props.style.maxWidth).toBe(lavenderTheme.layout.columnNarrow)

    // The three roles are genuinely different widths, not the same value
    // renamed three times — columnNarrow < column < columnWide.
    expect(lavenderTheme.layout.columnNarrow).toBeLessThan(lavenderTheme.layout.column)
    expect(lavenderTheme.layout.column).toBeLessThan(lavenderTheme.layout.columnWide)
  })
})
