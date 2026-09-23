import { createMockPlannerService } from '@/services/planner/mock'
import { plannerService } from '@/services/planner'
import { PLANNER_CATALOGUE, type CatalogueMoment } from '@/sample/plannerCatalogue'
import { SAMPLE_PHOTO_KEYS, samplePhoto } from '@/sample/photos'

/**
 * CATALOGUE INTEGRITY — the data, not the planner.
 *
 * `services/planner/__tests__/mock.test.ts` already pins the planner's CONTRACT:
 * that it de-dupes, that the budget filter bites, that the vibes reorder things.
 * It deliberately says nothing about the content it plans from, because content
 * changes. This file is the other half, and it exists for one reason:
 *
 *   THE PLANNER NEVER THROWS ON BAD DATA. IT RENDERS IT.
 *
 * Read `mock.ts` and every failure mode is silent. A duplicate moment id is
 * swallowed by `used: Set<string>` and the second moment simply never appears. A
 * destination with no `evening` moment hits `if (!pick) continue` and returns a
 * day with a hole in it. A `photoKey` that is not a real key makes `samplePhoto`
 * index `ID[key]` to `undefined` and ship the literal URL
 * `.../undefined?w=800&h=520...`, which is a broken image — on a phone, in front
 * of a couple, and never in a test log. An empty `dayTitles` makes
 * `dayTitles[i % 0]` evaluate to `undefined` and the day heading disappears.
 *
 * None of that raises. All of it looks like "the AI is a bit broken". So the
 * only place it can be caught is here, against the data itself.
 *
 * WHY IT MATTERS BEYOND TODAY: this catalogue is the stand-in for a backend a
 * third party will build. These assertions are the spec of what that backend has
 * to return — hand this file over with `planner/types.ts`.
 */

const SLOTS = ['morning', 'afternoon', 'evening'] as const

/**
 * What the setup screen's stepper actually permits.
 *
 * `TripSetupScreen.tsx` clamps with `Math.max(1, n - 1)` and `Math.min(14, n + 1)`,
 * so 14 nights is a reachable state a couple can put the planner in — not a
 * hypothetical. The planner loops `dayIndex < draft.nights` unconditionally, so
 * whatever the catalogue cannot cover comes back as an EMPTY DAY rather than as
 * an error, and the itinerary screen renders a day chip with nothing under it.
 *
 * Hardcoded rather than imported because the screen is a component in another
 * module and importing it here would drag the whole render graph into a data
 * test. If the stepper's ceiling moves, this constant has to move with it — the
 * shortfall test below is what makes that visible.
 */
const MAX_NIGHTS_THE_STEPPER_ALLOWS = plannerService.maxNights

/** The tightest band in `mock.ts`'s `DAILY_CEILING` — £100/night maps to 45. */
const TIGHTEST_DAILY_CEILING = 45

const everyMoment: { destination: string; moment: CatalogueMoment }[] = PLANNER_CATALOGUE.flatMap(
  (destination) => destination.moments.map((moment) => ({ destination: destination.name, moment })),
)

/** How many moments a destination has in its thinnest slot. */
function slotDepth(moments: CatalogueMoment[]): number {
  return Math.min(...SLOTS.map((slot) => moments.filter((m) => m.slot === slot).length))
}

/* ------------------------------------------------------------------ *
 * KNOWN DEFECTS — exemptions, not permission.
 *
 * Each entry below is a REAL bug in the shipped data that this suite found and
 * deliberately did not paper over. They are listed so the suite stays green on
 * everything else while still naming the problem out loud, and each assertion
 * checks the exemption list is EXACTLY right — so the day someone fixes the
 * data, the test fails and tells them to delete the exemption rather than
 * quietly continuing to excuse a bug that no longer exists.
 * ------------------------------------------------------------------ */

/** No stage pacing — this suite is about the data, not the wait. */
const fastPlanner = createMockPlannerService({ stageMs: 0 })

