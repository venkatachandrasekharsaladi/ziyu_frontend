import { Asset } from 'expo-asset'

/**
 * REAL SAMPLE PHOTOGRAPHY — supplied by the user, not sourced from Unsplash.
 *
 * `@/sample/photos` is the hand-verified Unsplash catalogue; this is its
 * bundled-asset sibling for the photos the user actually provided (dropped in
 * `TalesofTwo/images`, one file per intended placement — the filename says
 * where it goes). `Asset.fromModule(...).uri` resolves a `require()`d image
 * to a plain string URI so every consumer keeps taking `string`, exactly
 * like `samplePhoto()` already does — no caller needs to know a photo is
 * local versus remote.
 */
function local(module: number): string {
  return Asset.fromModule(module).uri
}

export const LOCAL_PHOTO = {
  /** Cover of the featured "Rome coffee" memory — the couple over the Colosseum at dusk. */
  heroMemory: local(require('../../assets/images/memories/hero-memory.png')),
  /** Second photo in the "Rome coffee" memory's carousel — Caffè Roma, two cups. */
  romeCoffeeMemory: local(require('../../assets/images/memories/rome-coffee-memory.png')),
  /** Third photo in the "Rome coffee" memory's carousel — a café table, laughing. */
  memoriesCafe: local(require('../../assets/images/memories/memories-cafe.png')),
  /** The Paris / Notre-Dame memory. */
  parisUnderTrips: local(require('../../assets/images/memories/paris-under-trips.png')),
  /** "Recently added" — the caught-mid-laugh street memory. */
  recentlyAdded: local(require('../../assets/images/memories/recently-added.png')),

  /** "Us" album's grid thumbnail — two hands, a ring, candlelight. */
  albumsUs: local(require('../../assets/images/memories/albums-us.png')),
  /** "Trips" album's grid thumbnail — the view from a plane window. */
  albumsTrips: local(require('../../assets/images/memories/albums-trips.png')),
  /** "Dates" album's grid thumbnail — coffee, cake and scattered polaroids. */
  albumsDates: local(require('../../assets/images/memories/albums-dates.png')),

  /**
   * `AlbumDetailScreen` hero banners — a different photo per album from its
   * own grid thumbnail above, per the design.
   */
  underAlbumsUs: local(require('../../assets/images/memories/under-albums-us.png')),
  underAlbumsTrips: local(require('../../assets/images/memories/under-albums-trips.png')),
  underAlbumsDates: local(require('../../assets/images/memories/under-albums-dates.png')),
  /** Has "Birthday Celebration" baked across its top edge — see `heroContentPosition` on this album. */
  underAlbumsBirthdays: local(require('../../assets/images/memories/under-albums-birthdays.png')),
  underAlbumsLittleThings: local(require('../../assets/images/memories/under-albums-little-things.png')),
  underAlbumsFavourites: local(require('../../assets/images/memories/under-albums-favourites.png')),
} as const
