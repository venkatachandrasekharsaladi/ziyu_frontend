/**
 * CURATED SAMPLE PHOTOGRAPHY.
 *
 * Every URL in this file was fetched and LOOKED AT before being written down.
 * That is the whole point of the file, so please keep it true: if you add one,
 * open it first.
 *
 * WHY THIS EXISTS
 *
 * Sample content used to be built on `picsum.photos/seed/loveos-<subject>`.
 * The seeds read like they meant something — `rome-coffee`, `flowers`,
 * `candles` — but picsum does not search. It hashes the seed to pick an
 * arbitrary photo from its library. Deterministic, and completely blind to
 * what the seed says. So "Coffee, sunshine, and nowhere to be." sat above a
 * landscape, and a memory about sunshine showed a black-and-white bird.
 *
 * A photo under a caption is making a claim about that caption. These are
 * meant to read as one couple's own pictures, so a mismatch is not a cosmetic
 * bug — it breaks the fiction the whole app rests on.
 *
 * WHY UNSPLASH IDS RATHER THAN A KEYWORD SERVICE
 *
 * Keyword services were tried first and rejected for concrete reasons:
 *   - `source.unsplash.com` (keyword redirects) is dead — it answers 503.
 *   - `loremflickr.com/<w>/<h>/<keywords>` genuinely matches subjects, but
 *     burns an attribution watermark into the pixels ("cc-nc-nd", the
 *     photographer's handle) and serves snapshot-grade photography.
 *   - Openverse searches properly and returns titles, but indexes mostly
 *     amateur Flickr work.
 *
 * A fixed id cannot drift the way a search can: this exact photo is the one
 * that was reviewed, and it stays that photo. The cost is that adding a
 * subject means a human looking at a candidate, which is the right cost.
 *
 * LICENSING: Unsplash content is free to use commercially without permission
 * or attribution. Attribution is appreciated and these are sample assets, so
 * swap them for the couple's real photographs before shipping to anyone.
 */

const CDN = 'https://images.unsplash.com'

/**
 * Builds a sized, cropped URL. Unsplash resizes on the CDN, so asking for the
 * display size keeps the payload small on a phone instead of shipping a
 * multi-megabyte original.
 */
function photo(id: string, w = 800, h = 1000): string {
  return `${CDN}/${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}

/**
 * Subject → verified photo id.
 *
 * The comment beside each one describes what is actually in the frame. If the
 * description and the image ever disagree, the image is right and the comment
 * is stale — but fix it, because the next person reads the comment.
 */
const ID = {
  /** Two lattes with rosetta art on a wooden table, plants behind. */
  coffeeTable: 'photo-1509042239860-f550ce710b93',
  /** Café table with a French press and cups against a rain-streaked window. */
  coffeeRain: 'photo-1445116572660-236099ec97a0',
  /** Three hands clinking two lattes and an iced coffee, from above. */
  coffeeToast: 'photo-1495474472287-4d71bcdd2085',
  /** Airy industrial café interior, hanging lamps and long tables. */
  cafeInterior: 'photo-1555396273-367ea4eb4db5',

  /** The Eiffel Tower at dusk over the Seine, pink and blue sky. */
  parisDusk: 'photo-1502602898657-3e91760cbb34',
  /** The Eiffel Tower on a clear blue afternoon, gardens below. */
  parisDay: 'photo-1431274172761-fca41d930114',

  /** Turquoise surf breaking on pale sand at sunset. */
  coastSunset: 'photo-1507525428034-b723cf961d3e',
  /** A palm tree and a beached sailboat on bright tropical sand. */
  coastPalm: 'photo-1519046904884-53103b34b206',

  /** Two hands forming a heart around the setting sun, in silhouette. */
  heartHands: 'photo-1516589178581-6cd7833ae3b2',
  /** Warm pink heart-shaped bokeh against a dark ground. */
  heartLights: 'photo-1518199266791-5375a83190b7',

  /** Covered produce market, crates of fruit and vegetables, stallholders. */
  market: 'photo-1533900298318-6b8da08a523e',

  /** A couple cooking together at a kitchen island, both laughing. */
  cookingTogether: 'photo-1556910103-1c02745aae4d',

  /** An aircraft wing above towering clouds lit gold by low sun. */
  planeWing: 'photo-1436491865332-7a61a109cc05',

  /** "Happy Birthday" piped in white chocolate beside truffles. */
  birthdayPlate: 'photo-1558636508-e0db3814bd1d',
  /** A ceiling of pastel balloons with ribbons hanging down. */
  balloons: 'photo-1530103862676-de8c9debad1d',

  /** Dense red begonias in bloom, filling the frame. */
  flowers: 'photo-1519378058457-4c29a0a2efac',

  /** Three friends on a street, genuinely mid-laugh, one doubled over. */
  caughtLaughing: 'photo-1543807535-eceef0bc6599',
  /** A couple embracing in silhouette, the sun setting between them. */
  embraceSunset: 'photo-1494774157365-9e04c6720e47',
  /** Two cyclists in silhouette at sunset, reaching to touch hands. */
  cyclistsSunset: 'photo-1474552226712-ac0f0961a954',

  /** Whitewashed Santorini steps descending to a deep blue sea. */
  santorini: 'photo-1533105079780-92b9be482077',
  /** A couple at their wedding releasing white balloons, guests behind. */
  wedding: 'photo-1511285560929-80b456fea0bc',
} as const

export type SamplePhotoKey = keyof typeof ID

/** A portrait-ish photo for a memory card or a detail hero. */
export const samplePhoto = (key: SamplePhotoKey, w = 800, h = 1000): string =>
  photo(ID[key], w, h)

/** A square crop, for grid tiles and album thumbnails. */
export const samplePhotoSquare = (key: SamplePhotoKey, size = 600): string =>
  photo(ID[key], size, size)

/**
 * The keys, in a stable order.
 *
 * Anywhere that needs "some photos" — an album's contents, a carousel — should
 * take a slice of this rather than inventing its own list, so no screen ends up
 * reaching for a key that does not exist.
 */
export const SAMPLE_PHOTO_KEYS = Object.keys(ID) as SamplePhotoKey[]
