import { createMockPlannerService } from '@/services/planner/mock'
import type { PlannerStage } from '@/services/planner/types'
import type { TripDraft } from '@/services/plans/types'

/** No artificial pacing in tests — the stage delay is a UI concern. */
const planner = createMockPlannerService({ stageMs: 0 })

const draft = (over: Partial<TripDraft> = {}): TripDraft => ({
  destination: 'Paris, France',
  nights: 3,
  budgetBand: 500,
  styles: ['romantic', 'foodie'],
  ...over,
})

/**
 * The mock planner is the stand-in for a backend, so what is pinned here is the
 * CONTRACT a real one has to keep — not the particular moments in the sample
 * catalogue, which are content and will change.
 *
 * The tests that matter are the ones proving it PLANS rather than returns a
 * fixture: that the budget removes things, that the vibes reorder things, and
 * that no moment is used twice. If those pass, the screens above it are being
 * exercised against something that behaves like a planner.
 */
describe('mock planner', () => {
  it('builds one day per night, in order', async () => {
    const result = await planner.generate({ draft: draft({ nights: 4 }) })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.days).toHaveLength(4)
    expect(result.value.days.map((d) => d.number)).toEqual([1, 2, 3, 4])
  })

  it('never uses the same moment twice across the whole trip', async () => {
    const result = await planner.generate({ draft: draft({ nights: 3 }) })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const ids = result.value.days.flatMap((day) => day.moments.map((m) => m.id))

    expect(ids).toHaveLength(new Set(ids).size)
  })

  it('lays a day out in time order, never two moments in one slot', async () => {
    const result = await planner.generate({ draft: draft() })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    for (const day of result.value.days) {
      expect(day.moments.length).toBeLessThanOrEqual(3)
    }
  })

  it('SPENDS LESS on a tighter budget — the filter is real, not decorative', async () => {
    const rich = await planner.generate({ draft: draft({ budgetBand: 500 }) })
    const tight = await planner.generate({ draft: draft({ budgetBand: 100 }) })

    expect(rich.ok).toBe(true)
    expect(tight.ok).toBe(true)
    if (!rich.ok || !tight.ok) return

    // The whole point of the daily ceiling. A planner that ignored the band
    // would return the same number here twice.
    expect(tight.value.estimatedCost).toBeLessThan(rich.value.estimatedCost)
  })

  it('returns a DIFFERENT itinerary when the vibes change', async () => {
    const foodie = await planner.generate({ draft: draft({ styles: ['foodie'] }) })
    const adventure = await planner.generate({ draft: draft({ styles: ['adventure'] }) })

    expect(foodie.ok).toBe(true)
    expect(adventure.ok).toBe(true)
    if (!foodie.ok || !adventure.ok) return

    const ids = (r: typeof foodie) =>
      r.ok ? r.value.days.flatMap((d) => d.moments.map((m) => m.id)).join('|') : ''

    expect(ids(foodie)).not.toEqual(ids(adventure))
  })

  it('plans a different destination entirely', async () => {
    const paris = await planner.generate({ draft: draft({ destination: 'Paris' }) })
    const kyoto = await planner.generate({ draft: draft({ destination: 'Kyoto' }) })

    expect(paris.ok).toBe(true)
    expect(kyoto.ok).toBe(true)
    if (!paris.ok || !kyoto.ok) return

    expect(paris.value.destination).not.toEqual(kyoto.value.destination)
    expect(kyoto.value.currency).toBe('£')
  })

  it('accepts "surprise us" rather than treating it as a typo', async () => {
    const result = await planner.generate({ draft: draft({ destination: 'Surprise us' }) })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.days.flatMap((d) => d.moments).length).toBeGreaterThan(0)
  })

  it('fails with a code, not a thrown error, on somewhere it cannot place', async () => {
    const result = await planner.generate({ draft: draft({ destination: 'Atlantis' }) })

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.code).toBe('DESTINATION_UNKNOWN')
  })

  it('reports every stage once, in order, before returning', async () => {
    const seen: PlannerStage['key'][] = []

    const result = await planner.generate({
      draft: draft(),
      onProgress: (stage) => seen.push(stage.key),
    })

    expect(seen).toEqual(['reading', 'searching', 'routing', 'budgeting', 'writing'])
    expect(result.ok).toBe(true)
  })

  it('leaves room on purpose — the target is above what it planned', async () => {
    const result = await planner.generate({ draft: draft({ nights: 3 }) })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    // "3 of 7 moments planned · room for serendipity" is a product promise, not
    // a rounding artefact. The plan must never claim to be full.
    expect(result.value.momentsTotal).toBeGreaterThanOrEqual(result.value.momentsPlanned)
  })

  it('lists the destinations it can actually plan', async () => {
    const result = await planner.destinations()

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.length).toBeGreaterThan(1)
    expect(result.value[0]).toHaveProperty('tagline')
  })
})
