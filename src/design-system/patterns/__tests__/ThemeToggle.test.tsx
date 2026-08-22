import { screen, userEvent } from '@testing-library/react-native'
import { UnistylesRuntime } from 'react-native-unistyles'

import { APPEARANCE_COPY as COPY } from '@/copy/appearance'
import { ThemeToggle } from '@/design-system/patterns/ThemeToggle'
import { activeThemeName } from '@/test/activeTheme'
import { renderScreen } from '@/test/renderScreen'
import type { ThemeName } from '@/design-system/themes/theme'

const OPPOSITE: Record<ThemeName, ThemeName> = {
  lavender: 'midnight',
  midnight: 'lavender',
}

/**
 * The button, in both themes.
 *
 * Runs in both Jest projects and reads `activeThemeName()`, so the lavender run
 * asserts it offers dark and the midnight run asserts it offers light — off one
 * set of expectations.
 *
 * `setTheme` is spied rather than left to run. The mock's `setTheme` is a no-op
 * anyway, so asserting the CALL is the only way to check the button does the
 * right thing; what happens after it is Unistyles' job, and the applied-theme
 * suite covers the result.
 */
describe('ThemeToggle', () => {
  let setTheme: jest.SpyInstance

  beforeEach(() => {
    setTheme = jest.spyOn(UnistylesRuntime, 'setTheme').mockImplementation(() => {})
  })

  afterEach(() => {
    setTheme.mockRestore()
  })

  it('names the theme it will switch TO, not the one already in use', async () => {
    await renderScreen(<ThemeToggle />)

    const offered = activeThemeName() === 'midnight' ? COPY.toLight : COPY.toDark
    const notOffered = activeThemeName() === 'midnight' ? COPY.toDark : COPY.toLight

    expect(screen.getByRole('button', { name: offered })).toBeTruthy()
    // Offering "switch to dark" while already dark is the classic version of
    // this bug, and it is invisible unless something asserts the absence.
    expect(screen.queryByText(notOffered)).toBeNull()
  })

  it('asks for the other theme when pressed', async () => {
    const user = userEvent.setup()
    await renderScreen(<ThemeToggle />)

    await user.press(screen.getByRole('button'))

    expect(setTheme).toHaveBeenCalledWith(OPPOSITE[activeThemeName()])
  })

  it('never asks for the theme that is already showing', async () => {
    const user = userEvent.setup()
    await renderScreen(<ThemeToggle />)

    await user.press(screen.getByRole('button'))

    expect(setTheme).not.toHaveBeenCalledWith(activeThemeName())
  })

  it('is reachable as a single labelled control', async () => {
    await renderScreen(<ThemeToggle />)

    // The moon/sun glyph is hidden from the reader — the label already says
    // which way the switch goes, so exposing the icon would say it twice.
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
