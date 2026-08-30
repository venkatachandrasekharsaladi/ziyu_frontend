# Chat module — test-case catalogue

This is the release checklist for the Chat module (`src/modules/module-03-chat/`).
Every row marked `Yes` under Automated names a real file and a real test in it —
verified against `npx jest --listTests` and by reading each cited test's actual
assertions, not just its title. Rows marked `No` say why, and several of them
are genuine gaps in the current suite, not just gestures/hardware that jest
cannot reach — read the reason before assuming "manual" means "someone will
catch it eventually."

IDs run `CHAT-001` upward, sequential across the whole document. Figma node
ids reference the Ziyu Chat frames. "Test" cites the file and, where more than
one test in a file is relevant, the test name.

## Chat Home — `3390:764`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-001 | Chat Home | 3390:764 | Store loaded with the seeded thread | Open the Chat tab | Heading, subtitle, and couple name (`Chandu & Sarah`) render | Yes | `screens/__tests__/ChatHome.test.tsx` — "shows the conversation with a preview of the newest message" |
| CHAT-002 | Chat Home | 3390:764 | Thread's newest message is `m5`, "Just trust me." | Open the Chat tab | The conversation row's preview shows the newest message, not the thread's first message | Yes | `screens/__tests__/ChatHome.test.tsx` — same test |
| CHAT-003 | Chat Home | 3390:764 | Newest message body is 46 characters, over the row's 34-character budget | Open the Chat tab | Preview is cut at a word boundary with a trailing `…`; the text before the ellipsis is a clean prefix of the real body (next character in the original was a space) | Yes | `screens/__tests__/ChatHome.test.tsx` — "truncates the preview at a word boundary, never mid-word"; unit-level in `__tests__/truncate.test.ts` — "cuts at a word boundary" |
| CHAT-004 | Chat Home | 3390:764 | Newest message body is 14 characters, under budget | Open the Chat tab | Preview renders the full body verbatim, no ellipsis | Yes | `screens/__tests__/ChatHome.test.tsx` — "leaves a short preview exactly as written" |
| CHAT-005 | Chat Home | 3390:764 | On Chat Home | Tap the conversation row | Navigates to the thread (`/(app)/chat/conversation`) | **No** | Gap, not a hardware limitation: no test presses the row or asserts `router.push` was called. `ChatHomeScreen.openConversation` is wired (reads `router.push('/(app)/chat/conversation')` in the source) but unexercised by any test in this suite. |
| CHAT-006 | Chat Home | 3390:764 | On Chat Home | — | Both dashboard cards ("Drafted note", "LoveOS AI") render their eyebrow labels | Yes | `__tests__/DesignParity.test.tsx` — "draws the card eyebrows as the frame's upper-cased text…" |

