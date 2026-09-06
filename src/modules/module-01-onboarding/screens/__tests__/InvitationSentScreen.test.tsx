import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Platform, Share } from 'react-native'

import { INVITATION_SENT_COPY as COPY } from '@/copy/invitationSent'
import { InvitationSentScreen } from '@/modules/module-01-onboarding/screens/InvitationSentScreen'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockReplace = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: mockReplace }),
}))

describe('InvitationSentScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    useRelationshipStore.getState().reset()
    useRelationshipStore.getState().setInvite('L8V7QK')
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders its blocks and the already-issued code', async () => {
    await renderScreen(<InvitationSentScreen />)

    expect(screen.getByText(COPY.heading)).toBeTruthy()
    expect(screen.getByText(COPY.lede)).toBeTruthy()
    expect(screen.getByText('L8V · 7QK')).toBeTruthy()
  })

  it('can share the same code again', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.shareAgain }))

    await waitFor(() => expect(Share.share).toHaveBeenCalled())
  })

  // `Share.share` (react-native's own module) has no react-native-web
  // implementation — this is the root cause `ConfirmDialog`'s header comment
  // documents for `Alert`, applied to `Share`. On web the Web Share API is
  // used instead where the browser has it.
  it('shares through the Web Share API on web, not react-native Share', async () => {
    const originalOS = Platform.OS
    Platform.OS = 'web'
    const webShare = jest.fn().mockResolvedValue(undefined)
    // @ts-expect-error test-only global, no DOM lib `Navigator` shape needed
    global.navigator = { share: webShare }

    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)
    await user.press(screen.getByRole('button', { name: COPY.shareAgain }))

    await waitFor(() => expect(webShare).toHaveBeenCalledWith({ text: COPY.shareMessage('L8V7QK') }))
    expect(Share.share).not.toHaveBeenCalled()

    Platform.OS = originalOS
    // @ts-expect-error see above
    delete global.navigator
  })

  // No Web Share API either (most desktop browsers) — the fallback is
  // clipboard-plus-confirmation, not a silent no-op.
  it('falls back to copying the invite to the clipboard when neither Share works', async () => {
    const originalOS = Platform.OS
    Platform.OS = 'web'
    const writeText = jest.fn().mockResolvedValue(undefined)
    // @ts-expect-error test-only global, no DOM lib `Navigator` shape needed
    global.navigator = { clipboard: { writeText } }

    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)
    await user.press(screen.getByRole('button', { name: COPY.shareAgain }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(COPY.shareMessage('L8V7QK')))
    expect(await screen.findByText(COPY.shareCopied)).toBeTruthy()

    Platform.OS = originalOS
    // @ts-expect-error see above
    delete global.navigator
  })

  // Real "Copy" needs `expo-clipboard`, not installed — the button is
  // permanently disabled rather than a live-looking no-op.
  it('renders Copy Code disabled, since expo-clipboard is not installed', async () => {
    await renderScreen(<InvitationSentScreen />)

    expect(screen.getByRole('button', { name: COPY.copy }).props.accessibilityState).toMatchObject({
      disabled: true,
    })
  })

  it('asks before cancelling, because the partner may already hold the code', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))

    // The confirm dialog is up...
    expect(screen.getByText(COPY.confirmTitle)).toBeTruthy()
    expect(screen.getByRole('button', { name: COPY.confirmDestroy })).toBeTruthy()
    // ...and nothing is destroyed until the user confirms.
    expect(useRelationshipStore.getState().code).toBe('L8V7QK')
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('destroys the invitation only once confirmed', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))
    await user.press(screen.getByRole('button', { name: COPY.confirmDestroy }))

    await waitFor(() => expect(useRelationshipStore.getState().code).toBeNull())
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/setup'))
  })

  it('keeps the invitation when the confirmation is declined', async () => {
    const user = userEvent.setup()
    await renderScreen(<InvitationSentScreen />)

    await user.press(screen.getByRole('button', { name: COPY.cancel }))
    await user.press(screen.getByRole('button', { name: COPY.confirmKeep }))

    expect(screen.queryByText(COPY.confirmTitle)).toBeNull()
    expect(useRelationshipStore.getState().code).toBe('L8V7QK')
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
