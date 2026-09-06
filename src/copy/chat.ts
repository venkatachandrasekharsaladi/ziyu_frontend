/**
 * Copy for Module 03 — Chat Home. Figma `Ziyu` 3390:764.
 *
 * The frame draws one populated thread ("Chandu & Sweatcha") plus two static
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
    /** The one thread this app has — see `ChatHeader.tsx`'s own "Sweatcha". */
    coupleName: 'Chandu & Sweatcha',
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
   * "Sweatcha" stays baked directly into the strings rather than taking a name
   * parameter: every other reference to the partner in this module is the
   * same kind of hardcode (`ChatHeader`'s own "Sweatcha" `Text`, `Composer`'s
   * "Message Sweatcha…" placeholder) because there is still no store-backed
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
    /**
     * The day a run of messages belongs to. "Today", not the frame's
     * "TODAY, 5:42 PM" — `caption` uppercases it on a device, and a divider
     * that names one minute inside the day is stating a fact about a single
     * message, which every bubble already carries in its own footer.
     */
    dividerToday: 'Today',
    presenceOnline: 'Online',
    presenceTyping: 'Typing…',
    replyingToPartner: 'Replying to Sweatcha',
    recording: 'RECORDING…',
  },
  /**
   * Moments — the two in-call screens, Figma `Ziyu` 3391:842 (Active Video
   * Moment) and 3391:884 (Active Voice Moment).
   *
   * Both frames LABEL the elapsed readout rather than drawing a bare clock:
   * "Together for 05:20", not "05:20". Only the prefix lives here — the
   * minutes are a runtime `setInterval` value no string in this file can
   * carry — so each screen composes this with `clock(elapsedMs)`, the same
   * split `DayDivider` already uses for its own date.
   *
   * Both captions were drawn in the frames from the start and neither screen
   * ever rendered one; `DesignParity.test.tsx` carried them as a documented
   * omission ("neither screen renders the frames' other captions") rather
   * than a fixed one until now.
   *
   * `keepMoment` is sentence case for the same reason as the card eyebrows
   * above — `caption` uppercases on a device, so the variant does the
   * shouting rather than the string.
   */
  moments: {
    togetherForPrefix: 'Together for',
    videoCaption: 'Just a little moment together.',
    voiceCaption: 'A little moment together',
    keepMoment: 'Keep moment',
  },
  /** Save Memory — the context-menu action's pass/fail report (`FeedbackBanner`). */
  feedback: {
    saveMemorySuccess: 'Saved to Memories.',
    saveMemoryError: 'Could not save to Memories. Try again.',
  },
} as const