## Conversation — `3390:665`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-007 | Conversation | 3390:665 | Thread seeded with 5 alternating messages | Open the thread | Both an incoming ("Just trust me.") and an outgoing ("Obviously.") seeded message render | Yes, partially | `screens/__tests__/ConversationFlow.test.tsx` — "renders the seeded thread in order" checks both messages are present; it does not assert their DOM order, so exact chronological ordering is not independently verified by this test. |
| CHAT-008 | Conversation | 3390:665 | Thread loaded | Open the thread | Day divider text ("TODAY, 5:42 PM") renders | Yes | `__tests__/DesignParity.test.tsx` — "renders every non-clock, non-placeholder string the frame draws" (the divider's node id is not in the test's timestamp-exclusion list, so it is checked like any other frame string) |
| CHAT-009 | Conversation | 3390:665 | One outgoing (`authorId: me`), one incoming message rendered | — | Outgoing message shows a read receipt; incoming does not | Yes | `components/__tests__/MessageBubble.test.tsx` — "shows a read receipt on outgoing messages only" |
| CHAT-010 | Conversation | 3390:665 | Outgoing and incoming bubbles rendered | — | Outgoing bubbles align to the trailing edge, incoming to the leading edge | **No** | Gap: no test queries the rendered `rowMine`/`rowTheirs` alignment style. This is not blocked by the Unistyles Jest mock (that mock only strips `variants`; plain `StyleSheet.create` factory styles like this one are still queryable) — it is simply untested. |
| CHAT-011 | Conversation | 3390:665 | A message renders | — | Its bubble shows a formatted send-time caption (e.g. "12:45 PM") | **No** | Gap: `DesignParity.test.tsx` deliberately excludes bubble timestamps from its string check (runtime clock output can't be pinned against Figma's fixed "5:42 PM"), and no other test asserts a timestamp caption renders at all. |
| CHAT-012 | Conversation | 3390:665 | A message is sent | — | Status progresses `sending → sent → delivered → read` | Yes | `services/chat/__tests__/mock.test.ts` — "walks an outgoing message through every status" (service layer; UI-level status icon progression is not separately re-asserted) |
| CHAT-013 | Conversation | 3390:665 | `send()` called, service call not yet resolved | — | The outgoing bubble appears immediately with `status: 'sending'`, before the service promise settles | Yes | `state/__tests__/chatStore.test.ts` — "shows an outgoing message immediately, before the service resolves" |
| CHAT-014 | Conversation | 3390:665 | Composer is empty | — | Composer offers a Record control | Yes | `components/__tests__/Composer.test.tsx` — "labels every icon-only control" (value `""`) |
| CHAT-015 | Conversation | 3390:665 | Composer has typed text | — | Record control is replaced by Send; there is no Record control while text is present | Yes | `components/__tests__/Composer.test.tsx` — "offers send instead of record once there is text" |
| CHAT-016 | Conversation | 3390:665 | Composer has `"  On my way  "` typed | Press Send | Sent body is trimmed (`"On my way"`); the input field clears | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "sends what was typed, trimmed, and clears the field" |
| CHAT-017 | Conversation | 3390:665 | `sendMessage` rejects once | Send a message, then retry | Failed send is marked `status: 'failed'` in place (not dropped); retry reconciles the same slot rather than appending a second bubble | Yes | `state/__tests__/chatStore.test.ts` — "marks a failed send in place instead of dropping it, and lets retry recover it" |
| CHAT-018 | Conversation | 3390:665 | Thread loaded | — | Header shows the partner's name ("Sarah"), avatar, and "Online" presence | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "draws the partner identity the frame shows" |
| CHAT-019 | Conversation | 3390:665 | On the thread | Press Back | Returns to Chat Home | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "returns to Chat Home from the back control" |
| CHAT-020 | Conversation | 3390:665 | On the thread | Press "Start video call" | Navigates to `/(app)/chat/moment/video` | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "opens the video Moment from its call control" |
| CHAT-021 | Conversation | 3390:665 | On the thread | Press "Start voice call" | Navigates to `/(app)/chat/moment/voice` | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "opens the voice Moment from its call control" |
| CHAT-022 | Conversation | 3390:665 | On the thread | Press "More options" | No navigation happens (control has no feature behind it yet) | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "offers the overflow control without it doing anything yet" |

## Typing — `3390:521`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-023 | Conversation | 3390:521 | Thread loaded | Store sets `isPartnerTyping: true` | Typing indicator ("Partner is typing") appears | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "shows the typing indicator while the partner types"; also `__tests__/DesignParity.test.tsx` — "mounts the typing indicator once the store says the partner is typing" |
| CHAT-024 | Conversation | 3390:521 | Indicator showing | Store sets `isPartnerTyping: false` | Indicator disappears | Yes | `screens/__tests__/ChatJourney.test.tsx` — step 4 ("Partner typing") is the only file that exercises the off-transition |
| CHAT-025 | Conversation | 3390:521 | Partner is typing | — | Header presence line swaps from "Online" to "Typing…", and back once `isPartnerTyping` clears — previously a known, documented divergence (the header hardcoded "Online" unconditionally); fixed, see `components/__tests__/ChatHeader.test.tsx` | Yes | `__tests__/DesignParity.test.tsx` — "mounts the typing indicator…" now asserts `getByText('Typing…')`; `components/__tests__/ChatHeader.test.tsx` — "swaps to \"Typing…\" while the partner is typing, and back once they stop" |

## Replying — `3390:585`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-026 | Conversation | 3390:585 | Composer given a `replyTo` value | — | Composer shows the quoted message above the input | Yes | `components/__tests__/Composer.test.tsx` — "shows the quoted message when replying" |
| CHAT-027 | Conversation | 3390:585 | `startReply('m5')` called on a mounted thread | — | The quoted body renders twice: once in the live bubble, once in the reply-preview strip | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "quotes a message when replying to it"; `screens/__tests__/ChatJourney.test.tsx` — step 7 |
| CHAT-028 | Conversation | 3390:585 | Replying to a message | Cancel the reply | `replyTarget` clears | Yes, partially | `screens/__tests__/ChatJourney.test.tsx` — step 7 calls `cancelReply()` on the store directly and asserts `replyTarget` is null. No test presses the composer's actual "Cancel reply" button and checks the preview disappears or the callback fires — the UI wiring itself is untested, only the store action. |

