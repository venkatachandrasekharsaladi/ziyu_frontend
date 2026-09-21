# Build status

_Kept in the repo because it answers the one question anyone integrating with this app needs answered first: what is real and what is a fake. The rest of our product notes (ideas, research, audits) are internal and deliberately untracked — see `.gitignore`._

### 1. What exists

#### 1.1 There is no backend, and never has been

This repository is the Expo frontend only. No server, no database, no API, no
hosting. Verified: a grep for `fetch(`, `axios`, `XMLHttpRequest` and
`WebSocket` across `src/` returns nothing. `src/services/api/generated/` holds
only a `.gitkeep`.

Every "service" is a typed boundary with an in-memory fake behind it. The word
means a swap point, not a server:

| Service | First added | Kind |
|---|---|---|
| `auth` | 2026-08-13 | mock |
| `pairing` | 2026-08-14 | mock |
| `story` | 2026-08-15 | mock |
| `memories` | 2026-08-23 | mock |
| `chat` | 2026-08-30 | mock |
| `plans` | 2026-09-21 | types only |
| `planner` | 2026-09-21 | mock |

Each `index.ts` is one line — `export const chatService = createMockChatService()`
— so a real provider replaces one line per service and nothing else.

`plans` is the odd one out: it is a `types.ts` with no implementation, because
the Plans cluster reads and writes `src/state/plansStore.ts` directly rather
than through a service. The types are still the contract a backend would have
to satisfy.

`planner` is the one to hand to whoever builds the first real backend.
`services/planner/types.ts` is the entire contract — `TripDraft` in, `Trip`
out, `PlannerStage` for progress, errors as codes — and its mock genuinely
plans rather than returning a fixture, so the screens above it are already
written against real behaviour.

**Nothing persists.** `src/state/relationshipStore.ts` says so deliberately:
"Nothing persists. There is no token or record to keep until a real provider
exists." No `expo-secure-store`, no MMKV, no AsyncStorage anywhere.

The only outbound network traffic is image loading: sample photos are fetched
from Unsplash's CDN by `expo-image` at render time. Read-only, and those are
placeholder assets meant to be replaced with the couple's real photographs.

#### 1.2 Modules

Built, with real screens: `module-00-auth`, `module-01-onboarding`,
`module-02-home`, `module-03-chat`, `module-03-memories`, `module-06-plans`.

Empty scaffolding — directories and `.gitkeep` only: `module-04-timeline`,
`module-06-memories`, and most of `module-05-profile` beyond the Our Space
screen.

`module-03-chat` and `module-03-memories` share the number 03, and
`module-06-memories` duplicates the memories module's name. Cosmetic, but
confusing; noted rather than renamed.

#### 1.3 Test and quality state

At the time of writing: **258 suites, 3234 tests passing**, `tsc --noEmit`
clean. The suite runs twice, once per theme (`lavender`, `midnight`).

(Was 168 suites / 1964 tests before the 2026-09-21 session; the Plans cluster
and its tests account for the difference.)

One caveat worth keeping: an intermittent single-test failure was observed once
in six full-suite runs (~17%). It did not reproduce in isolation — the chat
module passed 238/238 across six runs, and `design-system/__tests__` passed
28/28 across six. It appears only under full-suite load and has not been
identified. It is not in the newest code.

---

### 2. Work completed in the 2026-08-30 → 09-01 sessions

#### 2.1 The chat module

Five screens covering 12 of the 13 Figma frames in the `Ziyu` file's Chat
section. Most frames are *states* of one conversation screen rather than
separate destinations.

| Route | Screen |
|---|---|
| `chat/index` | Chat Home |
| `chat/conversation` | Conversation — thread, typing, replying, reactions, attachments, photo share, voice recorder |
| `chat/search` | Pinned & Search |
| `chat/moment/voice` | Voice Moment |
| `chat/moment/video` | Video Moment |

Frame `3390:4` "Media & Memories Bridge" is deliberately not built — it
duplicates the shipped Memories home. Its intent ships as the **Save Memory**
action in the message context menu.

#### 2.2 Bugs found and fixed

These were found by review or by the QA agent, not by the original
implementation:

1. **Data loss.** `chatStore.load()` replaced the message list wholesale, and a
   failed send lives only in store state — so every chat screen mount silently
   deleted the user's unsent text. Now merges.
2. **`retry()` was unreachable.** It existed and was tested, but nothing called
   it, so the spec's promise that a failed send "offers retry" shipped as dead
   code. A failed bubble now carries a retry control.
3. **Photo captions were discarded at two boundaries** — the send path dropped
   the argument, and `MessageBubble` rendered the photo *instead of* the body.
