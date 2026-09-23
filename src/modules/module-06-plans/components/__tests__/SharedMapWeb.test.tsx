import { screen } from '@testing-library/react-native'

import type { MapPin } from '@/modules/module-06-plans/components/SharedMap'
// Imported by its PLATFORM-SUFFIXED path on purpose. Metro picks this file for
// `expo export --platform web` and Jest — whose default platform is iOS — would
// otherwise resolve the native sibling and test `expo-maps` instead of the
// fallback. Naming the file is the only way to get at the half that ships to
// the web build, which `predeploy` runs on every deploy.
import { SharedMap } from '@/modules/module-06-plans/components/SharedMap.web'
import { renderScreen } from '@/test/renderScreen'

/** Soho and Covent Garden, the two ends of the sample walk. */
const ME: MapPin = {
  id: 'me',
  coordinate: { latitude: 51.5136, longitude: -0.1365 },
  title: 'Chandu',
  snippet: 'Soho · 78% battery',
}

const PARTNER: MapPin = {
  id: 'partner',
  coordinate: { latitude: 51.5142, longitude: -0.1253 },
  title: 'Sarah is on Neal Street',
  snippet: 'Covent Garden · Heading towards you',
}

/**
 * The WEB half of the platform-split map.
 *
 * It draws no map, which is the point — it draws the PINS. That makes it the
 * one rendering of this data a test can read as text, and it makes truthfulness
 * its only real requirement: a fallback that showed a pretty static picture of
 * two dots would keep showing them after someone paused their location. So what
 * is asserted here is that it renders exactly the pins it was handed, and
 * nothing it was not.
 */
describe('SharedMap (web fallback)', () => {
  it('draws every pin it is given, with its detail and its coordinates', async () => {
    await renderScreen(
      <SharedMap
        center={PARTNER.coordinate}
        pins={[ME, PARTNER]}
        accessibilityLabel="Map of London showing both of your positions"
      />,
    )

    expect(screen.getByText(ME.title)).toBeTruthy()
    expect(screen.getByText(String(ME.snippet))).toBeTruthy()
    expect(screen.getByText(PARTNER.title)).toBeTruthy()
    expect(screen.getByText(String(PARTNER.snippet))).toBeTruthy()

    // Four decimal places — roughly 10 metres, which is as precise as this
    // fallback claims to be.
    expect(screen.getByText('51.5136, -0.1365')).toBeTruthy()
    expect(screen.getByText('51.5142, -0.1253')).toBeTruthy()
  })

  it('draws only the pins it is given', async () => {
    // The pause case, arriving here as data: one pin, and it is not mine.
    await renderScreen(
      <SharedMap
        center={PARTNER.coordinate}
        pins={[PARTNER]}
        accessibilityLabel="Map of London showing both of your positions"
      />,
    )

    expect(screen.getByText(PARTNER.title)).toBeTruthy()
    expect(screen.queryByText(ME.title)).toBeNull()
    expect(screen.queryByText('51.5136, -0.1365')).toBeNull()
  })

  it('leaves the detail line out when a pin has none', async () => {
    await renderScreen(
      <SharedMap
        center={ME.coordinate}
        pins={[{ id: 'meetup', coordinate: ME.coordinate, title: 'Monmouth Coffee' }]}
        accessibilityLabel="Map of London showing both of your positions"
      />,
    )

    expect(screen.getByText('Monmouth Coffee')).toBeTruthy()
    // The coordinates still render — they are never optional.
    expect(screen.getByText('51.5136, -0.1365')).toBeTruthy()
  })

  it('announces itself to a screen reader, which cannot see a map at all', async () => {
    const label = 'Map of London · Central Soho & Strand showing both of your positions'

    await renderScreen(<SharedMap center={ME.coordinate} pins={[ME]} accessibilityLabel={label} />)

    expect(screen.getByLabelText(label)).toBeTruthy()
  })

  it('renders without pins rather than throwing', async () => {
    // Nobody is sharing. The frame still has to come back.
    await renderScreen(
      <SharedMap center={ME.coordinate} pins={[]} accessibilityLabel="Map of London" />,
    )

    expect(screen.getByText('Live positions')).toBeTruthy()
    expect(screen.queryByText(ME.title)).toBeNull()
  })
})
