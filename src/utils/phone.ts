/**
 * E.164-ish: a leading `+`, then 8 to 15 digits, spaces allowed for readability.
 *
 * Deliberately loose. Strict per-country validation needs a library this app
 * does not have, and a settings screen is the wrong place to start rejecting
 * real numbers from countries nobody on the team thought about. What this
 * catches is the actual mistake: a number typed with no country code, which
 * cannot be sent to at all.
 *
 * Lives here rather than in one screen because two screens now ask for a
 * number — Personal Details and Verify Phone — and two copies of a regex is
 * two places for "what counts as a phone number" to drift apart.
 */
export const PHONE_PATTERN = /^\+[\d\s]{8,18}$/

export function isPhoneNumber(value: string): boolean {
  return PHONE_PATTERN.test(value.trim())
}