4. **Sign out was unreachable on web.** It was gated behind `Alert.alert`, which
   react-native-web does not implement, so the confirmation never appeared and
   the handler never ran. Replaced with a cross-platform `ConfirmDialog`.
5. **`isSigningOut` never reset**, leaving the button stuck.
6. **`react-hooks/set-state-in-effect`** in `PinnedAndSearchScreen` — a real
   React anti-pattern that passed eleven task reviews because every task ran
   jest and typecheck but nobody ran lint on the module.
7. **Duplicate accessibility labels** reachable in ordinary use — a bodyless
   message bubble's fallback label collided with the composer's input label,
   and read receipts, photos and voice notes each collided with their own kind.
8. **A 320pt layout overflow** in `CodeInput`: six 44pt boxes plus five 8pt gaps
   needs 304pt against 280pt available on an iPhone SE. The onboarding code
   entry was broken on the smallest supported phone.
9. **Two vacuous tests** — assertions that could never execute, one guarded
   behind an `if` that was never true.

#### 2.3 Sample photography

The root cause of mismatched images: every photo was
`picsum.photos/seed/loveos-<subject>`. The seeds read as meaningful
(`rome-coffee`, `flowers`, `candles`) but **picsum does not search — it hashes
the seed to pick an arbitrary photo.** Deterministic, and blind to the seed's
meaning. So a coffee caption sat over a landscape.

Replaced with 21 hand-curated Unsplash photos in `src/sample/photos.ts`, each
one fetched and visually inspected. Keyword services were tried and rejected:
`source.unsplash.com` is dead (503), `loremflickr` burns attribution watermarks
into the pixels, and Openverse indexes mostly amateur work.

#### 2.4 Layout — the single lever

`src/design-system/tokens/layout.ts` now holds `column` (448), `columnWide`
(480) and `columnNarrow` (384). Before this the same value was hardcoded in five
places across two layouts and one screen.

**To change the content width app-wide, edit `column` in that one file.**

40 of 43 screens compose through a shared layout (`AppScreenLayout`,
`AuthScreenLayout`, `StatusScreen`). The three that do not are `WelcomeScreen`
(a hero screen) and the two chat Moment screens (deliberately full-bleed).

`breakpoints.ts` declares `xs: 0` and `md: 768`. Note that Unistyles' inline
breakpoint syntax does not resolve under this repo's Jest mock — verified by
spike — so `useWindowDimensions()` is used where a breakpoint needs to be
testable.

#### 2.5 QA tooling

`.claude/agents/qa-tester.md` — a read-only agent that runs the suites and
checks design parity, contrast, layering and accessibility. It reports; it never
fixes. On its first run it found the lint error above that eleven prior reviews
had missed, and it critiqued its own definition, which was then sharpened.

Note: new agent definitions only register after a Claude Code restart.

---

### 2B. Work completed in the 2026-09-21 session — the Plans cluster

Source: Figma `Tales of Two`, page `New Features` (node 3483:4729). Ten frames,
built as thirteen routes under `/plans` in `module-06-plans`.

#### 2B.1 What shipped

| Figma node | Route | Screen |
|---|---|---|
| 3482:3155 | `/plans` | Our Plans — the hub |
| 3482:374 | `/plans/trip/new` | Plan Something Together (setup form) |
| 3482:15 | `/plans/trip` | The itinerary |
| 3482:1345 | `/plans/year` | Our Year Together — couple bingo |
| 3482:1672 | `/plans/lifetime` | Once in a Lifetime — shared promises |
| 3482:2146 | `/plans/capsules`, `/capsules/new` | Time capsule vault + 3-step wizard |
| 3483:4305 | `/plans/letters`, `/new`, `/[id]` | Letters vault, composer, reading view |
| 3482:2738 | `/plans/watch` | Watch Together |
| 3482:2499 | `/plans/places` | Where we are — shared map |
| 3482:965 | `/plans/trip/preview` | An **alternate** design of the itinerary |
| — | `/plans/trip/generating` | The planner's progress screen (no frame) |

Three frames are whole flows on one artboard, which is why ten frames became
thirteen routes.

**3482:965 and 3482:15 are two iterations of the same screen.** The refined one
ships. The earlier one is rebuilt in our own colour tokens — rather than its
original placeholder greys, which would have made it lose on looking unfinished
instead of on its layout — and parked behind a flag so it can be shown to people
and then kept or deleted. `modules/module-06-plans/preview/README.md` has the
removal steps, and there are three.

Two sticky-notes on that Figma page are **ideas only, never designed**, and are
deliberately not built: a "story of the proposal from each other's perspective"
screen, and "upload a pic, transparent image will be the background of the card".

#### 2B.2 Navigation

