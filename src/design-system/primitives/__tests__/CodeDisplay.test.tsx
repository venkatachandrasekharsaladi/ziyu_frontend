import { render, screen } from '@testing-library/react-native'

import { CodeDisplay, formatCode } from '@/design-system/primitives/CodeDisplay'

describe('formatCode', () => {
  it('splits six characters into two groups', () => {
    expect(formatCode('L8V7QK')).toBe('L8V · 7QK')
  })

  it('leaves a short code alone rather than inventing a separator', () => {
    expect(formatCode('L8V')).toBe('L8V')
  })

  it('uppercases', () => {
    expect(formatCode('l8v7qk')).toBe('L8V · 7QK')
  })
})

describe('CodeDisplay', () => {
  it('renders the formatted code', async () => {
    await render(<CodeDisplay code="L8V7QK" />)

    expect(screen.getByText('L8V · 7QK')).toBeTruthy()
  })

  it('spells the code out for a screen reader, without the separator', async () => {
    // "el eight vee dot seven queue kay" read as one word is useless to someone
    // transcribing a code. SCREENS.md §7 calls this out for M01-S03.
    await render(<CodeDisplay code="L8V7QK" />)

    expect(screen.getByLabelText('L 8 V 7 Q K')).toBeTruthy()
  })
})
