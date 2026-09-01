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
  /**
   * Pinned & Search — Figma `Ziyu` 3390:60.
   *
   * `search.label` is the exact string Task 14's end-to-end journey and this
   * module's own accessibility contract query for
   * (`getByLabelText('Search messages')`): `Input` mirrors its `label` prop
   * straight onto the field's `accessibilityLabel`, so this one string does
   * double duty as the visible caption above the field AND the a11y name.
   * Do not reword it without updating both call sites.
   */
  search: {
    label: 'Search messages',
    placeholder: 'Search your conversation',
    pinnedLabel: 'Pinned',
    resultsLabel: 'Results',
    /** Exact string the brief and Task 14 both assert on. */
    empty: 'No messages found',
  },
  /**
   * Conversation — the transient presence/annotation strings the Ziyu
   * `3390:521` (Typing), `3390:585` (Replying) and `3390:164` (Recording)
   * frames draw that Task 6's original build never wired up (documented as
   * "Known design divergences" #3 in `docs/qa/chat-test-cases.md` until this
   * fix closed it). Centralized here, not hardcoded inline in `ChatHeader` /
   * `ReplyPreview` / `VoiceNoteRecorder` themselves, because this file
   * already owns exactly this kind of Chat-module copy (see the header
   * comment above).
   *
   * "Sarah" stays baked directly into the strings rather than taking a name
   * parameter: every other reference to the partner in this module is the
   * same kind of hardcode (`ChatHeader`'s own "Sarah" `Text`, `Composer`'s
   * "Message Sarah…" placeholder) because there is still no store-backed
   * partner profile to read a name from — a template function would be
   * inventing a flexibility nothing here can actually use yet.
   *
   * The ellipses are the single typographic glyph (…), not three literal
   * periods, matching this app's own convention (see `Composer`'s
   * placeholder and `chatStore.ts`'s `memoryFromMessage`) rather than the
   * Figma fixture's literal `"..."` — the same deliberate divergence
   * `DesignParity.test.tsx` already calls out for the composer placeholder.
   */
  conversation: {
    presenceOnline: 'Online',
    presenceTyping: 'Typing…',
    replyingToSarah: 'Replying to Sarah',
    recording: 'RECORDING…',
  },
  /** Save Memory — the context-menu action's pass/fail report (`FeedbackBanner`). */
  feedback: {
    saveMemorySuccess: 'Saved to Memories.',
    saveMemoryError: 'Could not save to Memories. Try again.',
  },
} as const
