/**
 * Copy for Settings → Chat.
 *
 * Every switch here corresponds to something `module-03-chat` already renders
 * unconditionally: `ReadReceipt`, `TypingIndicator`, `VoiceNotePlayer`,
 * `PhotoMessage`. This screen is where those become choices.
 *
 * Read receipts are reciprocal and the copy says so. An app that lets you see
 * their receipts while hiding yours is one that quietly takes a side, and in a
 * product for exactly two people that asymmetry is the whole argument.
 *
 * HONEST LIMIT: clearing does not clear anything yet. The conversation lives
 * inside `module-03-chat`'s own state and there is no store here to empty, so
 * the confirmation asks the question the real action will ask and then says,
 * plainly, that nothing was deleted. Copy that reported success would send
 * someone away from this screen believing their messages were gone — the one
 * mistake a settings screen must never let a user make about their own data.
 * Same disclosure rule as `settingsLanguage.ts`.
 */
export const SETTINGS_CHAT_COPY = {
  title: 'Chat',
  lede: 'How your conversation behaves.',

  presenceGroup: 'What they can see',
  readReceipts: 'Read receipts',
  readReceiptsDetail: 'They see when you have read a message. Turning this off hides theirs too.',
  typingIndicator: 'Typing indicator',
  typingIndicatorDetail: 'They see the three dots while you write.',

  mediaGroup: 'Photos & voice',
  autoSave: 'Save to my gallery',
  autoSaveDetail: 'Photos they send are kept on this device.',
  voiceAutoPlay: 'Play voice notes automatically',
  voiceAutoPlayDetail: 'The next one starts when the last one ends.',

  displayGroup: 'Display',
  messageTextLabel: 'Message size',
  textSmall: 'Small',
  textDefault: 'Default',
  textLarge: 'Large',

  dangerGroup: 'History',
  clearHistory: 'Clear chat history',
  clearHistoryDetail: 'Not connected to your conversation yet.',
  clearConfirmTitle: 'Clear this conversation?',
  clearConfirmBody:
    'Clearing will take every message, photo and voice note in your conversation off this device, and that cannot be undone. It does not do that yet: this screen is not connected to your conversation, so nothing will disappear today.',
  clearConfirmCancel: 'Keep them',
  clearConfirmAction: 'Clear history',
  clearNotWired: 'Nothing was deleted. Clearing is not connected to your conversation yet.',
} as const
