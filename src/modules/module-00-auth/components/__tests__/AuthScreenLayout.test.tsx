import { screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { lavenderTheme } from '@/design-system/themes/theme'
import { renderScreen } from '@/test/renderScreen'

describe('AuthScreenLayout', () => {
  it('renders its children inside the header and scroll chrome', async () => {
    await renderScreen(
      <AuthScreenLayout>
        <Text>Create your account</Text>
      </AuthScreenLayout>,
    )

    expect(screen.getByText('Create your account')).toBeTruthy()
  })

  // Same contract as `AppScreenLayout`'s column, and the same reason it is
  // tested at both ends of the phone range: `theme.layout.column` (448) is
  // wider than a 320pt phone, so `width: '100%'` — not the cap — is what
  // actually governs there. Only rendering at 430pt would never show that.
  it.each([320, 430])('keeps the content column fluid at a %dpt frame', async (width) => {
    await renderScreen(
      <AuthScreenLayout>
        <Text>Create your account</Text>
      </AuthScreenLayout>,
      { width },
    )

    const column = screen.getByTestId('auth-screen-column')

    expect(column.props.style.width).toBe('100%')
    expect(column.props.style.maxWidth).toBe(lavenderTheme.layout.column)
  })
})
