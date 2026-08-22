import { fireEvent, screen, userEvent } from '@testing-library/react-native'

import { BottomNav, type NavTab } from '@/design-system/patterns/BottomNav'
import { renderScreen } from '@/test/renderScreen'

const TABS: readonly NavTab[] = [
  { key: 'home', label: 'Home', icon: 'home', live: true },
  { key: 'memories', label: 'Memories', icon: 'book-open', live: true },
  { key: 'chat', label: 'Chat', icon: 'message-circle', live: false },
]

describe('BottomNav', () => {
  it('renders every destination as a tab, built or not', async () => {
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" />)

    // The bar itself carries `accessibilityRole="tablist"` but is not
    // `accessible`, deliberately — marking the container accessible would
    // collapse the five tabs into one node for a screen reader. So the tabs
    // are what is queried here.
    expect(screen.getAllByRole('tab')).toHaveLength(TABS.length)
  })

  it('labels each tab, so it is not an icon a screen reader cannot name', async () => {
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" />)

    for (const tab of TABS) {
      expect(screen.getByLabelText(tab.label)).toBeTruthy()
    }
  })

  it('reports which tab is selected', async () => {
    await renderScreen(<BottomNav tabs={TABS} activeKey="memories" />)

    expect(screen.getByLabelText('Memories').props.accessibilityState).toMatchObject({
      selected: true,
    })
    expect(screen.getByLabelText('Home').props.accessibilityState).toMatchObject({
      selected: false,
    })
  })

  it('reports an unbuilt destination as disabled rather than hiding it', async () => {
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" />)

    expect(screen.getByLabelText('Chat').props.accessibilityState).toMatchObject({
      disabled: true,
    })
    expect(screen.getByLabelText('Memories').props.accessibilityState).toMatchObject({
      disabled: false,
    })
  })

  it('reports the key of the tab that was pressed', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup()
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" onSelect={onSelect} />)

    await user.press(screen.getByLabelText('Memories'))

    expect(onSelect).toHaveBeenCalledWith('memories')
  })

  it('cannot be used to reach a destination that does not exist', async () => {
    const onSelect = jest.fn()
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" onSelect={onSelect} />)

    // `fireEvent`, not `userEvent`: the point is that a press on a disabled tab
    // reaches nothing, and this is the bluntest way to attempt one.
    fireEvent.press(screen.getByLabelText('Chat'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not require a handler at all', async () => {
    await renderScreen(<BottomNav tabs={TABS} activeKey="home" />)

    expect(() => fireEvent.press(screen.getByLabelText('Memories'))).not.toThrow()
  })
})
