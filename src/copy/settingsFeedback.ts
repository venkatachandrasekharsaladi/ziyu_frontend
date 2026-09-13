/**
 * Copy for Settings → Contact & Feedback.
 *
 * The success state says the message was NOT sent anywhere, because it was not.
 * A settings screen that shows a cheerful "Thanks, we got it!" over a form with
 * no backend is the one lie in this cluster that would actually cost somebody
 * something — they would sit and wait for a reply that is never coming.
 */
export const SETTINGS_FEEDBACK_COPY = {
  title: 'Contact & Feedback',
  lede: 'Tell us what happened, or what you wish this did.',

  topicLabel: 'What is this about',
  problem: 'A problem',
  idea: 'An idea',
  other: 'Something else',

  messageLabel: 'Your message',
  messagePlaceholder: 'What happened, and what you expected instead',
  messageRequired: 'Write a line or two so we know what to look at.',
  messageTooShort: 'A few more words would help us find it.',

  send: 'Send',
  notSent:
    'Nothing was sent — this app has no server yet, so there is nowhere for it to go. Your words are still on this screen.',
} as const
