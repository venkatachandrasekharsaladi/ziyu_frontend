/**
 * Copy for the appearance control.
 *
 * No design draws this — no dark frame was ever made — so the wording is chosen
 * rather than read. It names the DESTINATION, not the current state ("Dark
 * mode" alone leaves you guessing whether it is a label or a promise), which is
 * also what lets the button double as its own accessible name.
 */
export const APPEARANCE_COPY = {
  label: 'Appearance',
  toDark: 'Switch to dark',
  toLight: 'Switch to light',
} as const
