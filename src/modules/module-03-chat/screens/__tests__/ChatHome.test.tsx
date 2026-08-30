import { waitFor } from '@testing-library/react-native'

import { APP_NAV } from '@/copy/appNav'
import { ChatHomeScreen } from '@/modules/module-03-chat/screens/ChatHomeScreen'
import { renderScreen } from '@/test/renderScreen'

describe('ChatHomeScreen', () => {
  it('shows the conversation with a preview of the newest message', async () => {
    const { getByText } = await renderScreen(<ChatHomeScreen />)

    await waitFor(() => expect(getByText('Chandu & Sarah')).toBeTruthy())
    expect(getByText(/Just trust me\./)).toBeTruthy()
  })

  it('truncates the preview at a word boundary, never mid-word', async () => {
    const { getByLabelText } = await renderScreen(<ChatHomeScreen />)
    const preview = await waitFor(() => getByLabelText('Conversation preview'))
    const text: string = preview.props.children

    if (text.endsWith('…')) {
      expect(text.slice(0, -1).trimEnd()).not.toMatch(/\S$/u)
    }
  })
})

describe('APP_NAV', () => {
  it('has chat live', () => {
    const chat = APP_NAV.tabs.find((t) => t.key === 'chat')
    expect(chat?.live).toBe(true)
    expect(chat?.href).toBe('/(app)/chat')
  })
})
