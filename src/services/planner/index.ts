import { createMockPlannerService } from '@/services/planner/mock'

export type * from '@/services/planner/types'

/**
 * THE SWAP POINT — this is the line the backend replaces.
 *
 * Every screen imports `plannerService` from here, never from `mock`. When the
 * real planner exists, this becomes:
 *
 *   export const plannerService = createHttpPlannerService({ baseUrl: ... })
 *
 * and nothing else in the app changes — the generating screen, the setup form
 * and the itinerary are all written against `PlannerService` in `types.ts`,
 * which is the contract to build against.
 *
 * `sample/plannerCatalogue.ts` is deleted at the same time; it is the mock's
 * data and has no other reader.
 */
export const plannerService = createMockPlannerService()