The bottom bar gains a **Plans** tab in third place, where 3482:965 draws it.
Profile stays a tab. This is additive on purpose: the previous attempt at this
bar (9cdb245) moved Profile into the header and was reverted in 2cec3f4 as not
what was asked for.

The other frames on that page disagree with each other about the fifth slot —
one draws "Timeline", one "Space", one "Where", one "Watch" — because they are
iterations rather than one design. Rather than pick a winner among four, the bar
gains the one tab every variant agrees on, and the rest of the cluster is
reached through it.

Home also names the cluster: `NextAdventureCard` sits on the dashboard and shows
the trip being planned, or an invitation to plan one. Six features behind a tab
nobody presses is six features nobody finds.

#### 2B.3 The planner — where a backend plugs in

`/plans/trip/new` → "Create our plan" → a progress screen reporting five stages
→ the finished itinerary.

`services/planner/mock.ts` **actually plans.** It resolves a destination, scores
45 catalogued moments against the chosen vibes, drops what the daily budget
cannot carry, and lays the survivors out one per slot per day without repeating
any. Changing the budget or the vibes changes the answer, and the tests assert
exactly that — a planner that only looked clever would demo identically today
and be a rewrite the day a server arrives.

| To do this | Change this |
|---|---|
| Build the real planner | Satisfy `services/planner/types.ts` |
| Switch to it | One line in `services/planner/index.ts` |
| Drop the fake data | Delete `sample/plannerCatalogue.ts` — nothing else reads it |

The progress screen's stage lines each name something the planner genuinely
does. Nothing says "AI is thinking" or quotes a number of sources it did not
read. When a real planner does more, those lines get to say more — and not
before.

**Known limits of the fake:** it knows five destinations (Paris, Kyoto, Amalfi,
Lisbon, Reykjavík) and refuses the rest by name rather than failing oddly, and
its ceiling is 4 nights. That ceiling is not a literal — the form reads
`plannerService.maxNights`, so a real backend raises it without anyone editing
the form.

#### 2B.4 State

One store for the cluster (`src/state/plansStore.ts`), because these features
read each other: sealing a letter changes a count on the hub. Nothing persists,
as everywhere else in this app. The seed is sample content so the designed
layout is what you see; the empty states are still built and still tested, and
the seed becomes empty when a backend lands.

#### 2B.5 Bugs found and fixed

Found by the test suites and by review, not by the original implementation:

1. **`ProgressBar` was invisible to screen readers.** It set
   `accessibilityRole="progressbar"` without `accessible`, so neither the role
   nor the percentage ever reached VoiceOver or TalkBack.
2. **"3 saved spots" over a trip where nothing was saved.** Both the hub and the
   Home card summed every moment under a label that means something narrower.
   Now one shared `selectSavedSpots` selector, so the two cannot drift apart —
   which is exactly how they disagreed in the first place.
3. **The setup form sold trips the planner could not build.** The night stepper
   ran to a hardcoded 14 against a catalogue that fills three days: the *default*
   4-night request already produced an empty day, and 14 produced eleven, under
   a header reading "9 of 41 moments planned". The ceiling now comes from the
   planner.
4. **`Reykjavík` could not be found by typing `Reykjavík`.** The resolver
   lowercased but did not fold accents, so the couple hit a dead end for the
   spelling the app's own suggestion chip had just shown them.
5. **The retry chip on the planner's error screen was a dead end.** It replaces
   onto the same route; if the navigator reuses the component, a run-once
   boolean left the planner never re-running. The guard is now keyed on the
   draft, which also closes a latent render loop.
6. **Unvalidated URL params** reached the planner as `NaN`.
7. **Hardcoded counts** on two screens — "14 titles watched" above a list of 3.
8. **"Until Off" reported "Active: 0 minutes remaining."** The indefinite
   sharing window fell through to the countdown formatter, so live location
   sharing displayed as expired. On a privacy panel, wrong in the reassuring
   direction.

Two repo rules caught real mistakes and are worth knowing about:
`expoImageStyles.test.ts` (a Unistyles style handed to `expo-image` is stripped,
and the image draws 0×0) and `noUntokenisedColours.test.ts` (the video
letterbox is now an enumerated exemption, with its reason written down).

A caution from this session: two tests written against known defects pinned
those defects with literal constants and a *replica* of the code under test.
Both kept passing after the bugs were fixed — green tests certifying bugs that
no longer existed. Both were rewritten to go through the real service.

#### 2B.6 Honest gaps, all commented where they live

- **Watch Together's frame-lock badge is drawn, not implemented.** Two devices
  staying in sync is a server with a clock in it. The seam is
  `WatchRoom.connected` / `position`.
