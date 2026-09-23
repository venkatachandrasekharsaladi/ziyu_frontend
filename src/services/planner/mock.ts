import { PLANNER_CATALOGUE, type CatalogueDestination, type CatalogueMoment } from '@/sample/plannerCatalogue'
import { samplePhoto } from '@/sample/photos'
import type { ItineraryDay, ItineraryMoment, Trip, TripDraft } from '@/services/plans/types'
import type { PlannerService, Result } from '@/services/planner/types'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Budget ceiling per day, per couple, by band. `flexible` does not cap. */
const DAILY_CEILING: Record<string, number | null> = {
  '100': 45,
  '250': 90,
  '500': 160,
  flexible: null,
}

/**
 * Folds accents away so "Reykjavík" and "Reykjavik" are the same word.
 *
 * Without this, the one destination whose name carries a diacritic could not be
 * found by typing its own name: `destinations()` hands the couple the accented
 * spelling to read off a chip, they type it back, and `'reykjavík'.includes(
 * 'reykjavik')` is false because í and i are different characters. They would
 * hit "we couldn't place that" for the spelling the app itself showed them.
 *
 * NFD splits a letter into base + combining mark; the range strip removes the
 * marks and leaves the base.
 */
const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

/** Finds the destination the couple meant, or null. */
function resolve(destination: string): CatalogueDestination | null {
  const q = fold(destination)

  if (!q) return null

  // "Surprise us" is a real answer, not a failure — pick one deterministically
  // enough to be testable but varied enough to feel chosen.
  if (q.includes('surprise')) {
    return PLANNER_CATALOGUE[Math.floor(Date.now() / 86_400_000) % PLANNER_CATALOGUE.length]
  }

  return (
    PLANNER_CATALOGUE.find(
      (d) => fold(d.name) === q || d.aliases.some((a) => q.includes(fold(a))),
    ) ?? null
  )
}

/**
 * The deepest trip this provider can lay out without repeating itself.
 *
 * Every day needs a morning, an afternoon and an evening, and no moment is ever
 * used twice — so the limit is the scarcest slot in the thinnest destination.
 * Computed rather than written down, so growing the catalogue raises the cap by
 * itself instead of leaving a stale constant behind.
 */
function fillableDays(): number {
  return Math.min(
    ...PLANNER_CATALOGUE.map((destination) =>
      Math.min(
        ...(['morning', 'afternoon', 'evening'] as const).map(
          (slot) => destination.moments.filter((m) => m.slot === slot).length,
        ),
      ),
    ),
  )
}

/**
 * Scores a moment against the chosen vibes.
 *
 * A moment matching two of the couple's three styles beats one matching one.
 * Moments matching none still score above zero, because a day made only of
 * perfect matches is a day with no texture in it — and because filtering them
 * out entirely makes a narrow style choice return an empty trip.
 */
function score(moment: CatalogueMoment, styles: TripDraft['styles']): number {
  if (styles.length === 0) return 1

  const hits = moment.styles.filter((s) => styles.includes(s)).length

  return hits === 0 ? 0.25 : hits
}

function toItineraryMoment(moment: CatalogueMoment, currency: string): ItineraryMoment {
  return {
    id: moment.id,
    time: moment.time,
    slot: moment.slotLabel,
    title: moment.title,
    description: moment.description,
    cost: moment.costLabel ?? `${currency}${moment.cost}`,
    photoUri: moment.photoKey ? samplePhoto(moment.photoKey, 800, 520) : null,
    photoCaption: moment.photoCaption,
    saved: false,
  }
}

type MockOptions = {
  /**
   * How long each stage appears to take. The generating screen reads its
   * pacing from the progress callback, so this is what makes the wait feel
   * like work rather than a stall. Set to 0 in tests.
   */
  stageMs?: number
}

/**
 * THE MOCK PLANNER.
 *
 * It genuinely plans. Given a draft it resolves the destination, scores every
 * moment in the catalogue against the chosen vibes, drops what the daily budget
 * cannot carry, and lays the survivors out one per slot per day without
 * repeating any. Change the budget from £500 to £100 and expensive moments fall
 * out; change the vibes and the ordering changes with them.
 *
 * That matters because the alternative — returning a fixture after a delay —
 * would demo identically today and be a rewrite the day a backend arrives. This
 * shape is the shape a real provider has to satisfy, so the screens above it are
 * already correct.
 *
 * WHAT IT IS NOT: a model, a search, or a source of real opening times. It picks
 * from `sample/plannerCatalogue.ts`. The screens never claim otherwise — see the
 * generating screen's stage copy, which says what this actually does.
 */
