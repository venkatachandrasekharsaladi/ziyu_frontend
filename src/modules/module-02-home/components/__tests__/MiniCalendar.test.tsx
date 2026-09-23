import { render, screen, userEvent } from '@testing-library/react-native'

import { MiniCalendar } from '@/modules/module-02-home/components/MiniCalendar'

describe('MiniCalendar', () => {
  it('titles itself with the month and year shown', async () => {
    await render(
      <MiniCalendar year={2026} month={8} today={16} markedDays={new Set()} onPress={() => {}} />,
    )

    expect(screen.getByText('September 2026')).toBeTruthy()
  })

  it('marks the given days, and no others', async () => {
    await render(
      <MiniCalendar
        year={2026}
        month={8}
        today={16}
        markedDays={new Set([3, 20])}
        onPress={() => {}}
      />,
    )

    // Both marked days render their own day number once each.
    expect(screen.getAllByText('3')).toHaveLength(1)
    expect(screen.getAllByText('20')).toHaveLength(1)
  })

  it('opens the full calendar on press', async () => {
    const onPress = jest.fn()
    const user = userEvent.setup()

    await render(
      <MiniCalendar year={2026} month={8} today={16} markedDays={new Set()} onPress={onPress} />,
    )

    await user.press(screen.getByRole('button'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