## Reactions & context menu — `3390:439`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-029 | Conversation | 3390:439 | — | Long-press a message | `ReactionBar` renders its full six emoji options (🖤 ❤️ 😂 🥺 😍 👍) | Yes | `components/__tests__/ReactionBar.test.tsx` — "offers the six emoji the frame draws" |
| CHAT-030 | Conversation | 3390:439 | `ReactionBar` mounted | Press an emoji | `onReact` is called with that emoji | Yes | `components/__tests__/ReactionBar.test.tsx` — "reports which emoji was chosen" |
| CHAT-031 | Conversation | 3390:439 | A message has no reaction from me | React, then react again with the same emoji | First reacts attaches the reaction; the second toggle clears it | Yes | `services/chat/__tests__/mock.test.ts` — "attaches and toggles a reaction" (service layer) |
| CHAT-032 | Conversation | 3390:439 | Message long-pressed, overlay showing | Tap a reaction emoji through the overlay | The tap reaches `ReactionBar` and calls `react()` — it is not swallowed by the scrim beneath it | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "lets a reaction through the overlay instead of the scrim only dismissing it" |
| CHAT-033 | Conversation | 3390:439 | `ReactionBar` mounted | Press "More reactions" | `onMore` is called | Yes | `components/__tests__/ReactionBar.test.tsx` — "offers a way to reach more reactions than the six pinned ones" |
| CHAT-034 | Conversation | 3390:439 | Message selected | — | Context menu offers Reply, Copy, Save Memory; each reports its own action independently | Yes | `components/__tests__/ReactionBar.test.tsx` — `MessageContextMenu` describe block, both tests |
| CHAT-035 | Conversation | 3390:439 | Reaction/context overlay showing | Tap the scrim (outside the menu) | Overlay dismisses without triggering an action | **No** | Gap: no test presses the "Dismiss message actions" scrim control and checks the overlay closes. Only the inverse — a tap that *should* reach the menu and not the scrim — is tested (CHAT-032). |

## Save Memory (context-menu action — no dedicated Figma frame, see §4.1 note below)

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-036 | Conversation | — | Message selected | Save Memory | `memoriesService.create` is called with the real contract: `title`, `date`, `note`, `photoUri`, `tags` | Yes | `screens/__tests__/SaveMemory.test.tsx` — "writes the selected message through the real memories contract" |
| CHAT-037 | Conversation | — | Selected message is a bare photo (no text body) | Save Memory | `photoUri` carries through; title falls back sensibly | Yes | `screens/__tests__/SaveMemory.test.tsx` — "carries the photo along when the saved message is a photo" |
| CHAT-038 | Conversation | — | Message selected, save succeeds | Save Memory | Selection overlay dismisses | Yes | `screens/__tests__/SaveMemory.test.tsx` — "dismisses the selection overlay once the memory is actually saved" |
| CHAT-039 | Conversation | — | Message selected, save fails | Save Memory | Selection overlay stays open (no optimistic dismiss); nothing crashes | Yes | `screens/__tests__/SaveMemory.test.tsx` — "leaves the overlay open, and does not crash, when the service fails" |
| CHAT-040 | Conversation | — | Message id not in the thread | Save Memory with that id | No-op; `memoriesService.create` is never called | Yes | `screens/__tests__/SaveMemory.test.tsx` — "does nothing for a message id that is not in the thread" |