- **The privacy sentence on Shared Places describes an intention, not a
  mechanism.** Nothing leaves the device because nothing is sent anywhere yet.
  Whoever wires the transport owns making that sentence true.
- **"Add to Memories" on Watch Together** flips a button label and writes
  nothing to the memories service.
- **No screen in this cluster has been seen rendering.** Verification is `tsc`
  plus Jest, which catches logic, wiring, accessibility labels and the repo's
  own design rules — not "this looks wrong on a phone".

#### 2B.7 What a device run needs first

1. `npm run android` / `npm run ios` — `expo-video` and `expo-maps` are native
   modules, so **this cluster will not load in Expo Go**.
2. A Google Maps API key in `app.json`, or the map on `/plans/places` renders as
   an empty grey grid. The rest of that screen works regardless.

---

### 3. Controls that do not work, and why

Everything here is **visibly disabled**, following the `live: false` pattern
already used in `src/copy/appNav.ts` for unbuilt nav tabs. None of them are
silently inert — a control that looks pressable and does nothing is worse than
one that looks unavailable.

| Control | Blocked on |
|---|---|
| Google / Apple sign-in (4 buttons across Sign In and Create Account) | `expo-auth-session` **plus real provider credentials** |
| Attachment sheet → Camera | `expo-image-picker` or `expo-camera` |
| Message context menu → Copy | `expo-clipboard` |
| Invitation screen → Copy Code | `expo-clipboard` |
| Reaction bar → more reactions | **No package needed** — no design yet |
| Chat header → More options | **No package needed** — no design yet |

No dependency was added without your decision. All three packages are
first-party Expo and small.

---

### 4. Design divergences from the Figma frames

Recorded in full in `docs/qa/chat-test-cases.md`. Deliberately unfixed and
awaiting triage — several are product decisions rather than defects.

1. Attachment sheet sources — the frame draws Photo / Video / Document /
   Location / Cancel; the build has Photo / Camera / Voice note / Memory and no
   Cancel. "Voice note" and "Memory" arguably suit a two-person app better than
   "Document" and "Location".
2. Chat Home's preview line lacks the frame's "Sarah:" attribution and quotes.
3. Composer placeholder matches no frame, and the frames disagree with each
   other.
4. Type ramp — message body renders 18pt against the frame's 16pt, timestamps
   11pt/600 against 10pt/400, nav 12pt title-case against 11pt caps, Chat Home
   headline 44pt against the theme's 40/34. **These are theme tokens shared with
   every module**, so changing them is a design-system change reaching far
   beyond chat, and the contrast suite is built on the current ramp.
5. Copy does not copy (see §3).
6. Three of the four attachment tiles are inert (see §3).
7. `MessageGroup` was specified in the chat design §7 for shared spacing on
   consecutive same-author messages, and never built. It vanished between spec
   and plan. Disclosed rather than built, because adding it now restructures a
   thread renderer that four tasks stabilised.

One divergence in the spec's own text was found to be wrong and corrected: §9
claimed the Chat Home frame "truncates mid-word". It does not — the text node
holds the full string and the frame visually *clips* it. Word-boundary
truncation is still the better behaviour and stayed; the stated reason was
fixed.

---

### 5. Open decisions

#### 5.1 Dependencies

Whether to add `expo-clipboard`, `expo-image-picker`, and `expo-auth-session`
(the last also needs provider credentials). Unblocks six controls in §3.

#### 5.2 The strategic one

Our internal strategy note (untracked) argues the product's central hypothesis
is currently **untestable**: nothing persists and neither partner can be
notified, so "will a couple open this daily?" cannot be answered by the build
that exists.

Its recommendation, in short: a backend for one narrow slice; a reciprocal daily
prompt implemented as a variant on the existing chat message union, with the
partner's answer masked until you answer; answered prompts auto-writing into
Memories to solve cold start.

Its "do not build" list includes two items from the Figma backlog —
call/video statistics (a quarter of WebRTC work, and a coercive-control
artefact) and the marketplace/ads.

Read that document before acting on this. Its evidence is caveated where thin,
and it should be argued with rather than obeyed.

#### 5.3 No unpair, export, or delete exists

Verified absent from `src/`. For an app holding a couple's intimate data this is
both the breakup question and the safety question — shared intimate data can
become an instrument of control. Currently unaddressed anywhere in the product.

#### 5.4 Nothing is pushed

All work is local on `dev`, which tracks `origin/dev` and is shared. `dev` is 75
commits ahead of `main`. The repository does use feature branches
(`feat/m00-auth-cluster` exists), so these commits arguably belong on one —
they went to `dev` because the spec and plan commits were already there and the
Memories and Home modules landed the same way.

---