describe('planner catalogue · identity', () => {
  it('is big enough to make the planner choose rather than recite', () => {
    // Not a style preference. With one moment per slot the planner's scoring,
    // budget filter and de-duplication are all unobservable — it would return
    // the same trip for every input and look exactly as correct as it does now.
    expect(PLANNER_CATALOGUE.length).toBeGreaterThanOrEqual(3)
    expect(everyMoment.length).toBeGreaterThanOrEqual(PLANNER_CATALOGUE.length * 3)
  })

  it('gives every moment a globally unique id', () => {
    // The planner de-dupes with a single `Set<string>` spanning the WHOLE trip,
    // not per-destination. A collision does not error: the second moment is
    // simply skipped forever, and the day it should have filled comes back one
    // moment short with no indication why.
    const ids = everyMoment.map(({ moment }) => moment.id)
    const seen = new Map<string, string[]>()

    for (const { destination, moment } of everyMoment) {
      seen.set(moment.id, [...(seen.get(moment.id) ?? []), destination])
    }

    const collisions = [...seen.entries()].filter(([, where]) => where.length > 1)

    // Reported as pairs rather than a bare count so a failure names the id and
    // both destinations, which is the whole of the debugging.
    expect(collisions).toEqual([])
    expect(ids).toHaveLength(new Set(ids).size)
  })

  it('never leaves a displayed string blank', () => {
    // `title`, `description`, `time` and `slotLabel` all go straight to the
    // itinerary card — `slotLabel` becomes the uppercase eyebrow. An empty
    // string renders as a gap with correct padding around it, which reads as a
    // layout bug rather than as missing content.
    for (const { destination, moment } of everyMoment) {
      const where = `${destination} · ${moment.id}`
      const blank = (['title', 'description', 'time', 'slotLabel'] as const).filter(
        (field) => moment[field].trim().length === 0,
      )

      expect({ where, blank }).toEqual({ where, blank: [] })
    }
  })

  it('gives every moment at least one style to be scored on', () => {
    // `score()` returns 0.25 for a moment matching none of the chosen vibes, so
    // a styleless moment is never filtered out — it is permanently last. It
    // would only ever appear as filler once everything else is exhausted, which
    // makes it dead weight that still inflates `countMoments()`'s "Looking
    // through 45 places" claim on the generating screen.
    for (const { destination, moment } of everyMoment) {
      const where = `${destination} · ${moment.id}`

      // Asserted as a labelled object rather than a bare number, so a failure
      // prints WHICH moment is styleless instead of "expected 0 to be > 0".
      expect({ where, styles: moment.styles.length > 0, unique: new Set(moment.styles).size }).toEqual(
        { where, styles: true, unique: moment.styles.length },
      )
    }
  })
})

