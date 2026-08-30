/**
 * Copy for Module 03 — Chat Home. Figma `Ziyu` 3390:764.
 *
 * The frame draws one populated thread ("Chandu & Sarah") plus two static
 * cards below it, "DRAFTED NOTE" and "LOVEOS AI". Neither card has a service
 * or a store behind it yet — no task in the 16-task plan builds one — so
 * both stay non-interactive here, same as the frame shows them: a label and
 * a line of body copy, nothing to press. `Text`'s `caption` variant already
 * uppercases (see `DayDivider.tsx`), so the eyebrows below are written in
 * sentence case and the tab does the shouting, not the string.
 */
export const CHAT_COPY = {
  home: {
    heading: 'Chat',
    subtitle: 'Your little conversations.',
    /** The one thread this app has — see `ChatHeader.tsx`'s own "Sarah". */
    coupleName: 'Chandu & Sarah',
  },
  cards: {
    draftedNote: {
      eyebrow: 'Drafted note',
      body: 'A little something is being written for you.',
    },
    loveosAi: {
      eyebrow: 'LoveOS AI',
      body: 'Ask LoveOS anything about the two of you.',
    },
  },
} as const
