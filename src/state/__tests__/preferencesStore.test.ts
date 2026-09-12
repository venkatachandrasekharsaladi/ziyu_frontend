import { usePreferencesStore } from '@/state/preferencesStore'

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.getState().reset()
  })

  it('starts on the documented defaults', () => {
    const state = usePreferencesStore.getState()

    expect(state.reduceMotion).toBe(false)
    expect(state.readReceipts).toBe(true)
    expect(state.notificationsEnabled).toBe(true)
    expect(state.autoDownload).toBe('wifi')
    expect(state.homeCards).toEqual(['featured', 'comingUp', 'littleThings'])
  })

  it('sets a value by key', () => {
    usePreferencesStore.getState().setPreference('autoDownload', 'never')

    expect(usePreferencesStore.getState().autoDownload).toBe('never')
  })

  it('flips a boolean without the caller reading it first', () => {
    usePreferencesStore.getState().toggle('readReceipts')

    expect(usePreferencesStore.getState().readReceipts).toBe(false)
  })

  it('resets every field, not only the one that changed', () => {
    const { setPreference, toggle, reset } = usePreferencesStore.getState()
    setPreference('language', 'es')
    toggle('reduceMotion')

    reset()

    expect(usePreferencesStore.getState().language).toBe('en')
    expect(usePreferencesStore.getState().reduceMotion).toBe(false)
  })

  it('leaves neighbouring fields alone when one is set', () => {
    usePreferencesStore.getState().setPreference('clock', '24h')

    expect(usePreferencesStore.getState().dateFormat).toBe('dmy')
  })
})
