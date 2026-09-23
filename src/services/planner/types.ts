import type { Trip, TripDraft } from '@/services/plans/types'

/**
 * THE PLANNER BOUNDARY — where "an AI builds us an itinerary" enters the app.
 *
 * Mirrors `services/auth` and `services/pairing` exactly: a typed interface,
 * errors as codes rather than strings, and a mock implementation until a real
 * provider exists. Swapping in a real one is a change to `index.ts` and nothing
 * else — no screen imports `mock` directly.
 *
 * THIS IS THE FILE TO HAND WHOEVER BUILDS THE BACKEND. It is the whole contract:
 * what goes in (`TripDraft` — where, how long, what budget, which vibes), what
 * comes back (`Trip`), and what the screen is allowed to show while it waits
 * (`PlannerStage`). A server that satisfies `PlannerService` drops in without a
 * single screen changing.
 */

export type PlannerErrorCode =
  /** The destination could not be resolved to anywhere real. */
  | 'DESTINATION_UNKNOWN'
  /** Nothing in the catalogue matched the chosen styles and budget. */
  | 'NO_PLAN_FOUND'
  | 'NETWORK'
  | 'UNKNOWN'

export type PlannerError = {
  code: PlannerErrorCode
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: PlannerError }

/**
 * One step of the work, reported as it happens.
 *
 * The generating screen shows these rather than a spinner, because the wait is
 * the only evidence the couple has that anything was actually considered. A
 * spinner for eight seconds and a spinner for eighty look identical and say
 * nothing; "checking how far each place is from the last" says what it bought.
 *
 * `key` is stable and is what the UI keys off. `detail` is free text the
 * provider can fill with whatever it genuinely did — a real backend might say
 * "read 240 reviews", the mock says something smaller and true.
 */
export type PlannerStage = {
  key: 'reading' | 'searching' | 'routing' | 'budgeting' | 'writing'
  detail: string
}

/** Progress callback. Called once per stage, in order, before the result. */
export type PlannerProgress = (stage: PlannerStage, index: number, total: number) => void

export type PlannerService = {
  /**
   * The longest trip this provider can actually plan, in nights.
   *
   * THE SETUP SCREEN'S STEPPER READS THIS rather than hard-coding a ceiling.
   * Without it the form happily sold a 14-night trip that the provider could
   * only fill three days of, and the couple got eleven empty days and a header
   * reading "9 of 41 moments planned" — a plan that looks catastrophically
   * unfinished rather than pleasantly open.
   *
   * Deliberately a plain number, not an async call: the stepper needs it on
   * first paint, and a real provider knows its own limit from config rather
   * than having to be asked over the network.
   */
  readonly maxNights: number

  /**
   * Builds an itinerary from a draft.
   *
   * `onProgress` is optional so the contract stays usable from a test or a
   * background refresh that has no screen to update.
   */
  generate: (input: { draft: TripDraft; onProgress?: PlannerProgress }) => Promise<Result<Trip>>

  /**
   * The destinations this provider can plan for, for the setup screen's
   * suggestion chips. A real backend would search rather than enumerate; this
   * exists so the mock's limits are visible in the UI instead of only failing
   * at generate time.
   */
  destinations: () => Promise<Result<{ name: string; tagline: string }[]>>
}
