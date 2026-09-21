import { screen, userEvent } from '@testing-library/react-native'

import { PLACES_COPY } from '@/copy/sharedPlaces'
import { SharedPlacesScreen } from '@/modules/module-06-plans/screens/SharedPlacesScreen'
import { SAMPLE_MEETUP, SAMPLE_PLACES } from '@/sample/plans'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

/**
 * THE MAP SPY — where this file's real assertion lives.
 *
 * `expo-maps` is native and has no JS fallback at all (see `SharedMap.tsx`), so
 * a stand-in is required before the screen will mount. But the mock is doing
 * more than keeping the lights on: it is the only place a test can SEE what the
 * screen decided to broadcast. The screen's pause has to remove a pin, and a
 * pin is not text on the page — it is a prop handed down through `SharedMap`
 * into a native view. Recording that prop is how "my location stopped being
 * shared" becomes a thing a test can fail on.
 *
 * ONE recorder behind BOTH `AppleMaps.View` and `GoogleMaps.View`. `SharedMap`
 * picks between them on `Platform.OS`, and jest-expo's default platform is iOS
 * today; a spy attached to only the Google half would go silent the moment that
 * default moved, and the suite would report "no pins" rather than "wrong
 * platform". Neither branch is what this file is testing, so neither is what it
 * asserts on.
 *
 * Mocked HERE rather than in `jest.setup.js`: that file holds only the mocks
 * every test needs (Reanimated's worklets engine). Per-module native mocks live
 * beside the suite that needs them, exactly as `expo-router` does across the
 * other 40-odd screen tests.
 */
const mockMapView = jest.fn()

jest.mock('expo-maps', () => {
  // Required inside the factory — `jest.mock` hoists above the imports, so the
  // module-scope bindings are not there yet.
  const React = require('react')
  const { View } = require('react-native')

  const RecordingMapView = (props: unknown) => {
    mockMapView(props)

    return React.createElement(View)
  }

  return {
    AppleMaps: { View: RecordingMapView },
    GoogleMaps: { View: RecordingMapView },
  }
})

/** A marker as `SharedMap` builds it, which is all this file needs to read. */
type RecordedMarker = {
  id: string
  title: string
  snippet?: string
  coordinates: { latitude: number; longitude: number }
}

/**
 * The markers from the LAST render.
 *
 * The last one, not the first: pressing pause re-renders, and the question this
 * file asks is always "what is on the map NOW".
 */
function currentMarkers(): RecordedMarker[] {
  const calls = mockMapView.mock.calls

  // A render that never reached the map would otherwise read as an empty pin
  // list, i.e. as a pause that worked.
  expect(calls.length).toBeGreaterThan(0)

  return calls[calls.length - 1][0].markers as RecordedMarker[]
}

const currentPinIds = () => currentMarkers().map((marker) => marker.id)

