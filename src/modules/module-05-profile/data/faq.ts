/**
 * The help content.
 *
 * Every answer here describes something this app ACTUALLY does today. Writing
 * an FAQ for features that do not exist is how a support page becomes a second,
 * competing description of the product — so pairing, On This Day, voice notes
 * and the shared space are covered, and nothing else is.
 */
export type FaqEntry = {
  id: string
  topic: 'Getting started' | 'Your space' | 'Privacy' | 'Trouble'
  question: string
  answer: string
}

export const FAQ: FaqEntry[] = [
  {
    id: 'pairing',
    topic: 'Getting started',
    question: 'How do I connect with my partner?',
    answer:
      'One of you creates an invite code in Settings → Partner & Pairing and shares it. The other enters it, confirms it is the right person, and your space opens for both of you.',
  },
  {
    id: 'two-people',
    topic: 'Getting started',
    question: 'Can more than two people join?',
    answer:
      'No. This app is built for exactly two, everywhere — the space, the story and the conversation all assume a pair.',
  },
  {
    id: 'on-this-day',
    topic: 'Your space',
    question: 'What is On This Day?',
    answer:
      'A memory from this date in an earlier year, brought back to you. You can turn it off, or change what time it arrives, in Settings → Memories & Story.',
  },
  {
    id: 'voice-notes',
    topic: 'Your space',
    question: 'How long can a voice note be?',
    answer:
      'Long enough to say what you meant. Recording stops on its own if you forget you started.',
  },
  {
    id: 'read-receipts',
    topic: 'Privacy',
    question: 'Can I turn off read receipts?',
    answer:
      'Yes, in Settings → Chat. Turning yours off hides theirs from you too — it works both ways, on purpose.',
  },
  {
    id: 'who-can-see',
    topic: 'Privacy',
    question: 'Who else can see our space?',
    answer:
      'Nobody. There is no public profile, no feed and no way for anyone outside your pair to find or open your space.',
  },
  {
    id: 'unlink',
    topic: 'Trouble',
    question: 'What happens if we unlink?',
    answer:
      'The shared space closes for both of you. What is on your device stays on your device, but nothing is shared any more, and pairing again needs a new invite.',
  },
  {
    id: 'lost-partner',
    topic: 'Trouble',
    question: 'My partner lost their phone. Are our memories gone?',
    answer:
      'No. Your space is not tied to one device — they sign in again and everything is where they left it.',
  },
]
