import { fireEvent, screen } from '@testing-library/react-native'

import { SETTINGS_MEMORIES_COPY as COPY } from '@/copy/settingsMemories'
import { MemoriesSettingsScreen } from '@/modules/module-05-profile/screens/MemoriesSettingsScreen'
import { usePreferencesStore } from '@/state/preferencesStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

describe('MemoriesSettingsScreen', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('shows its title', async () => {
    await renderScreen(<MemoriesSettingsScreen />)

    expect(screen.getByText(COPY.title)).toBeTruthy()
  })

  it('turns On This Day off', async () => {
    await renderScreen(<MemoriesSettingsScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.onThisDay }), 'valueChange', false)

    expect(usePreferencesStore.getState().onThisDayEnabled).toBe(false)
  })

  it('hides the delivery time once On This Day is off', async () => {
    await renderScreen(<MemoriesSettingsScreen />)
    expect(screen.getByText(COPY.deliveryTime)).toBeTruthy()

    await fireEvent(screen.getByRole('switch', { name: COPY.onThisDay }), 'valueChange', false)

    expect(screen.queryByText(COPY.deliveryTime)).toBeNull()
  })

  it('turns off adding chat photos', async () => {
    await renderScreen(<MemoriesSettingsScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.autoAdd }), 'valueChange', false)

    expect(usePreferencesStore.getState().autoAddChatPhotos).toBe(false)
  })

  it('is honest that the default album cannot be chosen yet', async () => {
    await renderScreen(<MemoriesSettingsScreen />)

    expect(screen.getByText(COPY.defaultAlbum)).toBeTruthy()
    expect(screen.getByText(COPY.defaultAlbumFixed)).toBeTruthy()
  })

  it('turns memory reminders off', async () => {
    await renderScreen(<MemoriesSettingsScreen />)
    fireEvent(screen.getByRole('switch', { name: COPY.reminders }), 'valueChange', false)

    expect(usePreferencesStore.getState().memoryReminders).toBe(false)
  })
})
