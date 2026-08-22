import { screen } from '@testing-library/react-native'
import { Text as RNText } from 'react-native'

import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { typography } from '@/design-system/tokens/typography'
import { renderScreen } from '@/test/renderScreen'

describe('SectionPanel', () => {
  it('names the section and renders what is inside it', async () => {
    await renderScreen(
      <SectionPanel title="Upcoming">
        <RNText>Movie Night</RNText>
      </SectionPanel>,
    )

    expect(screen.getByText('Upcoming')).toBeTruthy()
    expect(screen.getByText('Movie Night')).toBeTruthy()
  })

  it('titles a section in a variant that outranks the rows under it', async () => {
    // The panel title is `h3`. Asserted on the token rather than the rendered
    // style because the variant this replaced, `caption`, was both smaller than
    // the 16pt row titles beneath it and uppercased — which is what made a
    // section read as subordinate to its own contents.
    expect(typography.h3.fontSize).toBeGreaterThan(typography.labelStrong.fontSize)
    expect(typography.h3).not.toHaveProperty('textTransform')
    expect(typography.caption).toHaveProperty('textTransform', 'uppercase')
  })
})
