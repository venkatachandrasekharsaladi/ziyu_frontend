import { render, screen } from '@testing-library/react-native'

import { Text, type TextTone, type TextVariant } from '@/design-system/primitives/Text'

const VARIANTS: TextVariant[] = [
  'h1',
  'h2',
  'h3',
  'wordmark',
  'body',
  'label',
  'labelStrong',
  'footnote',
  'caption',
  'captionAction',
  'tabLabel',
  'countdown',
]

const TONES: TextTone[] = [
  'heading',
  'body',
  'placeholder',
  'muted',
  'brand',
  'link',
  'error',
  'success',
  'onPrimary',
]

describe('Text', () => {
  it.each(VARIANTS)('renders the %s variant', async (variant) => {
    await render(<Text variant={variant}>Content</Text>)

    expect(screen.getByText('Content')).toBeTruthy()
  })

  it.each(TONES)('renders the %s tone', async (tone) => {
    await render(<Text tone={tone}>Content</Text>)

    expect(screen.getByText('Content')).toBeTruthy()
  })

  it('forwards accessibilityRole, so an inline link can be a link', async () => {
    await render(
      <Text>
        Prompt{' '}
        <Text tone="brand" accessibilityRole="link">
          Act
        </Text>
      </Text>,
    )

    expect(screen.getByRole('link')).toBeTruthy()
  })

  it('nests for mixed-style lines without needing a style prop', async () => {
    // This is the mechanism the footer prompts use. No new API is required:
    // TextProps is Omit<RNTextProps, 'style'>, so onPress and accessibilityRole
    // already pass through, and RN handles style inheritance on nested Text.
    await render(
      <Text variant="label" tone="body">
        New here?{' '}
        <Text variant="label" tone="brand">
          Create an account
        </Text>
      </Text>,
    )

    expect(screen.getByText(/New here\?/)).toBeTruthy()
    expect(screen.getByText('Create an account')).toBeTruthy()
  })
})
