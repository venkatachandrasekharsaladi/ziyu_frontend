/**
 * Copy for the three legal screens.
 *
 * `placeholderNotice` is the most important string in this cluster. It is
 * rendered by `LegalDocument` from the document's own flag, so it cannot be
 * forgotten on one screen and present on the other.
 */
export const SETTINGS_LEGAL_COPY = {
  updatedPrefix: 'Last updated',
  placeholderNotice:
    'This is placeholder text, not a legal agreement. It describes how the app is meant to work and has not been reviewed by a lawyer. Real terms replace it before release.',

  licensesTitle: 'Licenses',
  licensesLede: 'The open-source work this app is built on.',
  licensesThanks: 'Thank you to everyone who made these.',
} as const
