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
  coverUri: string
}

export const SAMPLE_ALBUMS: Album[] = [
  { key: 'Us', label: 'Us', emoji: '❤️', sampleCount: 86, coverUri: samplePhotoSquare('wedding', 800) },
  {
    key: 'Trips',
    label: 'Trips',
    emoji: '✈️',
    sampleCount: 32,
    coverUri: samplePhotoSquare('santorini', 800),
  },
  {
    key: 'Dates',
    label: 'Dates',
    emoji: '☕',
    sampleCount: 24,
    coverUri: samplePhotoSquare('coastPalm', 800),
  },
  {
    key: 'Birthdays',
    label: 'Birthdays',
    emoji: '🎂',
    sampleCount: 12,
    coverUri: samplePhotoSquare('balloons', 800),
  },
  {
    key: 'Little Things',
    label: 'Little Things',
    emoji: '🌼',
    sampleCount: 18,
    coverUri: samplePhotoSquare('flowers', 800),
  },
  {
    key: 'favorites',
    label: 'Favorites',
    emoji: '⭐',
    sampleCount: 9,
    coverUri: samplePhotoSquare('heartLights', 800),
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