export function createMockPlannerService({ stageMs = 900 }: MockOptions = {}): PlannerService {
  /*
   * One free day on top of what the catalogue can fill.
   *
   * Not `fillableDays()` exactly. An unplanned day is this product's own idea
   * of a good time — the itinerary screen has a designed empty-day state that
   * says "some of the best ones stay empty" — so exactly one is a feature. Ten
   * of them is a broken planner, which is what an uncapped stepper produced.
   */
  const maxNights = fillableDays() + 1

  return {
    maxNights,

    async generate({ draft, onProgress }) {
      // Clamped defensively: the stepper reads `maxNights`, but a deep link or
      // a stale client could still ask for more than this provider can lay out.
      const nights = Math.max(1, Math.min(maxNights, draft.nights))

      const stages = [
        { key: 'reading' as const, detail: describeStyles(draft) },
        { key: 'searching' as const, detail: `Looking through ${countMoments()} places` },
        { key: 'routing' as const, detail: 'Keeping each day walkable' },
        { key: 'budgeting' as const, detail: describeBudget(draft) },
        { key: 'writing' as const, detail: 'Putting it in order' },
      ]

      const destination = resolve(draft.destination)

      for (const [index, stage] of stages.entries()) {
        onProgress?.(stage, index, stages.length)
        await wait(stageMs)

        // Reported after the first stage so the screen has shown the couple
        // their own answers back before it admits it cannot place them.
        if (index === 0 && !destination) {
          return { ok: false, error: { code: 'DESTINATION_UNKNOWN' } }
        }
      }

      if (!destination) return { ok: false, error: { code: 'DESTINATION_UNKNOWN' } }

      const ceiling = DAILY_CEILING[String(draft.budgetBand)] ?? null

      const ranked = destination.moments
        .map((moment) => ({ moment, value: score(moment, draft.styles) }))
        .filter(({ value }) => value > 0)
        .sort((a, b) => b.value - a.value)

      const used = new Set<string>()
      const days: ItineraryDay[] = []

      for (let dayIndex = 0; dayIndex < nights; dayIndex += 1) {
        const moments: CatalogueMoment[] = []
        let spend = 0

        for (const slot of ['morning', 'afternoon', 'evening'] as const) {
          const pick = ranked.find(
            ({ moment }) =>
              moment.slot === slot &&
              !used.has(moment.id) &&
              (ceiling === null || spend + moment.cost <= ceiling),
          )

          if (!pick) continue

          used.add(pick.moment.id)
          spend += pick.moment.cost
          moments.push(pick.moment)
        }

        days.push({
          id: `day-${dayIndex + 1}`,
          number: dayIndex + 1,
          title: destination.dayTitles[dayIndex % destination.dayTitles.length],
          subtitle: subtitleFor(dayIndex, destination),
          moments: moments.map((m) => toItineraryMoment(m, destination.currency)),
        })
      }

      const planned = days.reduce((n, day) => n + day.moments.length, 0)

      if (planned === 0) return { ok: false, error: { code: 'NO_PLAN_FOUND' } }

      const estimatedCost = days.reduce(
        (total, day) =>
          total +
          day.moments.reduce((sum, moment) => {
            const source = destination.moments.find((m) => m.id === moment.id)

            return sum + (source?.cost ?? 0)
          }, 0),
        0,
      )

      const trip: Trip = {
        id: `trip-${destination.name.split(',')[0].toLowerCase()}-${nights}d`,
        title: `Our ${destination.country} Adventure`,
        destination: destination.name,
        dateRange: dateRange(nights),
        coverUri: samplePhoto(destination.coverKey, 900, 600),
        nights,
        travellers: 2,
        budgetBand: draft.budgetBand,
        estimatedCost,
        currency: destination.currency,
        styles: draft.styles,
        days,
        momentsPlanned: planned,
        /*
         * The slots this trip actually HAS — three a day, across the days that
         * were built. Previously `draft.nights * 3 - 1`, which counted days the
         * planner had refused to build: a 14-night request reported "9 of 41"
         * and read as a catastrophe rather than as room to breathe.
         */
        momentsTotal: days.length * 3,
      }

      return { ok: true, value: trip }
    },

    async destinations() {
      await wait(120)

      return {
        ok: true,
        value: PLANNER_CATALOGUE.map((d) => ({ name: d.name, tagline: d.tagline })),
      }
    },
  }
}

function countMoments(): number {
  return PLANNER_CATALOGUE.reduce((n, d) => n + d.moments.length, 0)
}

function describeStyles(draft: TripDraft): string {
  if (draft.styles.length === 0) return 'No particular vibe — keeping it open'

  return draft.styles.join(', ')
}

function describeBudget(draft: TripDraft): string {
  const ceiling = DAILY_CEILING[String(draft.budgetBand)]

  return ceiling === null || ceiling === undefined
    ? 'No ceiling — picking the best of it'
    : `Keeping each day under ${ceiling}`
}

function subtitleFor(index: number, destination: CatalogueDestination): string {
  const openers = [
    'Arriving slowly and staying close',
    'The long middle of the trip',
    'The one you will talk about',
    'Packing, badly, and one last coffee',
  ]

  return `${openers[index % openers.length]} · ${destination.country}`
}

/** "May 14 – May 17, 2027", starting a comfortable distance from today. */
function dateRange(nights: number): string {
  const start = new Date()

  start.setDate(start.getDate() + 30)

  const end = new Date(start)

  end.setDate(end.getDate() + Math.max(0, nights - 1))

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`
}
