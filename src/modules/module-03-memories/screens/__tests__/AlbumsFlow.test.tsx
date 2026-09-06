import { screen, userEvent } from '@testing-library/react-native'

import { ALBUMS_COPY as COPY } from '@/copy/albums'
import { AlbumDetailScreen } from '@/modules/module-03-memories/screens/AlbumDetailScreen'
import { AlbumsScreen } from '@/modules/module-03-memories/screens/AlbumsScreen'
import { SAMPLE_ALBUMS, memoriesInAlbum } from '@/sample/albums'
import { SAMPLE_HOME } from '@/sample/home'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()
let mockKey = 'Trips'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ key: mockKey }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  mockKey = 'Trips'
})

describe('M03-S05 Your albums', () => {
  it('draws every album the design lists', async () => {
    await renderScreen(<AlbumsScreen />)

    expect(screen.getByText(COPY.list.heading)).toBeTruthy()

    for (const album of SAMPLE_ALBUMS) {
      expect(screen.getByTestId(`album-cover-${album.key}`)).toBeTruthy()
    }
  })

  it('reads each cover out with its count, not as a bare image', async () => {
    await renderScreen(<AlbumsScreen />)

    const trips = SAMPLE_ALBUMS.find((a) => a.key === 'Trips')!

    expect(
      screen.getByLabelText(`${trips.label}, ${COPY.list.count(trips.sampleCount)}`),
    ).toBeTruthy()
  })

  it('opens an album, encoding a key that contains a space', async () => {
    const user = userEvent.setup()
    await renderScreen(<AlbumsScreen />)

    const little = SAMPLE_ALBUMS.find((a) => a.key === 'Little Things')!

    await user.press(
      screen.getByLabelText(`${little.label}, ${COPY.list.count(little.sampleCount)}`),
    )

    expect(mockPush).toHaveBeenCalledWith('/(app)/memories/albums/Little%20Things')
  })
})

describe('M03-S06 Album Detail', () => {
  it('titles the hero with the album and its count', async () => {
    const trips = SAMPLE_ALBUMS.find((a) => a.key === 'Trips')!

    await renderScreen(<AlbumDetailScreen />)

    expect(screen.getByTestId(`album-hero-${trips.key}`)).toBeTruthy()
    expect(
      screen.getByText(COPY.detail.subtitle(trips.sampleCount, SAMPLE_HOME.coupleName)),
    ).toBeTruthy()
  })

  it('lists the memories carrying the album tag, and nothing else', async () => {
    const trips = SAMPLE_ALBUMS.find((a) => a.key === 'Trips')!
    const inside = memoriesInAlbum(trips)

    await renderScreen(<AlbumDetailScreen />)

    expect(inside.length).toBeGreaterThan(0)

    for (const memory of inside) {
      expect(screen.getByLabelText(memory.title)).toBeTruthy()
    }

    // A memory tagged only `Birthdays` has no business in Trips.
    expect(screen.queryByLabelText('Twenty-nine, and still terrible at blowing out candles.')).toBeNull()
  })

  it('derives Favorites from the flag rather than a tag', async () => {
    mockKey = 'favorites'

    await renderScreen(<AlbumDetailScreen />)

    const favorites = SAMPLE_ALBUMS.find((a) => a.key === 'favorites')!

    for (const memory of memoriesInAlbum(favorites)) {
      expect(memory.favorite).toBe(true)
      expect(screen.getByLabelText(memory.title)).toBeTruthy()
    }
  })

  it('decodes an escaped key from the route', async () => {
    mockKey = 'Little%20Things'

    await renderScreen(<AlbumDetailScreen />)

    expect(screen.getByTestId('album-hero-Little Things')).toBeTruthy()
  })

  it('says so for an album that does not exist, and offers a way back', async () => {
    mockKey = 'not-an-album'

    const user = userEvent.setup()
    await renderScreen(<AlbumDetailScreen />)

    expect(screen.getByText(COPY.detail.missing)).toBeTruthy()

    await user.press(screen.getByRole('button', { name: COPY.detail.back }))
    expect(mockBack).toHaveBeenCalled()
  })
})
