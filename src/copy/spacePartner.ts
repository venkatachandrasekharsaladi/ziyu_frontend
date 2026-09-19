/**
 * Copy for Space → Partner & Connection. Figma `3430:1645` "(Refined)" and
 * `3430:792` "(Module 05)".
 *
 * Distinct from `settingsPartner.ts`, which belongs to the OLD `/settings/
 * partner` screen. The two say different things: that one manages the pairing
 * as an account operation, this one is about the person. They were nearly
 * merged; they are kept apart because a shared file would have forced one
 * voice onto both.
 */
export const SPACE_PARTNER_COPY = {
  title: 'Your person.',
  lede: 'The person who shares this little world with you.',

  /** Drawn under the two prints. */
  pair: (you: string, partner: string) => `${you} ♡ ${partner}`,

  connected: 'Connected',
  connectedSince: (date: string) => `Since ${date}`,
  connectedSinceUnknown: 'Since you paired',

  accessTitle: 'SHARED SPACE ACCESS',
  accessBody: (partner: string) =>
    `${partner} has full access to all memories, timelines, and chat history within this LoveOS space.`,

  editPartner: 'Edit Partner Details',
  manage: 'Manage Connection',

  /**
   * The frame only ever draws the connected state. A pair who have not linked
   * yet reach this screen from the hub all the same, so it says so rather than
   * claiming a connection that is not there.
   */
  waitingTitle: 'Not connected yet',
  waitingBody: 'Once your invite is accepted, this is where they will live.',
  invite: 'Invite your partner',
} as const
