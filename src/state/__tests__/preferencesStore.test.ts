import { PREFERENCE_DEFAULTS, usePreferencesStore } from '@/state/preferencesStore'

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

  // EVERY field, asserted as one object. Naming two of the forty by hand is a
  // test that says "resets every field" and checks 5% of them: a `reset` that
  // dropped `quietHoursFrom` would have passed. Sign-out depends on this being
  // total — it is what stops one account's settings reaching the next person to
  // sign in on the device.
  it('resets every field, not only the one that changed', () => {
    const { setPreference, toggle, reset } = usePreferencesStore.getState()
    setPreference('language', 'es')
    setPreference('quietHoursFrom', '01:00')
    setPreference('homeCards', ['littleThings'])
    toggle('reduceMotion')
    toggle('appLock')

    reset()

    expect(usePreferencesStore.getState()).toMatchObject(PREFERENCE_DEFAULTS)
  })

  it('leaves neighbouring fields alone when one is set', () => {
    usePreferencesStore.getState().setPreference('clock', '24h')

    expect(usePreferencesStore.getState().dateFormat).toBe('dmy')
  })
})
