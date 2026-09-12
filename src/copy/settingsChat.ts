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
  clearHistoryDetail: 'Removes every message from this device.',
  clearConfirmTitle: 'Clear this conversation?',
  clearConfirmBody:
    'Every message, photo and voice note in your conversation is removed from this device. This cannot be undone.',
  clearConfirmCancel: 'Keep them',
  clearConfirmAction: 'Clear history',
  cleared: 'Your chat history was cleared.',
} as const
