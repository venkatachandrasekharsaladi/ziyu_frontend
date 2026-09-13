/**
 * Copy for Settings → Partner & Pairing.
 *
 * Unlinking is the heaviest thing in this cluster short of deletion, and the
 * confirmation says what actually happens rather than asking "are you sure?".
 * In a product for exactly two people, unlinking ends the shared space — the
 * person tapping it deserves to read that before they answer.
 */
export const SETTINGS_PARTNER_COPY = {
  title: 'Partner & Pairing',
  lede: 'Who you share this space with.',

  partnerGroup: 'Your partner',
  pairedSince: 'Paired since',
  noPartner: 'You have not paired with anyone yet.',
  invitePartner: 'Invite your partner',

  codeGroup: 'Your invite code',
  codeHint: 'Share this with your partner so they can find you.',
  shareCode: 'Share code',
  copyCode: 'Copy code',
  copied: 'Copied.',
  shareCopied: 'Your browser has no share sheet, so the invite is on your clipboard instead.',
  copyUnavailable: 'Copying needs a clipboard module this build does not have. Read it out, or share it.',

  dangerGroup: 'Ending it',
  unlink: 'Unlink partner',
  unlinkDetail: 'Leave the space you share.',
  unlinkTitle: 'Unlink from your partner?',
  unlinkBody:
    'Your shared space closes for both of you. Your memories, messages and dates stay on this device but stop being shared. You would each need a new invite to pair again.',
  unlinkCancel: 'Stay paired',
  unlinkConfirm: 'Unlink',
} as const
