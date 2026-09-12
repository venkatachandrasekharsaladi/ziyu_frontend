import { act, render, screen } from '@testing-library/react-native'
import { Appearance, Text } from 'react-native'
import { UnistylesRuntime } from 'react-native-unistyles'

import { useThemeMode } from '@/design-system/themes/useThemeMode'
import { useThemeChoiceStore } from '@/design-system/themes/themeChoiceStore'

function Probe() {
  const { choice, name, setChoice } = useThemeMode()

  return (
    <>
      <Text testID="choice">{choice}</Text>
      <Text testID="name">{name}</Text>
      <Text testID="set-dark" onPress={() => setChoice('dark')}>
        dark
      </Text>
      <Text testID="set-auto" onPress={() => setChoice('auto')}>
        auto
      </Text>
    </>
  )
}

describe('useThemeMode', () => {
  beforeEach(() => {
    useThemeChoiceStore.getState().reset()
    jest.restoreAllMocks()
  })

  it('starts on the stored choice', async () => {
    await render(<Probe />)

    expect(screen.getByTestId('choice').props.children).toBe('light')
  })

  it('records an explicit choice and applies the matching theme', async () => {
    // The Jest mock's `setTheme` is a no-op and `useUnistyles()` always
    // resolves to whichever theme registered first in this project, so `name`
    // never reflects a `setMode` call under test — see `ThemeToggle.test.tsx`,
    // which asserts the same way for the same reason.
    const setTheme = jest.spyOn(UnistylesRuntime, 'setTheme').mockImplementation(() => {})

    await render(<Probe />)

    await act(async () => {
      screen.getByTestId('set-dark').props.onPress()
    })

    expect(useThemeChoiceStore.getState().choice).toBe('dark')
    expect(setTheme).toHaveBeenCalledWith('midnight')
  })

  it('follows the device when the choice is auto', async () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark')
    const setTheme = jest.spyOn(UnistylesRuntime, 'setTheme').mockImplementation(() => {})

    await render(<Probe />)

    await act(async () => {
      screen.getByTestId('set-auto').props.onPress()
    })

    expect(setTheme).toHaveBeenCalledWith('midnight')
  })

  it('stops listening to the device once a choice is explicit', async () => {
    const remove = jest.fn()
    jest
      .spyOn(Appearance, 'addChangeListener')
      .mockReturnValue({ remove } as ReturnType<typeof Appearance.addChangeListener>)

    await render(<Probe />)

    await act(async () => {
      screen.getByTestId('set-auto').props.onPress()
    })
    await act(async () => {
      screen.getByTestId('set-dark').props.onPress()
    })

    expect(remove).toHaveBeenCalled()
  })
})