## Attachments — `3390:384`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-041 | Conversation | 3390:384 | Attachment sheet open | — | Offers four sources: Photo, Camera, Voice note, Memory | Yes | `components/__tests__/Attachments.test.tsx` — "offers the four sources the frame draws" |
| CHAT-042 | Conversation | 3390:384 | Thread open | Press "Add attachment" | Attachment sheet opens showing its tiles | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "opens the attachment sheet from the composer" |
| CHAT-043 | Conversation | 3390:384 | Attachment sheet open | Press "Choose photo" | Photo stages and hands off to `PhotoSharePreview` (sheet closes, preview's Send control appears) | Yes | `screens/__tests__/ConversationFlow.test.tsx` — "stages the mock photo pick and hands it to the share preview" |
| CHAT-044 | Conversation | 3390:384 | A message is selected (reaction/context overlay open) | Open attachments | Reaction/selection overlay clears; attachment sheet opens — the two are mutually exclusive in `chatStore`, not merely visually stacked | Yes | `state/__tests__/chatStore.test.ts` — "never opens the attachment sheet and the reaction overlay together"; `screens/__tests__/ChatJourney.test.tsx` — step 8 |

## Photo sharing — `3390:326`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-045 | Conversation | 3390:326 | Photo staged | — | `PhotoSharePreview` renders with a Caption field and Send/Cancel controls | Yes | `components/__tests__/Attachments.test.tsx` — `PhotoSharePreview` describe block; `screens/__tests__/ConversationFlow.test.tsx` — "stages the mock photo pick…" |
| CHAT-046 | Conversation | 3390:326 | Photo staged, caption typed | Press Send | `onSend`/`sendMessage` is called with both the photo uri and the caption | Yes | `components/__tests__/Attachments.test.tsx` — "sends the staged photo with its caption"; `screens/__tests__/ConversationFlow.test.tsx` — "carries a typed caption from the photo preview through to the service" |
| CHAT-047 | Conversation | 3390:326 | Photo staged | Press Cancel | Nothing is sent | Yes | `components/__tests__/Attachments.test.tsx` — "cancels without sending anything" |
| CHAT-048 | Conversation | 3390:326 | Photo message with no body | — | Bubble renders the photo with no caption text beneath it | Yes | `components/__tests__/MessageBubble.test.tsx` — "renders a bare photo message with no caption underneath it" |
| CHAT-049 | Conversation | 3390:326 | Photo message with a body | — | Bubble renders the photo AND its caption together (additive, not either/or) | Yes | `components/__tests__/MessageBubble.test.tsx` — "renders a photo message with its caption underneath the image" |

## Voice notes — `3390:164`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-050 | Conversation | 3390:164 | Recording started | — | Recorder shows labelled Cancel and Send controls | Yes | `components/__tests__/VoiceNote.test.tsx` — "labels cancel and send"; also `__tests__/DesignParity.test.tsx` |
| CHAT-051 | Conversation | 3390:164 | Recording started | 3 seconds elapse | Elapsed timer reads "0:03"; its interval clears on unmount | Yes | `components/__tests__/VoiceNote.test.tsx` — "advances the elapsed timer and clears its interval on unmount" |
| CHAT-052 | Conversation | 3390:164 | Recording in progress | Press "Cancel recording" | Recording discards, no message is sent | **No** | Gap: no test presses "Cancel recording" or asserts `onCancel` fires / the recorder unmounts without sending. Only that the labelled control exists is checked (CHAT-050). |
| CHAT-053 | Conversation | 3390:164 | Recording in progress | Press "Send voice note" | `onSend` is called with the recorded duration (a number) | Yes | `components/__tests__/VoiceNote.test.tsx` — "sends a duration" |
| CHAT-054 | Conversation | 3390:164 | Voice message with `durationMs: 65000` | — | Player shows "1:05"; Play control is labelled "Play voice note" | Yes | `components/__tests__/VoiceNote.test.tsx` — "shows the duration as minutes and seconds"; "labels the play control" |

## Pinned & search — `3390:60`

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-055 | Conversation | 3390:60 | Message `m1` pinned | On the thread | An in-thread "Pinned message" banner shows | Yes | `screens/__tests__/ChatJourney.test.tsx` — step 12 |
| CHAT-056 | Pinned & Search | 3390:60 | Message `m1` pinned | Open Pinned & Search | Pinned list shows the message | Yes | `screens/__tests__/PinnedAndSearch.test.tsx` — "lists pinned messages" |
| CHAT-057 | Pinned & Search | 3390:60 | Thread loaded | Type "coffee" into search | A matching message renders in Results | Yes | `screens/__tests__/PinnedAndSearch.test.tsx` — "finds a message by text" |
| CHAT-058 | Pinned & Search | 3390:60 | Thread loaded | Type "zzzz" into search | "No messages found" renders | Yes | `screens/__tests__/PinnedAndSearch.test.tsx` — "says so when nothing matches" |
| CHAT-059 | Pinned & Search | 3390:60 | `m1` pinned AND matches the search term | Search "coffee" | `m1` renders exactly once (in Pinned), not duplicated into Results | Yes | `screens/__tests__/PinnedAndSearch.test.tsx` — "renders a message that is both pinned and a search hit exactly once" |
| CHAT-060 | Pinned & Search | 3390:60 | Query matches only a pinned message | Search that term | "No messages found" does **not** show (the pinned section already satisfies the query) | Yes | `screens/__tests__/PinnedAndSearch.test.tsx` — "does not say 'No messages found' when a query matches only a pinned message" |

## Moments — `3391:884` (voice), `3391:842` (video)

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-061 | Voice/Video Moment | 3391:884 / 3391:842 | Moment screen open | — | Every control is labelled: Mute + End call (voice); Mute + Turn camera off + End call (video) | Yes | `screens/__tests__/Moments.test.tsx` — "labels every control" (`describe.each`, both screens) |
| CHAT-062 | Voice/Video Moment | 3391:884 / 3391:842 | Moment screen open | Press "End call" | Returns to the thread (`router.back()`) | Yes | `screens/__tests__/Moments.test.tsx` — "returns to the thread when the call ends" (both screens) |
| CHAT-063 | Voice/Video Moment | 3391:884 / 3391:842 | Moment screen open | 3 seconds elapse | Elapsed call timer reads "0:03"; its interval clears on unmount | Yes | `screens/__tests__/Moments.test.tsx` — "advances the elapsed timer and clears its interval on unmount" (both screens) |

Both Moment screens are visual shells with no WebRTC dependency behind them —
by design, not a bug (each screen's own header comment says so). The frames'
other in-call captions ("Together for MM:SS", "KEEP MOMENT", "A little moment
together") are not built; see `__tests__/DesignParity.test.tsx`'s Moment
section, which documents this as a pre-existing, intentional reduction.

## Journey — the A-to-Z session (`screens/__tests__/ChatJourney.test.tsx`)

This is one continuous test, `'walks the whole module A to Z in one continuous
session'` — a single `chatStore` instance carried across screens, unlike every
other suite in this module which resets the store per test. All rows below
are assertions inside that one test, so a failure anywhere in the chain fails
the whole thing; they are listed separately here because each checks a
distinct, real behaviour that only shows up across a continuous session (a
double subscription, a stale snapshot, overlay state leaking between
screens).

| ID | Screen | Precondition | Steps (per the file's own numbering) | Expected | Automated | Test |
|---|---|---|---|---|---|---|
| CHAT-064 | Chat Home | Fresh session | 1. Load Chat Home | Shows the couple's one conversation | Yes | `ChatJourney.test.tsx` |
| CHAT-065 | Conversation | Home unmounted | 2. Enter the thread | Thread renders | Yes | `ChatJourney.test.tsx` |
| CHAT-066 | Conversation | In thread | 3. Send "On my way" | Message appears; `sendMessage` called with `{kind:'text', body:'On my way'}` | Yes | `ChatJourney.test.tsx` |
| CHAT-067 | Conversation | — | 4. Partner typing on, then off | Indicator appears, then clears | Yes | `ChatJourney.test.tsx` |
| CHAT-068 | Conversation | — | 5–6. Long-press a bubble, react | `React ❤️` control appears and reacting attaches the emoji | Yes | `ChatJourney.test.tsx` |
| CHAT-069 | Conversation | — | 7. Reply to `m5`, then cancel | Quoted body appears twice; cancel clears `replyTarget` | Yes | `ChatJourney.test.tsx` |
| CHAT-070 | Conversation | Message selected | 8. Open attachments | Selection overlay clears; attachment sheet opens | Yes | `ChatJourney.test.tsx` |
| CHAT-071 | Conversation | — | 9. Send a photo | Photo bubble renders; sheet closes | Yes | `ChatJourney.test.tsx` |
| CHAT-072 | Conversation | — | 10. Send a voice note | Player shows "1:05" | Yes | `ChatJourney.test.tsx` |
| CHAT-073 | Conversation | — | 11. Save Memory on `m1` | `memoriesService.create` called with title/note/tags containing "coffee"; selection clears | Yes | `ChatJourney.test.tsx` |
| CHAT-074 | Conversation | — | 12. Pin `m1` | "Pinned message" banner appears; thread unmounts | Yes | `ChatJourney.test.tsx` |
| CHAT-075 | Pinned & Search | Thread unmounted | 13. Search "coffee" | `m1` (pinned + hit) renders once; screen unmounts | Yes | `ChatJourney.test.tsx` |
| CHAT-076 | Chat Home | Search unmounted | 16. Return to Chat Home | Preview reflects the newest message in the SAME store the thread just wrote to — not a stale snapshot from this screen's own first load | Yes | `ChatJourney.test.tsx` |
| CHAT-077 | — | — | Steps 14–15 (Moment screens) | Deliberately excluded from this file — see its own header comment: reaching them for real means following `router.push`, which this harness cannot do, so they'd only be a bare remount with none of this file's continuity to offer. Covered separately by `Moments.test.tsx` (CHAT-061..063). | N/A | — |

## Manual only

These cannot be asserted under Jest / React Native Testing Library — they
require a physical device, a human, or hardware jest does not simulate.
Marking them "Yes" here would be dishonest regardless of how much test code
exists elsewhere in this module.

| ID | Screen | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|
| CHAT-078 | Conversation | Message rendered | Long-press a bubble | The press registers as a deliberate hold, not an accidental tap — actual duration/feel of the gesture | No | Manual — long-press timing/feel is a hardware-gesture question; jest's `fireEvent(el, 'longPress')` only simulates the *event*, not the duration threshold. |
| CHAT-079 | Conversation | Message rendered | Swipe a bubble | Swipe-to-reply gesture (not built as a jest-testable interaction) | No | Manual — swipe gestures depend on real touch/pan-responder physics; no swipe-to-reply test exists in this module (reply is triggered via the context menu only in the current build). |
| CHAT-080 | Conversation / Voice notes | Any reaction, send, or record action | Trigger it | Haptic feedback fires appropriately | No | Manual — haptics require real hardware; jest has no haptics engine to assert against. |
| CHAT-081 | Attachments / Voice notes | Attachment sheet or recorder open | Use Camera, or record for real | Real photo/video capture or microphone recording produces a usable file | No | Manual, and presently unbuilt regardless: this module has no `expo-image-picker`/`expo-camera`/audio dependency wired in — Photo staging and voice "recording" are both mocked placeholders (see `AttachmentSheet.tsx` and `VoiceNoteRecorder`'s own header comments). |
| CHAT-082 | Conversation | Keyboard open, composer focused | Type, scroll, react on a physical device | Composer and content stay clear of the keyboard, no clipped controls | No | Manual — keyboard-avoidance behaviour depends on the real OS keyboard and layout engine; not observable under jest's fixed-metrics `SafeAreaProvider`. |
| CHAT-083 | All chat screens | VoiceOver (iOS) / TalkBack (Android) enabled | Swipe through the screen | Reading order matches visual/logical order; every control's accessible name and role make sense read aloud | No | Manual — screen-reader traversal order is a platform accessibility-tree behaviour; jest only confirms a label/role *exists* (`getByLabelText`), never the order screen readers visit them in. |

## Known design divergences

Task 13 built a Figma-parity fixture (`__fixtures__/figma-chat.json`, synced
from the Ziyu Chat frames) and a test suite against it
(`__tests__/DesignParity.test.tsx`). The differences below are real and
reported here rather than silently changed — each is a deliberate "report it,
don't unilaterally fix it" decision, not an oversight. They are presented
neutrally, for triage, not as a verdict.

This list originally ran nine items. Item 3 — "Three transient states are not
built at all" (the header's "Typing…", `ReplyPreview`'s "Replying to Sarah",
`VoiceNoteRecorder`'s "RECORDING…") — has since been fixed and is removed
from the list below rather than left listed as still open; see "Fixes landed
after this catalogue was written" at the end of this document for what
replaced it. The remaining eight are renumbered here to close the gap, so
none of the numbers below match an earlier reading of this file.

1. **Reaction picker emoji.** The frame's six quick reactions (❤️😂🥹😍👍✨)
   and the built `ReactionBar`'s six (🖤❤️😂🥺😍👍) share only 4. *Reported as
   a product/content decision*: the built set was chosen deliberately for a
   two-person relationship app, not copied wrong from the frame.

2. **Attachment sheet sources.** The frame draws Photo / Video / Document /
   Location plus a **Cancel** button; the built `AttachmentSheet` offers
   Photo / Camera / Voice note / Memory, with no Cancel button (dismiss is
   scrim-only). *Reported as a product/content decision*: "Voice note" and
   "Memory" suit this app's two-person relationship use case better than
   "Document"/"Location" would.

3. **Chat Home's preview line.** The frame wraps the preview in quotes and
   prefixes a "Sarah:" attribution; `ChatHomeScreen`'s row has neither.
   *Genuine gap, new scope*: new UI requiring new copy, not a decision
   already made — the same category the removed "transient states" item used
   to be, before a later fix closed it.

4. **Composer placeholder text.** No frame's placeholder matches the built
   app's `"Message Sarah…"` — the frames themselves disagree with each other
   ("Type a message...", "Message...", "Message Sarah..."), and even where a
   frame's wording is close, its ellipsis is three literal periods, while the
   build uses a single typographic ellipsis glyph. *Reported as a
   product/content decision*: the built copy was chosen deliberately; the
   frames were never internally consistent enough to match verbatim either way.

5. **Type ramp.** Message body text renders at 18pt (`body` variant) where
   every frame draws message text at 16pt (matching the `label` token
   instead); bubble timestamps render at 11pt/600 (`caption`) where the frame
   draws 10pt/400 (`countdown`); bottom-nav labels render at 12pt title-case
   where the frame draws 11pt all-caps; Chat Home's headline renders at 34pt
   (`h2`) where the frame draws 44pt/700 (matching neither `h1`'s 40pt nor
   `h2`'s 34pt). *Reported, not changed*: these are shared THEME tokens used
   by every other module in the app, not chat-local values — changing them is
   a design-system change with a blast radius far beyond chat, and the
   existing `theme.contrast.test.ts`/`chatContrast.test.ts` suites are built
   against the current ramp. The ramp's own numbers ARE traceable to Figma
   (`DesignParity.test.tsx`'s type-ramp section proves the tokens exist at the
   right sizes) — the gap is specific components not reaching for the token
   that already matches.

**Also**: frame `3390:4`, "Media & Memories Bridge", is **deliberately not
built** — see spec §4.1. It duplicates the shipped `MemoriesHomeScreen` and
uses a header pattern inconsistent with the rest of `(app)`. Its intent
(moving a chat moment into Memories) ships instead as the **Save Memory**
action (CHAT-036..040), which writes through `memoriesService` — that is the
actual bridge; building the frame literally would create a second, divergent
Memories screen.

6. **Copy does not copy.** `MessageContextMenu`'s Copy item dismisses the
   overlay without copying anything — the same effect as tapping the scrim.
   There is no clipboard dependency anywhere in this project's
   `package.json`, and adding one was outside this task's scope. This is
   commented in-file (`ConversationScreen.tsx`, where `onCopy` is wired) but
   disclosed nowhere a reader would look until now.

7. **Three of the four attachment tiles are inert.** `AttachmentSheet` draws
   Photo / Camera / Voice note / Memory; only Photo wires to real behaviour
   (`onPickPhoto`, staging the mock picker). Camera, Voice note, and Memory
   all call `onClose` and do nothing else.

8. **`MessageGroup` was specified but never built.** Design spec §7 names it
   for shared spacing/avatar handling on consecutive same-author messages. It
   does not appear in the implementation plan, in any task brief, or in the
   code — it was dropped silently somewhere between spec and plan. The
   decision at this point is to disclose the gap rather than build it this
   late; this entry is that disclosure, not a sign-off on the omission.

## Fixes landed after this catalogue was written

Two problems surfaced by review of the completed module, fixed in one pass:
the three transient states removed from "Known design divergences" above,
and a Save Memory failure (or success) that previously left the user with no
signal either way.

| ID | Screen | Figma node | Precondition | Steps | Expected | Automated | Test |
|---|---|---|---|---|---|---|---|
| CHAT-084 | Conversation | 3390:521 | Partner is typing | — | `ChatHeader` reads `isPartnerTyping` (passed down from `ConversationScreen`) and swaps its presence line to "Typing…"; back to "Online" once it clears | Yes | `components/__tests__/ChatHeader.test.tsx` — "swaps to \"Typing…\" while the partner is typing, and back once they stop"; `__tests__/DesignParity.test.tsx` — "mounts the typing indicator…" |
| CHAT-085 | Conversation | 3390:585 | Replying to a message | — | `ReplyPreview` (inside `Composer`) renders a "Replying to Sarah" attribution line above the quoted body | Yes | `components/__tests__/Composer.test.tsx` — "shows the quoted message when replying, attributed to who is being replied to"; `__tests__/DesignParity.test.tsx` — "shows the quoted reply preview the frame draws for its replying state" |
| CHAT-086 | Conversation | 3390:164 | Recording in progress | — | `VoiceNoteRecorder` renders a "RECORDING…" caption alongside the pulsing dot and the elapsed timer | Yes | `components/__tests__/VoiceNote.test.tsx` — "shows the RECORDING… caption alongside the elapsed timer"; `__tests__/DesignParity.test.tsx` — "replaces the composer with the recorder's real controls" |
| CHAT-087 | Conversation | — | Message selected, save succeeds | Save Memory | `FeedbackBanner` appears with "Saved to Memories.", announced via `AccessibilityInfo.announceForAccessibility`, and dismisses itself after ~3s | Yes | `screens/__tests__/SaveMemoryFeedback.test.tsx` — "confirms a successful save through the real context menu, and dismisses itself once its timer elapses"; "announces the save result to screen readers, not just draws it" |
| CHAT-088 | Conversation | — | Message selected, save fails | Save Memory | `FeedbackBanner` appears with "Could not save to Memories. Try again."; the message stays selected (same no-optimistic-dismiss behaviour CHAT-039 already covered) | Yes | `screens/__tests__/SaveMemoryFeedback.test.tsx` — "reports failure through the same control, and leaves the message selected so a retry is possible" |
| CHAT-089 | — | — | `FeedbackBanner` mounted with either tone | — | Banner is announced on mount (`AccessibilityInfo.announceForAccessibility`), carries `accessibilityRole="alert"`, and sets `accessibilityLiveRegion` to `assertive` for an error / `polite` for a success | Yes | `components/feedback/__tests__/FeedbackBanner.test.tsx` — "announces the message to screen readers on mount, not just draws it"; "is marked as an alert, with a live region matched to how urgent the tone is" |

`FeedbackBanner` (`src/components/feedback/FeedbackBanner.tsx`) is the first
component in `src/components/feedback/`, previously an empty directory
(`.gitkeep` only). It takes no chat-specific prop, so a future screen with
its own pass/fail moment to report can reuse it rather than rebuilding one.

## Test-harness footguns this module discovered

Anyone adding a test to this module will hit these. All seven are documented
inline, with the discovering commit, in the files named below.

1. **`fireEvent` is async in RNTL v14 — await every call.** It wraps the
   handler in React's own `act()` internally; firing two events back-to-back
   without awaiting the first races state updates against each other. Seen
   first in `components/__tests__/Attachments.test.tsx` (an unawaited
   `fireEvent.changeText` raced a caption update against a send press,
   producing `onSend('')` instead of `onSend('us')`).

2. **`reset()` inside `act()`, before anything is mounted, silently yields an
   empty render tree on the next `render()` call.** Call it bare instead.
   Documented in `screens/__tests__/PinnedAndSearch.test.tsx` (every test
   failed with "Unable to find an element with accessibility label" until
   this was un-wrapped), and repeated in `ChatHome.test.tsx`,
   `ConversationFlow.test.tsx`, `SaveMemory.test.tsx`, `ChatJourney.test.tsx`,
   and `__tests__/DesignParity.test.tsx`.

3. **After a `userEvent` interaction runs in a file, a bare synchronous
   `act(() => setState(...))` stops triggering re-renders** — use
   `await act(async () => …)` instead. Seen in
   `screens/__tests__/ConversationFlow.test.tsx`'s scrim/reaction test.

4. **An un-awaited synchronous `act()` can silently empty the NEXT test's
   render tree**, not just the current one. `__tests__/DesignParity.test.tsx`
   hit this during development in its Typing-state test and fixed it by
   awaiting an async `act()`.

5. **`render(...).unmount()` is async in RNTL v14** — an un-awaited `unmount()`
   empties the next render's tree. Every multi-screen test in
   `ChatJourney.test.tsx` awaits `.unmount()` for exactly this reason.

6. **`jest.mock` factories require `mock`-prefixed variable names**
   (babel-plugin-jest-hoist's out-of-scope check). `screens/__tests__/Moments.test.tsx`'s
   own comment notes the brief's original `back` variable failed to even
   transform — renamed `mockBack`. `ChatJourney.test.tsx`'s stateful
   `chatService` fake has to define its entire seed and helpers *inside* the
   factory for the same reason (an outside `messages` variable would trip the
   same check) — and even a type annotation referencing an outer type alias
   trips it, so that file uses an inline structural type instead.

7. **`render(...).rerender(...)` is ALSO async in RNTL v14**, the same as
   `unmount()` (item 5) — easy to miss because `rerender` reads like a plain
   synchronous re-invocation of the component. An un-awaited call commits the
   new props on a later microtask than the assertions right after it expect,
   so those assertions see the PREVIOUS render instead. Discovered building
   `components/__tests__/ChatHeader.test.tsx`'s typing/online toggle test: the
   Online-again assertion kept seeing "Typing…" until `rerender(...)` became
   `await rerender(...)`.

## Commands run to build this catalogue

```
npx jest --listTests
```
Confirmed all 15 files below exist and are discovered by the runner:
`__tests__/DesignParity.test.tsx`, `__tests__/truncate.test.ts`,
`components/__tests__/Attachments.test.tsx`, `components/__tests__/Composer.test.tsx`,
`components/__tests__/MessageBubble.test.tsx`, `components/__tests__/ReactionBar.test.tsx`,
`components/__tests__/VoiceNote.test.tsx`, `screens/__tests__/ChatHome.test.tsx`,
`screens/__tests__/ChatJourney.test.tsx`, `screens/__tests__/ConversationFlow.test.tsx`,
`screens/__tests__/Moments.test.tsx`, `screens/__tests__/PinnedAndSearch.test.tsx`,
`screens/__tests__/SaveMemory.test.tsx`, `state/__tests__/chatStore.test.ts`,
`services/chat/__tests__/mock.test.ts` (all under `src/modules/module-03-chat/`
unless noted).

```
npx jest --selectProjects lavender
```
79 suites, 933 tests, all passing at time of writing — no regressions from
compiling this catalogue.