describe('planner catalogue · can actually fill a day', () => {
  it('gives every destination at least one morning, one afternoon and one evening', () => {
    // The planner walks the three slots in order and `continue`s past any it
    // cannot fill. A destination missing a slot therefore produces a day with a
    // hole in it on EVERY day of the trip — the same hole, silently, forever.
    for (const destination of PLANNER_CATALOGUE) {
      const counts = Object.fromEntries(
        SLOTS.map((slot) => [slot, destination.moments.filter((m) => m.slot === slot).length]),
      )

      // The whole shape in one assertion: a failure prints the destination and
      // exactly which slot is empty, which is the entire diagnosis.
      expect({
        destination: destination.name,
        empty: SLOTS.filter((slot) => counts[slot] === 0),
      }).toEqual({ destination: destination.name, empty: [] })
    }
  })

  it('gives every destination a non-empty dayTitles', () => {
    // Indexed as `dayTitles[dayIndex % dayTitles.length]`. `% 0` is NaN, and
    // `array[NaN]` is `undefined` — so an empty array does not throw, it just
    // makes every day heading vanish while the chips still say "DAY 01".
    for (const destination of PLANNER_CATALOGUE) {
      expect({ destination: destination.name, titles: destination.dayTitles.length }).not.toEqual({
        destination: destination.name,
        titles: 0,
      })

      for (const title of destination.dayTitles) {
        expect(title.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('can fill the tightest budget band without returning an empty first day', () => {
    // £100/night caps a day at 45. The planner accumulates greedily per day and
    // skips any slot it cannot afford, so a destination whose three cheapest
    // moments together exceed the ceiling loses slots on the tightest band —
    // and if it loses all of them on every day, `planned === 0` and the couple
    // gets `NO_PLAN_FOUND` for a perfectly ordinary request.
    for (const destination of PLANNER_CATALOGUE) {
      const cheapestDay = SLOTS.reduce(
        (total, slot) =>
          total +
          Math.min(...destination.moments.filter((m) => m.slot === slot).map((m) => m.cost)),
        0,
      )

      expect({
        destination: destination.name,
        cheapestDay,
        withinCeiling: cheapestDay <= TIGHTEST_DAILY_CEILING,
      }).toEqual({ destination: destination.name, cheapestDay, withinCeiling: true })
    }
  })
})

describe('planner catalogue · depth against the longest trip the UI allows', () => {
  /**
   * THE SHORTFALL, ASSERTED RATHER THAN ASSUMED.
   *
   * The catalogue holds exactly three moments per slot per destination. The
   * stepper goes to 14 nights. The planner does not repeat a moment and does
   * not stop early, so nights 4–14 of a 14-night trip are laid out with a day
   * chip, a cycled title, a subtitle — and ZERO moments under them.
   *
   * This is NOT fixed here: the data is not this file's to change, and padding
   * it would hide the real decision (does the stepper cap at what the corpus can
   * carry, or does the planner repeat, or does the catalogue grow to 42 moments
   * per destination?). It is pinned instead, so nobody rediscovers it on a
   * phone.
   */
  const deepest = Math.max(...PLANNER_CATALOGUE.map((d) => slotDepth(d.moments)))

  it('can fill every night the stepper is allowed to offer', () => {
    /*
     * THIS WAS THE BUG. The stepper used to run to a hardcoded 14 while the
     * catalogue could only fill three complete days, so a default 4-night
     * request already produced an empty day and a 14-night one produced eleven,
     * under a header reading "9 of 41 moments planned".
     *
     * The ceiling now comes from `plannerService.maxNights`, which the mock
     * derives from this catalogue: the scarcest slot in the thinnest
     * destination, plus exactly one deliberately free day. That last day is the
     * product's own idea — the itinerary has a designed empty-day state that
     * says "some of the best ones stay empty" — so the catalogue owes complete
     * days for every night EXCEPT the last.
     *
     * If a destination is thinned out, this fails here rather than on a phone.
     */
    expect(deepest).toBeGreaterThanOrEqual(MAX_NIGHTS_THE_STEPPER_ALLOWS - 1)
  })

  it('at least fills the nights the setup screen opens on', () => {
    // `TripSetupScreen` initialises `useState(4)`, so 4 nights is the DEFAULT
    // request — the one every couple who does not touch the stepper makes. Even
    // that is one day short of what the catalogue can complete, which is the
    // shortfall above showing up in the most common possible case.
    const DEFAULT_NIGHTS = 4

    for (const destination of PLANNER_CATALOGUE) {
      const depth = slotDepth(destination.moments)

      // Each destination fills at least `depth` complete days. Asserted per
      // destination so a thin one is named rather than hidden behind the max.
      expect({ destination: destination.name, depth }).toEqual({
        destination: destination.name,
        depth: 3,
      })
      expect(depth).toBeLessThan(DEFAULT_NIGHTS)
    }
  })
})

describe('planner catalogue · photography', () => {
  it('uses only photo keys that exist in sample/photos', () => {
    // `samplePhoto` does `ID[key]` with no guard. An unknown key yields
    // `undefined`, which string-interpolates into
    // `https://images.unsplash.com/undefined?w=800&h=520&...` — a 404 that
    // renders as an empty tile. `tsc` catches a literal typo, but nothing
    // catches a key deleted from `photos.ts` while still referenced here except
    // this assertion, and nothing at all catches it at runtime.
    const known = new Set<string>(SAMPLE_PHOTO_KEYS)

    for (const destination of PLANNER_CATALOGUE) {
      expect({
        destination: destination.name,
        coverKey: destination.coverKey,
        exists: known.has(destination.coverKey),
      }).toEqual({ destination: destination.name, coverKey: destination.coverKey, exists: true })
    }

    for (const { destination, moment } of everyMoment) {
      if (moment.photoKey === null) continue

      const where = `${destination} · ${moment.id}`

      expect({ where, key: moment.photoKey, exists: known.has(moment.photoKey) }).toEqual({
        where,
        key: moment.photoKey,
        exists: true,
      })
    }
  })

  it('builds a real URL for every key it references', () => {
    // The end-to-end version of the check above, run through the exact call
    // `toItineraryMoment` makes. Catches the failure by its SYMPTOM — the word
    // `undefined` in the path — rather than by the mechanism, so it still holds
    // if `samplePhoto`'s internals change.
    const keys = [
      ...PLANNER_CATALOGUE.map((d) => d.coverKey),
      ...everyMoment.map(({ moment }) => moment.photoKey).filter((k) => k !== null),
    ]

    for (const key of keys) {
      const uri = samplePhoto(key, 800, 520)

      expect(uri).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?/)
      expect(uri).not.toContain('undefined')
    }
  })

  it('never captions a photo that is not there', () => {
    // The caption is drawn as an overlay pinned over the image. With
    // `photoUri: null` the card falls back to a placeholder tile, and a caption
    // like "Montmartre, 9:40 am" floating over a grey rectangle is worse than
    // no caption at all.
    for (const { destination, moment } of everyMoment) {
      if (moment.photoCaption === undefined) continue

      expect({
        where: `${destination} · ${moment.id}`,
        hasPhoto: moment.photoKey !== null,
      }).toEqual({ where: `${destination} · ${moment.id}`, hasPhoto: true })

      expect(moment.photoCaption.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('planner catalogue · money', () => {
  it('prices every moment as a non-negative whole number', () => {
    // `estimatedCost` is a plain sum of these and the header prints
    // "£480 (£120/day)". A negative would make a trip cheaper by adding to it;
    // a fractional one would print "£127.30000000000001" after enough additions.
    for (const { destination, moment } of everyMoment) {
      const where = `${destination} · ${moment.id}`

      expect({
        where,
        cost: moment.cost,
        whole: Number.isInteger(moment.cost),
        nonNegative: moment.cost >= 0,
      }).toEqual({ where, cost: moment.cost, whole: true, nonNegative: true })
    }
  })

  it('never lets a free moment print as a bare zero', () => {
    // `toItineraryMoment` falls back to `${currency}${cost}` when there is no
    // `costLabel`. For a free moment that is the string "£0", which every
    // reader parses as a data error rather than as good news. "Free · Priceless"
    // and "On the house" are the same fact phrased as the product intends.
    const freeWithoutLabel = everyMoment
      .filter(({ moment }) => moment.cost === 0 && moment.costLabel === undefined)
      .map(({ destination, moment }) => `${destination} · ${moment.id} · ${moment.title}`)

    expect(freeWithoutLabel).toEqual([])
  })

  it('never writes a blank or wrong-currency cost label', () => {
    // A blank label is worse than no label: `costLabel ?? ...` treats '' as
    // present, so the fallback never fires and the cost line renders empty.
    //
    // The currency check catches the copy-paste failure this data shape invites
    // — a '£24 for two' pasted into a '€' destination, where nothing else in
    // the pipeline would ever notice, because the label bypasses `currency`
    // entirely.
    const SYMBOLS = ['£', '$', '€']

    for (const destination of PLANNER_CATALOGUE) {
      for (const moment of destination.moments) {
        if (moment.costLabel === undefined) continue

        const where = `${destination.name} · ${moment.id}`

        expect({ where, label: moment.costLabel.trim() }).not.toEqual({ where, label: '' })

        const wrong = SYMBOLS.filter(
          (symbol) => symbol !== destination.currency && moment.costLabel!.includes(symbol),
        )

        expect({ where, wrongCurrency: wrong }).toEqual({ where, wrongCurrency: [] })
      }
    }
  })
})

describe('planner catalogue · destination resolution', () => {
  const aliasesOf = (index: number) => PLANNER_CATALOGUE[index].aliases

  it('keeps every alias lowercase, trimmed and non-empty', () => {
    // `resolve()` lowercases the QUERY and never touches the alias, so an alias
    // carrying a capital can never be matched by anything a human types. It
    // looks like a supported spelling in the source and is dead code in
    // practice — the failure is invisible from the data alone.
    for (const destination of PLANNER_CATALOGUE) {
      expect({ destination: destination.name, aliases: destination.aliases.length }).not.toEqual({
        destination: destination.name,
        aliases: 0,
      })

      for (const alias of destination.aliases) {
        expect({ destination: destination.name, alias }).toEqual({
          destination: destination.name,
          alias: alias.toLowerCase().trim(),
        })
        expect(alias.length).toBeGreaterThan(0)
      }

      expect(new Set(destination.aliases).size).toBe(destination.aliases.length)
    }
  })

  it('never lets one destination shadow another through its aliases', () => {
    // `resolve()` uses `Array.find` over the catalogue IN ORDER and matches with
    // `q.includes(alias)` — a SUBSTRING test, not equality. So if any alias is a
    // substring of another destination's alias, whichever destination appears
    // first in the array wins and the second becomes unreachable for that query.
    // Reordering the catalogue — an edit that looks purely cosmetic — would then
    // silently change which trip a couple gets.
    const clashes: string[] = []

    PLANNER_CATALOGUE.forEach((a, i) => {
      PLANNER_CATALOGUE.forEach((b, j) => {
        if (i === j) return

        for (const mine of aliasesOf(i)) {
          for (const theirs of aliasesOf(j)) {
            if (theirs.includes(mine)) {
              clashes.push(`'${mine}' (${a.name}) is matched inside '${theirs}' (${b.name})`)
            }
          }
        }
      })
    })

    expect(clashes).toEqual([])
  })

  it('never lets an alias swallow the "surprise us" escape hatch', () => {
    // `resolve()` checks `q.includes('surprise')` BEFORE it looks at the
    // catalogue, so an alias containing that substring could never win — but
    // more importantly, "Surprise us" is an answer the setup screen offers, and
    // an alias like 'surprise' would make it resolve as a place name in any
    // other matcher a real backend writes. Pinned at the data layer so the
    // constraint survives the mock being deleted.
    for (const destination of PLANNER_CATALOGUE) {
      for (const alias of destination.aliases) {
        expect(alias).not.toContain('surprise')
      }
    }
  })

  it('resolves every destination from its own full name', () => {
    // The chips on the setup screen are `destinations()`, which returns exactly
    // `d.name`. Tapping one and then generating MUST work, so the round trip is
    // pinned with the planner's own matching rule rather than trusted.
    for (const destination of PLANNER_CATALOGUE) {
      const q = destination.name.trim().toLowerCase()
      const matched = PLANNER_CATALOGUE.find(
        (d) => d.name.toLowerCase() === q || d.aliases.some((a) => q.includes(a)),
      )

      expect({ typed: destination.name, resolvedTo: matched?.name ?? null }).toEqual({
        typed: destination.name,
        resolvedTo: destination.name,
      })
    }
  })

  it('resolves every destination from its bare city name, accents and all', () => {
    /*
     * WAS A DEFECT, NOW A GUARD. `Reykjavík` could not be found by typing its
     * own name: the resolver lowercased but did not fold accents, so
     * `'reykjavík'.includes('reykjavik')` was false and the couple hit a dead
     * end for the spelling the suggestion chip had just shown them.
     *
     * Asserted through the REAL service rather than a replica of its matching
     * logic — the replica this test used to carry kept passing after the
     * resolver was fixed, which is the failure mode a data test has when it
     * reimplements the thing it is checking.
     */
    return Promise.all(
      PLANNER_CATALOGUE.map(async (destination) => {
        const city = destination.name.split(',')[0].trim()

        const result = await fastPlanner.generate({
          draft: { destination: city, nights: 1, budgetBand: 'flexible', styles: [] },
        })

        expect({ city, ok: result.ok }).toEqual({ city, ok: true })
      }),
    )
  })

  it('resolves every destination from its country name', () => {
    // The country is what `Trip.title` prints — "Our Iceland Adventure" — so a
    // country a couple can read off their own itinerary and not be able to type
    // back in is the same dead end as the defect above, one level up.
    for (const destination of PLANNER_CATALOGUE) {
      const q = destination.country.trim().toLowerCase()
      const matched = PLANNER_CATALOGUE.find(
        (d) => d.name.toLowerCase() === q || d.aliases.some((a) => q.includes(a)),
      )

      expect({ country: destination.country, resolves: matched !== undefined }).toEqual({
        country: destination.country,
        resolves: true,
      })
    }
  })

  it('gives every destination the display copy the screens read off it', () => {
    // `tagline` is the chip's second line and `country` builds the trip title.
    // Both are non-optional in the type and both would render as a blank line
    // rather than fail if they were empty strings.
    for (const destination of PLANNER_CATALOGUE) {
      expect({
        name: destination.name.trim(),
        tagline: destination.tagline.trim().length > 0,
        country: destination.country.trim().length > 0,
      }).toEqual({ name: destination.name, tagline: true, country: true })
    }
  })
})
