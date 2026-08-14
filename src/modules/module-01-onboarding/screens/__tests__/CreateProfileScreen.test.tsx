import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { CREATE_PROFILE_COPY as COPY } from '@/copy/createProfile'
import { CreateProfileScreen } from '@/modules/module-01-onboarding/screens/CreateProfileScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}))

describe('CreateProfileScreen', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useRelationshipStore.getState().reset()
  })

  it('renders every field, with the photo well and the optional ones', async () => {
    await renderScreen(<CreateProfileScreen />)

    expect(screen.getByRole('button', { name: COPY.photoLabel })).toBeTruthy()
    expect(screen.getByPlaceholderText(COPY.namePlaceholder)).toBeTruthy()
    expect(screen.getByPlaceholderText(COPY.nicknamePlaceholder)).toBeTruthy()
    expect(screen.getByPlaceholderText(COPY.pronounsPlaceholder)).toBeTruthy()
    expect(screen.getByLabelText(`${COPY.birthdayLabel} month`)).toBeTruthy()
  })

  it('refuses to continue without a name', async () => {
    const user = userEvent.setup()
    await renderScreen(<CreateProfileScreen />)

    await user.press(screen.getByRole('button', { name: COPY.submit }))

    expect(await screen.findByText(COPY.nameRequired)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('submits with a name alone — everything else is optional', async () => {
    const user = userEvent.setup()
    await renderScreen(<CreateProfileScreen />)

    await user.type(screen.getByPlaceholderText(COPY.namePlaceholder), 'Praveen')
    await user.press(screen.getByRole('button', { name: COPY.submit }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(onboarding)/invite'))
  })

  it('rejects an impossible birthday with a field-level message', async () => {
    const user = userEvent.setup()
    await renderScreen(<CreateProfileScreen />)

    await user.type(screen.getByPlaceholderText(COPY.namePlaceholder), 'Praveen')
    await user.type(screen.getByLabelText(`${COPY.birthdayLabel} month`), '02')
    await user.type(screen.getByLabelText(`${COPY.birthdayLabel} day`), '31')
    await user.type(screen.getByLabelText(`${COPY.birthdayLabel} year`), '1994')
    await user.press(screen.getByRole('button', { name: COPY.submit }))

    expect(await screen.findByText(COPY.birthdayInvalid)).toBeTruthy()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('keeps the submitted profile so later screens can name the user', async () => {
    const user = userEvent.setup()
    await renderScreen(<CreateProfileScreen />)

    await user.type(screen.getByPlaceholderText(COPY.namePlaceholder), 'Praveen')
    await user.type(screen.getByPlaceholderText(COPY.nicknamePlaceholder), 'Pravi')
    await user.press(screen.getByRole('button', { name: COPY.submit }))

    await waitFor(() => {
      expect(useRelationshipStore.getState().profile).toMatchObject({
        name: 'Praveen',
        nickname: 'Pravi',
      })
    })
  })
})
