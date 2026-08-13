import { render, screen } from '@testing-library/react-native'

import { Divider } from '@/design-system/primitives/Divider'

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.filter(Boolean).map(flatten))
  }

  return (style ?? {}) as Record<string, unknown>
}

describe('Divider', () => {
  it('renders a label between two rules', async () => {
    await render(<Divider label="Or continue with" />)

    expect(screen.getByText('Or continue with')).toBeTruthy()
    expect(screen.getAllByTestId('divider-rule')).toHaveLength(2)
  })

  it('renders a single rule with no label', async () => {
    await render(<Divider />)

    expect(screen.getAllByTestId('divider-rule')).toHaveLength(1)
  })

  it('gives its rules flex, never a fixed width', async () => {
    // M00-S02 drew each rule at a fixed 93.37pt, which only holds at exactly
    // 390pt wide. Anything else leaves a gap or overlaps the label. `flex` is a
    // base style property, so it survives the Unistyles mock and is assertable.
    await render(<Divider label="Or continue with" />)

    for (const rule of screen.getAllByTestId('divider-rule')) {
      const style = flatten(rule.props.style)

      expect(style.flex).toBe(1)
      expect(style.width).toBeUndefined()
    }
  })
})
