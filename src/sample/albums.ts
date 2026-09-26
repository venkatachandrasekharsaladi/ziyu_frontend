import { LOCAL_PHOTO } from '@/sample/localPhotos'
import { SAMPLE_MEMORIES } from '@/sample/memories'
import { samplePhotoSquare } from '@/sample/photos'
import type { Memory } from '@/services/memories/types'

/**
 * The six albums the design draws, in the order it draws them.
 *
 * An album is a view over `Memory.tags` — the field whose own comment already
 * says it "drives the collections on the Memories home screen". No new data
 * shape, no service change: `key` IS the tag. `favorites` is the exception, a
 * derived album backed by the `favorite` flag rather than a tag.
 *
 * `sampleCount` reproduces the counts drawn in Figma (86 / 32 / 24 / 12). The
 * album's contents are the real sample memories carrying that tag, so a count
 * and a list can disagree here. That is a property of sample content, not a
 * bug — both go away together when the backend lands and `count` becomes
 * `memories.length`.
 */
export type Album = {
  key: string
  label: string
  emoji: string
  /** Figma's drawn count. */
  sampleCount: number
  /** The small thumbnail on the albums grid. */
  coverUri: string
  /** The big banner behind the title on that album's own detail page — a
   * different photo from `coverUri` on purpose, per the design. */
  heroUri: string
  /**
   * Where `AlbumDetailScreen`'s `contentFit="cover"` anchors its crop.
   * `bottom` for Birthdays: the source photo has a caption baked across its
   * top edge, and anchoring to the bottom keeps that out of the crop instead
   * of pre-editing the file.
   */
  heroContentPosition?: 'center' | 'bottom'
}

export const SAMPLE_ALBUMS: Album[] = [
  {
    key: 'Us',
    label: 'Us',
    emoji: '❤️',
    sampleCount: 86,
    coverUri: LOCAL_PHOTO.albumsUs,
    heroUri: LOCAL_PHOTO.underAlbumsUs,
  },
  {
    key: 'Trips',
    label: 'Trips',
    emoji: '✈️',
    sampleCount: 32,
    coverUri: LOCAL_PHOTO.albumsTrips,
    heroUri: LOCAL_PHOTO.underAlbumsTrips,
  },
  {
    key: 'Dates',
    label: 'Dates',
    emoji: '☕',
    sampleCount: 24,
    coverUri: LOCAL_PHOTO.albumsDates,
    heroUri: LOCAL_PHOTO.underAlbumsDates,
  },
  {
    key: 'Birthdays',
    label: 'Birthdays',
    emoji: '🎂',
    sampleCount: 12,
    // Cover still pending — the user is sending a dedicated one.
    coverUri: samplePhotoSquare('balloons', 800),
    heroUri: LOCAL_PHOTO.underAlbumsBirthdays,
    heroContentPosition: 'bottom',
  },
  {
    key: 'Little Things',
    label: 'Little Things',
    emoji: '🌼',
    sampleCount: 18,
    // Cover still pending — the user is sending a dedicated one.
    coverUri: samplePhotoSquare('flowers', 800),
    heroUri: LOCAL_PHOTO.underAlbumsLittleThings,
  },
  {
    key: 'favorites',
    label: 'Favorites',
    emoji: '⭐',
    sampleCount: 9,
    // Cover still pending — the user is sending a dedicated one.
    coverUri: samplePhotoSquare('heartLights', 800),
    heroUri: LOCAL_PHOTO.underAlbumsFavourites,
  },
]

/** The `favorites` album is the flag; every other album is its tag. */
export function memoriesInAlbum(album: Album, memories: Memory[] = SAMPLE_MEMORIES): Memory[] {
  if (album.key === 'favorites') return memories.filter((m) => m.favorite)

  return memories.filter((m) => m.tags.includes(album.key))
}

export function findAlbum(key: string): Album | undefined {
  return SAMPLE_ALBUMS.find((a) => a.key === key)
}
