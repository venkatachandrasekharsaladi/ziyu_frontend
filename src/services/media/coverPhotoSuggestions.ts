import { samplePhoto, type SamplePhotoKey } from '@/sample/photos'

/**
 * CURATED COVER PHOTO CHOICES — for "change cover photo" on a plan (a trip,
 * eventually a movie night or a shared place).
 *
 * DELIBERATELY NOT A KEYWORD SEARCH. `sample/photos.ts`'s own header explains
 * why this codebase already tried and rejected that: a service that hashes or
 * fuzzy-matches free text ("Kailasagiri temple") to a photo cannot promise the
 * photo is actually of that place, and a wrong photo under a real destination
 * name is worse than an honest "pick one" grid. So this offers a small,
 * hand-verified set of good-looking place/travel photos to choose from
 * instead of guessing — the same standard every other sample photo in this
 * app is held to.
 *
 * REAL SUBJECT MATCHING — typing a place and getting back a correct photo of
 * that specific place — needs a real image search API (or a licensed photo
 * database) behind `services/media`. That is backend work, tracked as
 * pending; this file is the frontend seam it will slot into: swap
 * `curatedCoverChoices()` for a real search call and every screen that reads
 * it keeps working unchanged.
 */
const CURATED_KEYS: SamplePhotoKey[] = [
  'coastSunset',
  'coastPalm',
  'santorini',
  'parisDusk',
  'market',
  'planeWing',
  'embraceSunset',
  'cyclistsSunset',
]

export type CoverPhotoChoice = {
  key: SamplePhotoKey
  uri: string
}

/** A fixed set of good travel/moment photos, sized for a wide card cover. */
export function curatedCoverChoices(width = 900, height = 600): CoverPhotoChoice[] {
  return CURATED_KEYS.map((key) => ({ key, uri: samplePhoto(key, width, height) }))
}