beforeEach(() => {
  mockMapView.mockClear()
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

/**
 * M06-S12 · Where we are.
 *
 * The one screen in the cluster with an off switch, so the one screen where a
 * test is the difference between a promise and a claim. Everything below is
 * arranged around the pause.
 */
describe('M06-S12 Where we are', () => {
  it('puts both of them and the meetup on the map while sharing is on', async () => {
    await renderScreen(<SharedPlacesScreen />)

    // The seed has sharing live, so all three pins are expected — in the order
    // the screen builds them.
    expect(currentPinIds()).toEqual(['me', 'partner', 'meetup'])

    const [me, partner, meetup] = currentMarkers()

    expect(me.title).toBe(SAMPLE_PLACES.me.name)
    expect(me.coordinates).toEqual(SAMPLE_PLACES.me.coordinate)
    expect(partner.title).toBe(SAMPLE_PLACES.partner.name)
    expect(meetup.title).toBe(SAMPLE_MEETUP.name)
  })

  it('describes the map to anyone who cannot see it', async () => {
    await renderScreen(<SharedPlacesScreen />)

    expect(screen.getByLabelText(PLACES_COPY.mapLabel(SAMPLE_PLACES.area))).toBeTruthy()
  })

  /**
   * THE ONE THAT MATTERS.
   *
   * A pause that dimmed a button while the coordinates kept flowing would be
   * the worst bug this screen could ship — the user would be told they are
   * invisible while they are not. So the assertion is deliberately NOT about
   * the button: it is about the pin list the map is handed. The label flip is
   * checked too, but only as a second-order courtesy.
   */
  it('takes my pin off the map when I pause sharing', async () => {
    const user = userEvent.setup()
    await renderScreen(<SharedPlacesScreen />)

    expect(currentPinIds()).toContain('me')

    await user.press(screen.getByRole('button', { name: PLACES_COPY.pause }))

    expect(currentPinIds()).not.toContain('me')
    // Their pin and the meetup are unaffected — pausing hides ME, it does not
    // blank the map.
    expect(currentPinIds()).toEqual(['partner', 'meetup'])

    // And the state behind it genuinely cleared, rather than a local flag
    // having shadowed a store that is still broadcasting.
    expect(usePlansStore.getState().sharingWindow).toBeNull()

    // The control now offers the opposite action.
    expect(screen.getByRole('button', { name: PLACES_COPY.resume })).toBeTruthy()
    expect(screen.queryByRole('button', { name: PLACES_COPY.pause })).toBeNull()
  })

  it('puts my pin back when I resume', async () => {
    const user = userEvent.setup()
    await renderScreen(<SharedPlacesScreen />)

    await user.press(screen.getByRole('button', { name: PLACES_COPY.pause }))
    await user.press(screen.getByRole('button', { name: PLACES_COPY.resume }))

    expect(currentPinIds()).toEqual(['me', 'partner', 'meetup'])
    // Resuming picks the shortest window rather than restoring whatever was
    // running before — the safer of the two, and what the screen does.
    expect(usePlansStore.getState().sharingWindow).toBe('1h')
    expect(screen.getByRole('button', { name: PLACES_COPY.pause })).toBeTruthy()
  })

  it('says what a pause means for them, in their name', async () => {
    const user = userEvent.setup()
    useRelationshipStore.getState().setPartner({ id: 'partner-1', name: 'Chandana' })

    await renderScreen(<SharedPlacesScreen />)

    await user.press(screen.getByRole('button', { name: PLACES_COPY.pause }))

    expect(screen.getByText(PLACES_COPY.paused.lede('Chandana'))).toBeTruthy()
    // An "expiring at 10:30" badge over a paused share would be describing a
    // countdown that is not running.
    expect(screen.queryByText(PLACES_COPY.expiring(SAMPLE_PLACES.expiresAtLabel))).toBeNull()
  })

  it('changes the sharing window from the chips', async () => {
    const user = userEvent.setup()
    await renderScreen(<SharedPlacesScreen />)

    // The seed is the one-hour window.
    expect(
      screen.getByRole('button', { name: PLACES_COPY.windows['1h'] }).props.accessibilityState,
    ).toMatchObject({ selected: true })

    await user.press(screen.getByRole('button', { name: PLACES_COPY.windows.tonight }))

    expect(usePlansStore.getState().sharingWindow).toBe('tonight')
    expect(
      screen.getByRole('button', { name: PLACES_COPY.windows.tonight }).props.accessibilityState,
    ).toMatchObject({ selected: true })
    expect(
      screen.getByRole('button', { name: PLACES_COPY.windows['1h'] }).props.accessibilityState,
    ).toMatchObject({ selected: false })

    // The remaining time follows the window rather than staying on the old
    // number — eight hours, as the store computes it.
    expect(screen.getByText(PLACES_COPY.activeFor(480))).toBeTruthy()

    // Choosing a window is also a way back on: the pin never left.
    expect(currentPinIds()).toContain('me')
  })

  it('makes the sharing window a way to resume, not just to retune', async () => {
    const user = userEvent.setup()
    await renderScreen(<SharedPlacesScreen />)

    await user.press(screen.getByRole('button', { name: PLACES_COPY.pause }))
    await user.press(screen.getByRole('button', { name: PLACES_COPY.windows['until-off'] }))

    expect(usePlansStore.getState().sharingWindow).toBe('until-off')
    expect(currentPinIds()).toContain('me')
  })

  it('prints the privacy promise in full, unsoftened', async () => {
    await renderScreen(<SharedPlacesScreen />)

    // Quoted verbatim from the frame. If this ever has to be edited, the claim
    // it makes has to be true first — see the note on `encryption` in the copy.
    expect(screen.getByText(PLACES_COPY.encryption)).toBeTruthy()
  })
})
