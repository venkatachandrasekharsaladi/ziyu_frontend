import { screen } from '@testing-library/react-native'

import { FlashCard } from '@/modules/module-02-home/components/FlashCard'
import { activeTheme } from '@/test/activeTheme'
import { renderScreen } from '@/test/renderScreen'

const cardStyle = (testID: string) =>
  screen.getByTestId(testID).props.style as Array<Record<string, unknown> | null | undefined>

const fill = (testID: string) => cardStyle(testID).find((s) => s?.backgroundColor)?.backgroundColor
const border = (testID: string) => cardStyle(testID).find((s) => s?.borderColor)?.borderColor

describe('FlashCard', () => {
  it('shows the value, unit and label', async () => {
    await renderScreen(
      <FlashCard icon="heart" value="128" unit="days" label="Together" testID="flash-card" />,
    )

    expect(screen.getByText('128 days')).toBeTruthy()
    expect(screen.getByText('Together')).toBeTruthy()
  })

  it('is one flat lavender tile regardless of index', async () => {
    await renderScreen(
      <>
        <FlashCard icon="heart" value="128" label="Together" index={0} testID="card-0" />
        <FlashCard icon="film" value="8" label="Trips" index={1} testID="card-1" />
      </>,
    )

    expect(fill('card-0')).toBe(activeTheme().colors.surface.field)
    expect(fill('card-1')).toBe(activeTheme().colors.surface.field)
    expect(border('card-0')).toBe(activeTheme().colors.border.subtle)
  })
})
