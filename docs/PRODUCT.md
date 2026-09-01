# LoveOS — Product Intelligence, Research and Roadmap

**The single source of truth.** Product understanding, research, audits, feature
ideas, priorities, decisions and build status all live in this one file. Do not
create separate idea, roadmap, backlog or research files — add to this instead.

Last updated: 2026-09-01

---

## How to use this file

Every idea has a **stable ID** (`LOV-nnn`). Update an entry's status rather than
creating a new one. Rejected and deferred ideas stay documented **with the
reason**, so the same idea is not relitigated from scratch every quarter.

Status values: `Proposed` · `Approved` · `In progress` · `Implemented` ·
`Deferred` · `Rejected`

### Where to start, depending on why you are here

| You want to… | Go to |
|---|---|
| Run a team discussion | **Part B** — 10 minutes, five decisions, four real disagreements |
| Decide what to build next | **Part A** §6 backlog, §7 detailed entries |
| Know what is broken | **Part A** §4, or **Part E** for screen-by-screen |
| Know what is built and what is mocked | **Part C** |
| Know who approved what | **Part D** |
| Check the evidence behind a claim | **Part F** |

### Contents

- **Part A — Decisions and roadmap.** What the product is, its weaknesses, the
  prioritised backlog `LOV-001`–`LOV-020`, detailed feature entries,
  frontend-only versus backend-dependent work, AI and automation, what we are
  not thinking about, open questions, deferred and rejected ideas, change log.
- **Part B — Team discussion guide.** Built for a three-person conversation.
- **Part C — Build status.** What exists, what is mocked, test state.
- **Part D — Decision log.** Approvals with quotes, and rulings made unasked,
  each with what it costs if wrong.
- **Part E — Screen audits.** 38 screens, plus the design system.
- **Part F — Research.** Market and competitors (41 sources), the real problems
  couples face, competitor UI patterns, the ranked shortlist, and ideas drawn
  from the codebase itself.

### The one thing to know before reading anything else

**Two people on two devices cannot currently pair.** Partner A generates a code
and never learns whether B redeemed it; the mock issues one fixed code. And if a
user taps "Do this later", no screen anywhere in the signed-in app offers
pairing.

A two-person app that two people cannot use together. Everything else is
downstream of that.

# Part A — Decisions and roadmap

## 1. What this product is

**Inferred from the frontend**, which is the only source of truth available — the
backend is being built separately and does not exist in this workspace.

LoveOS (branded **Ziyu** in the Figma file) is a **mobile app for a couple** —
exactly two paired people. It is not a social network, not a dating app, and has
no admin, no roles beyond "me" and "partner", and no multi-tenancy.

Three things it currently does:

1. **Onboards a couple and captures their story** — how they met, first date,
   when they became "us", key dates, a first memory.
2. **Gives them a private conversation** — chat with reactions, photos, voice
   notes, and voice/video "Moments".
3. **Keeps a shared archive** — memories with photos, captions, notes, albums,
   search, and an "on this day" resurfacing route.

**Inference, flagged as such:** the copy (`src/copy/`) is warm, second-person and
unmistakably aimed at an established couple rather than a new one — "Your
memories are waiting", "Now, let's begin your story", "Welcome Home". The sample
content describes a couple with years of history (Rome, Paris, a first date in
2022). The product assumes a relationship that already has a past worth
archiving.

### 1.1 Users

One user type, two instances: **partner A** (who signs up) and **partner B** (who
is invited). There is no third party anywhere in the UI.

The audit found an important asymmetry: **partner A's flow is built; partner B's
is not.** See `LOV-001`.

### 1.2 A note on the audit template

This audit was requested with a template built for B2B SaaS — tables, bulk
actions, saved views, exports, role permissions, admin dashboards, command
palettes. Those sections are answered where they translate and marked **not
applicable** where they do not. A two-person consumer app has no records to
bulk-edit and no roles to permission. Force-fitting them would produce
recommendations that make the product worse.

---

## 2. Current product map

| Module | Lines | State |
|---|---|---|
| `module-03-chat` | 2,778 | Built — 5 screens, 16 components |
| `module-01-onboarding` | 1,905 | Built — 21 screens |
| `module-00-auth` | 1,616 | Built — 6 screens |
| `module-03-memories` | 1,318 | Built — 7 screens |
| `module-02-home` | 999 | Built — 3 screens |
| `module-05-profile` | 124 | **Barely started** — 1 screen |
| `module-04-timeline` | 0 | **Empty scaffolding**, tab stubbed `live: false` |
| `module-06-memories` | 0 | **Empty**, duplicates `module-03-memories` |

Shared: 11 primitives, 14 patterns, 4 components, 48 routes, 2 themes.

**Everything is mock.** No backend, no persistence, no network calls of any kind
(`fetch`, `axios`, `WebSocket` all absent from `src/`). The only outbound traffic
is Unsplash image loading.

---

## 3. Current strengths

Worth stating, because the weaknesses list is long and the codebase is genuinely
better than most at this stage.

1. **The design system is disciplined.** Tokens for colour, spacing, radii,
   typography, elevation and now layout. A test asserts no untokenised colour
   exists outside `tokens/`. Another asserts contrast ratios in both themes.
   Most products this age have neither.
2. **Two complete themes**, with a parity test that makes a missing key a
   compile error.
3. **Consistent screen composition** — 40 of 43 screens go through a shared
   layout.
4. **Service boundaries are honest.** Every service is a typed interface with a
   mock behind a one-line swap point. Replacing mocks with a real backend is a
   one-line change per service.
5. **The copy is genuinely good** — specific, warm, and not templated. This is
   rarer than good code and harder to buy.
6. **1,964 tests**, running against both themes.

---

## 4. Current weaknesses — the three patterns

Three independent audits found the same shape. This is the most useful finding
in the document, because one cause explains all of it.

### 4.1 Display is finished; creation and mutation are not

- A memory **cannot be edited or deleted**. `MemoriesService` exposes only
  `list`, `get`, `create`, `toggleFavorite`, `search`. For a permanent archive, a
  typo is permanent. (`audit/home-memories-profile.md`)
- **The Add Memory photo picker is an empty function** —
  `onPickPhoto = useCallback(() => {}, [])`. Every memory a real user creates is
  text-only, in an app that is photo-first everywhere else.
- Album screens are **hardcoded to `SAMPLE_ALBUMS`**, not gated by
  `USE_SAMPLE_CONTENT` like the rest of the app, so they can never show a real
  couple's content.

### 4.2 The happy path is built; the edges are not

- **No auth or pairing guard anywhere.** `(app)/_layout.tsx` is a bare `<Stack>`.
  Every screen is directly reachable without signing in or pairing. Invisible
  today because nothing persists; a real access-control hole the moment a
  backend lands.
- **No empty, loading, error or offline components exist.** Every screen
  improvises its own `length === 0` branch. "Loading" means rendering chrome with
  no children. There is zero offline handling.
- **Nothing persists.** Close the app at onboarding screen 19 and you restart at
  Welcome.

### 4.3 Single-user flows work; two-party flows do not

And this is a two-party product.

- **Pairing cannot actually complete between two devices.** Partner A's
  `InvitationSentScreen` never learns B redeemed the code — no polling, no shared
  session. The mock issues one fixed code (`L8V7QK`).
- **Skipping pairing is a permanent dead end.** "Do this later" leads to a story
  wizard that assumes a partner, then Home — and **no screen in the signed-in app
  offers pairing.** Verified by grepping the whole `(app)` group.
- Onboarding is **21 screens** (24 Welcome-to-Home), roughly triple comparable
  apps, and the 9-tap shortcut reaches Home having never paired.

**The common cause:** the app was built screen-first from Figma frames. Figma
draws screens. It does not draw guards, empty states, error paths, or the second
person's device.

---

## 5. Domain research

Full detail in `docs/research/couples-app-strategy.md`. The essentials:

### 5.1 The graveyard

| Product | Fate |
|---|---|
| Couple (ex-Pair) | 100k users week one, acquired, dead 2019 |
| Tuned (Meta) | ~909k downloads, shut 2022 |
| Honeydue | 500k users, sunset 31 Aug 2026 |
| Zeta | Absorbed by Acorns, dead 2025 |
| Lasting | Survived only by being absorbed into Talkspace |

**Couple and Tuned were not killed by rival couples apps.** They were killed by
iMessage and WhatsApp — already installed, already holding the couple's history.
Both had built exactly the private-two-person-messenger shape that
`module-03-chat` is.

### 5.2 What users complain about (1–3★ across five leading apps)

| Complaint | Share |
|---|---|
| Everything behind the paywall | 28% |
| Questions repeat, content runs dry | 22% |
| Free trial auto-charged | 19% |
| Partner sync breaks | 16% |
| Generic, not built for *this* relationship | 10% |

Two are structural gifts: **"content runs dry" is unsolvable without an archive**,
and LoveOS has one. **Paired charges per person** (~$75–80/yr each) and is named
for it repeatedly; per-couple pricing is a free differentiator.

### 5.3 The evidence

The **reciprocal daily prompt** is the only mechanic in this category with
published support (JMIR Paired study: 70.6% vs 54.1% report a stronger
relationship, daily vs infrequent users). *Caveat: cross-sectional,
self-selected, reverse causation not ruled out.*

Gottman's famous 90% divorce-prediction figures **were fitted post hoc and did
not cross-validate** (Kim, Capaldi & Crosby 2007). Use for prompt framing; never
build a score on it.

**Streaks have evidence against them.** A study interviewee: *"I'm on a streak of
27 days and he's on 2, it gets to me... feeling like he's not as committed."*

### 5.4 Recommended wedge

**Cohabiting unmarried couples, 1–5 years.** Archive value scales with history
already accumulated, and the existing onboarding (`days-that-matter`,
`first-date`, `first-memory`) already targets exactly them.

---

## 6. Prioritised backlog

`FE` = frontend only · `FE+` = small API · `FS` = moderate full-stack · `BE` = major backend

### P0 — do these first

| ID | Feature | Dep |
|---|---|---|
| LOV-001 | Make two-device pairing actually work | FS |
| LOV-002 | Add a pairing entry point in the signed-in app | FE |
| LOV-003 | Photo picker on Add Memory | FE+ |
| LOV-004 | Edit and delete a memory | FE+ |
| LOV-005 | Route guards on `(app)` and `(onboarding)` | FE |
| LOV-006 | Persist onboarding progress | FE+ |

### P1 — high value

| ID | Feature | Dep |
|---|---|---|
| LOV-007 | The Daily Question with a reciprocity gate | FS |
| LOV-008 | Systematised empty / loading / error states | FE |
| LOV-009 | Shorten onboarding; defer story capture | FE |
| LOV-010 | Export, pause and unpair | FS |
| LOV-011 | Gate album screens behind `USE_SAMPLE_CONTENT` | FE |
| LOV-012 | Draw the Timeline from story data already collected | FE |

### P2 — useful

| ID | Feature | Dep |
|---|---|---|
| LOV-013 | Make the "Drafted note" card real | FE+ |
| LOV-014 | Reciprocal private notes on a memory | FS |
| LOV-015 | Offline handling | FE+ |
| LOV-016 | Build out Profile / settings | FE+ |
| LOV-017 | A repair signal | FS |

### P3 — future

| ID | Feature | Dep |
|---|---|---|
| LOV-018 | Home-screen photo widget | BE |
| LOV-019 | Async presence via the Moment screens | FS |
| LOV-020 | Notifications and "On this day" push | BE |

---

## 7. Detailed feature entries

### LOV-001 — Make two-device pairing actually work

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow
- **Problem:** Two people on two devices cannot complete pairing. Partner A's
  `InvitationSentScreen` never learns B redeemed the code; there is no polling
  and no shared session. The mock issues one fixed code, `L8V7QK`.
- **Evidence:** `docs/audit/auth-onboarding.md`. "Partner sync breaks" is 16% of
  the category's bad reviews (§5.2).
- **Current:** A generates a code, sees a static "sent" screen forever.
- **Proposed:** A sees live state — invited → opened → paired. B receives a deep
  link that opens straight into acceptance.
- **The pattern to copy — Marco Polo** (`competitor-ui-patterns.md`): make the
  invite **non-blocking**. Content can be created *before* the invitee joins, and
  redemption **unlocks** it rather than flipping a silent flag. This reframes the
  bug: the problem is not only that A never learns B joined, it is that A has
  nothing to do while waiting. Pair this with the strategy doc's
  invite-carries-content idea — B receives *"Chandu answered today's question.
  Answer to see it."* — and the invite becomes the product's first moment rather
  than a form.
- **Also worth copying — Cupla** names the "wrong-account problem" explicitly in
  its support docs and makes it self-diagnosable. That is the closest real
  analogue to this app's actual failure symptom.
- **Where it fits:** `InvitePartnerScreen`, `InvitationSentScreen`,
  `EnterPartnerCodeScreen`, `PartnerFoundScreen`.
- **Frontend:** polling or subscription state, live status UI, deep-link handling.
- **Backend:** real code issuance, redemption, and a pair record. **Coordinate.**
- **Success:** two real devices complete pairing without manual intervention.
- **Confidence:** High. This is not an opinion; the flow is provably incomplete.

### LOV-002 — A pairing entry point in the signed-in app

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE
- **Problem:** "Do this later" in onboarding leads to a story wizard that assumes
  a partner, then Home — and **no screen in the signed-in app offers pairing.**
  The skip button is a trapdoor.
- **Evidence:** verified by grepping the entire `(app)` route group.
- **Proposed:** a persistent, dismissible prompt on Home while unpaired, plus a
  pairing entry in Profile.
- **Complexity:** Low. Reuses `InvitePartnerScreen`.
- **Confidence:** High.

### LOV-003 — Photo picker on Add Memory

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE+
- **Problem:** `onPickPhoto = useCallback(() => {}, [])`. Every memory a real
  user creates is text-only, in an app that is photo-first on every other screen.
  The curated grid can only ever be filled by sample data.
- **Frontend:** `expo-image-picker` (**not installed — needs approval**).
- **Backend:** image upload and storage. **Coordinate.**
- **Risk:** permissions handling on both platforms; large-image resizing.
- **Confidence:** High.

### LOV-004 — Edit and delete a memory

- **Status:** Proposed · **Priority:** P0 · **Category:** Core flow · **Dep:** FE+
- **Problem:** `MemoriesService` has no `update` or `delete`. A typo in a
  permanent archive is permanent. This is also half of the breakup problem
  (`LOV-010`) — you cannot remove anything.
- **Proposed:** edit on the detail screen; delete with the existing
  `ConfirmDialog`; soft-delete with a recovery window rather than hard delete.
- **Risk:** in a shared archive, whether one partner may delete a shared memory
  is a **product question, not a technical one.** Open — see §14.

### LOV-005 — Route guards

- **Status:** Proposed · **Priority:** P0 · **Category:** Security · **Dep:** FE
- **Problem:** `(app)/_layout.tsx` is a bare `<Stack>`. Every screen is reachable
  without signing in or pairing. Harmless today because nothing persists; a real
  access-control hole the moment a backend exists.
- **Proposed:** redirect in each group layout based on auth and pairing state.
- **Confidence:** High. **Tell the backend developer now**, not later.

### LOV-007 — The Daily Question with a reciprocity gate

- **Status:** Proposed · **Priority:** P1 · **Category:** Retention · **Dep:** FS
- **Problem:** Nothing gives a couple a reason to open this daily. The archive is
  retrospective; chat competes with iMessage and loses.
- **Evidence:** the only mechanic in the category with published support (§5.3).
  Paired's core loop. *Caveat: the study is cross-sectional and self-selected.*
- **Proposed:** one question a day, delivered as a `prompt` variant on the
  existing chat message union. **Partner A's answer is masked until B answers.**
- **Why the gate matters — one mechanic, three problems:** retention (A now has a
  self-interested reason to nudge B, so the app never guilts anyone), dual
  adoption (attacked without coercion), and content (the value becomes the
  partner's answer, so "content runs dry" stops applying).
- **Where it fits:** `MessageBubble`, `Composer`, `chatStore` — extends what
  exists rather than adding a surface.
- **Success:** **reciprocity completion** — share of prompts where *both*
  answered. Not opens, not DAU.
- **Confidence:** Medium-high on the mechanic; medium on the evidence quality.

### LOV-009 — Shorten onboarding

- **Status:** Proposed · **Priority:** P1 · **Category:** Activation · **Dep:** FE
- **Problem:** 21 screens, ~triple comparable apps, and nothing persists — so any
  interruption restarts it. `PartnerFoundScreen` and `ConfirmPartnerScreen` ask
  the same question back to back.
- **Proposed:** minimum viable path is account → pair → in. Story capture moves
  to a prompted, resumable activity afterwards — which also feeds `LOV-007` and
  `LOV-012`.
- **Confidence:** High on the problem. Medium on the remedy — the story data is
  what makes Home and Timeline valuable, so deferring it has a cost.

### LOV-010 — Export, pause and unpair

- **Status:** Proposed · **Priority:** P1 · **Category:** Trust and safety · **Dep:** FS
- **Problem:** None of these exist anywhere in `src/`. For an app holding a
  couple's intimate data this is both the breakup question and the safety
  question.
- **Evidence:** when Couple shut down, users had to fight to get their history
  out. Shared intimate data in a controlling relationship becomes an instrument
  of control.
- **Proposed:** *Take my copy* (export, always available, per person) · *Pause our
  space* (reversible, freezes writes, keeps reads — for the fight that is not the
  end) · *Unpair* (either side, both notified, grace window).
- **Note:** cheap now because it constrains the pairing schema; expensive later.
- **Safety requirement:** export and unpair must be reachable **without
  generating a notification the other partner sees.**

### LOV-012 — Draw the Timeline from story data already collected

- **Status:** Proposed · **Priority:** P1 · **Category:** Activation · **Dep:** FE
- **Problem:** Onboarding spends 21 screens capturing a narrative — `met`,
  `firstDate`, `becameUs`, `firstMemory`, `keyDates` — and there is no screen that
  tells it back. `module-04-timeline` has no `.tsx` files; its tab is
  `live: false`.
- **Why it is cheap:** store, types, mock service, copy and nav slot all exist.
  Mostly composition.
- **Tension, stated honestly:** this would be a *third* retrospective surface
  alongside Home and Memories, and §5 argues the product has too many already.
  **Reconciliation:** build it as where answered prompts accumulate — so
  `LOV-007` ships first and this follows it.

### LOV-013 — Make the "Drafted note" card real

- **Status:** Proposed · **Priority:** P2 · **Category:** Differentiation · **Dep:** FE+
- **Problem/opportunity:** `src/copy/chat.ts` defines a Chat Home card reading
  *"A little something is being written for you."* It has no service behind it and
  is non-interactive.
- **Proposed:** a place for the thing you are not ready to send — the
  half-written apology, the note to be found later.
- **Why it rates:** for couples the unsent thought is often the important one,
  nothing in the category has it, and it works **asymmetrically** — valuable even
  when only one partner uses it, which matters given dual adoption.
- **Open question:** private until sent, or does the partner see *something* is
  being written? The copy implies the latter — more interesting, and more
  dangerous for an unhappy couple.

### LOV-014 — Reciprocal private notes on a memory

- **Status:** Proposed · **Priority:** P2 · **Category:** Differentiation · **Dep:** FS
- **Proposed:** each partner writes a private note on a shared memory; neither is
  revealed until both have. `Memory.note` exists today as a single shared field.
- **Why:** makes the archive active rather than retrospective, and gives an old
  photo a reason to be reopened. Applies the `LOV-007` mechanic to the asset
  competitors lack.
- **Confidence:** Speculative. Not seen in the category — either an opportunity
  or a sign it does not work. Cheap enough to find out.

### LOV-017 — A repair signal

- **Status:** Proposed · **Priority:** **P1 (raised from P2, 2026-09-01)** ·
  **Category:** Differentiation · **Dep:** FS
- **Why raised:** `couples-real-problems.md` ranks conflict repair as **the best
  mechanistic fit of any problem** for a chat-and-memory product — asynchronous,
  low-arousal, opt-in — and finds it unaddressed by LoveOS today. This idea was
  proposed from intuition before that research existed; the two arrived at the
  same conclusion independently.
- **Problem:** every app here helps couples connect when things are already fine.
  None help in the hour after an argument, when neither person knows how to
  start — which is when relationships are actually decided.
- **Evidence:** repair attempts are the part of Gottman's work that holds up
  (§5.3).
- **Proposed:** one non-verbal signal — "I'm ready when you are" — sendable
  without having to find words.
- **Risk:** highest emotional value here and the highest execution risk. Done
  badly it trivialises a real moment. In a controlling relationship, "why haven't
  you sent it yet" becomes a new pressure surface.

---

## 8. Frontend-only — start now, no backend needed

1. `LOV-002` pairing entry point in-app
2. `LOV-005` route guards
3. `LOV-008` empty / loading / error components
4. `LOV-009` shorten onboarding, merge the duplicate confirmation
5. `LOV-011` gate the album screens behind `USE_SAMPLE_CONTENT`
6. `LOV-012` Timeline from existing story data
7. Reachability: nothing in `(app)` offers pairing — verified
8. Delete `module-06-memories` (empty duplicate) and resolve the `module-03`
   numbering collision

---

## 9. Needs backend coordination — raise these now

1. `LOV-001` pairing: code issuance, redemption, pair record, live status
2. `LOV-005` **route guards need a real session** — raise before the API is fixed
3. `LOV-003` image upload and storage
4. `LOV-004` update and delete endpoints, and the soft-delete decision
5. `LOV-006` persistence — the single biggest blocker in the product
6. `LOV-007` prompt scheduling, answer storage, the reveal gate
7. `LOV-010` export format, unpair semantics, data retention on unpair
8. `LOV-020` push notifications

**The one to raise first:** nothing persists and neither partner can be notified,
so *"will a couple open this daily?"* cannot be answered by the build that
exists. Every other question is downstream of that.

---

## 10. AI opportunities — and where AI is the wrong answer

**Where AI is genuinely appropriate:**

- **`LOV-A1` — Prompt selection that adapts to the couple.** Not generated
  questions; *selected* ones, informed by what they have already answered and
  what they never engage with. Directly attacks the 22% "questions repeat"
  complaint. Ordinary ranking may be enough — try that first.
- **`LOV-A2` — Memory resurfacing worth seeing.** "On this day" is date-matching.
  Semantic grouping ("your first trips", "rainy days") would surface things
  chronology cannot. Needs embeddings over the archive.

**Where AI is the wrong answer, said plainly:**

- **Do not make "LOVEOS AI" real yet.** It is a static card. The moment it
  becomes an assistant, *"do you train on our messages?"* is the first question
  anyone asks — and there is no encryption story to answer it with.
- **Not for search.** The archive is tens of items, not thousands. Ordinary
  text search is faster, cheaper and more predictable.
- **Not for relationship advice.** That is a clinical boundary. See §14.
- **Not for writing messages to your partner.** The one thing this product
  cannot outsource is sincerity.

---

## 11. Automation opportunities

- **`LOV-AU1` — Answered prompts become memories automatically.** Current: the
  archive only grows when someone deliberately adds to it, and Memories opens
  empty for a real couple. Automation: when both partners answer, the exchange
  writes itself in. Solves cold start *and* the content treadmill with one
  change. **Dep:** FS. Depends on `LOV-007`.
- **`LOV-AU2` — Key dates become occasions without manual entry.** Onboarding
  already captures anniversaries and birthdays; Home and Calendar already read
  them. Close the loop so reminders generate themselves. **Dep:** FE+.

---

## 12. What are we not thinking about?

The section worth re-reading.

1. **The product cannot currently be tested by two people.** Everything is built
   for one device. This is not a feature gap; it means the core hypothesis is
   unfalsifiable.
2. **Memories has no way out — no edit, no delete, no export.** A permanent
   archive nobody can correct is a liability, not a feature.
3. **Nobody has designed the unhappy couple.** Every screen assumes affection.
   What does this app do when one partner has checked out? When they are
   fighting? When it is ending? Those are not edge cases; they are a large
   fraction of any real user base at any moment.
4. **The 21-screen onboarding is a bet that couples will invest before receiving
   value.** No evidence supports that; the category evidence points the other way.
5. **"Private by design" is already written in the copy and nothing backs it.**
   Promising E2EE and shipping TLS is worse than promising nothing.
6. **The archive is the only defensible asset** — chat is commoditised by
   iMessage, prompts are copyable in a sprint. Yet the archive is the module
   where creation is most broken (§4.1).
7. **The skip button is a trapdoor** (`LOV-002`). Somebody added it to reduce
   friction and accidentally built a state the product cannot recover from.

---

## 13. Roadmap

**Build now — frontend, no backend needed:** `LOV-002`, `LOV-005`, `LOV-008`,
`LOV-011`, `LOV-009`, plus deleting the empty duplicate module.

**Coordinate with backend immediately:** persistence (`LOV-006`), pairing
(`LOV-001`), session for guards (`LOV-005`), image upload (`LOV-003`).

**Build next, once a backend exists:** `LOV-007` the Daily Question, `LOV-AU1`
prompts-become-memories, `LOV-004` edit/delete, `LOV-010` the exit.

**Future:** `LOV-012` Timeline, `LOV-013` Drafted note, `LOV-014` reciprocal
notes, `LOV-017` repair signal, `LOV-018` widget, `LOV-020` notifications.

---

## 14. Open product questions

1. **Can one partner delete a shared memory?** Affects `LOV-004` schema.
2. **Is a draft visible-as-existing to the partner, or fully private?**
   (`LOV-013`)
3. **Per-couple or per-person pricing?** Per-couple is free differentiation
   against Paired — but decide the *shape* now, the number after retention is
   known.
4. **What is the duty of care when a relationship is ending?** A product
   optimising for connection needs an answer. Where is the line between wellbeing
   and clinical, and what must never be claimed?
5. **What happens to the data if the company shuts down?** Couple broke this
   promise. Making it now costs nothing.
6. **Long-distance as a positioning test?** A store-listing change, not a build,
   and the only framing where 2,778 lines of chat are a strategic asset.

---

## 15. Deferred

| ID | Idea | Why deferred |
|---|---|---|
| LOV-018 | Home-screen photo widget | Good idea, wrong quarter. A widget on an app nobody opens daily is a widget nobody installs. Needs `LOV-007` proven and a real backend. Native WidgetKit is outside the Expo-managed comfort zone. |
| LOV-019 | Async presence via Moment screens | Only strong under long-distance positioning, which is not the recommended wedge. Also needs `expo-camera`. |
| — | `MessageGroup` component | Specified in the chat design §7, never built. Cosmetic spacing; restructuring the thread renderer now is not worth it. |

## 16. Rejected

| Idea | Why |
|---|---|
| **Call and video statistics** ("22 hours on call") | From the Figma backlog. A quarter of WebRTC work, and a **coercive-control artefact** — cumulative call time becomes evidence to hold against someone. Do not build. |
| **Streaks, scores, compatibility percentages** | Evidence *against*. A study participant: *"I'm on a streak of 27 days and he's on 2, it gets to me."* |
| **In-app marketplace and ads** | From the Figma backlog. "No ads, ever" is worth more as a differentiator than the revenue. |
| **A "days since we last…" counter** | Considered as drift made visible. It is a guilt mechanic wearing a metric. |
| **Chat as a messenger** | Couple and Tuned both built it, both reached scale, both died — killed by iMessage. Keep the surface as a ritual channel; stop adding messenger features. |
| **Making "LOVEOS AI" real** | No encryption story to answer the obvious first question. |

## 17. Research still needed

1. ~~Competitor UI patterns~~ — **DONE**, `docs/research/competitor-ui-patterns.md`.
2. ~~The real problems couples face~~ — **DONE**, `docs/research/couples-real-problems.md`.
3. **Validate the wedge** — cohabiting 1–5 years is reasoned, not tested.
4. **Whether the JMIR daily-prompt finding transfers.** It is the best evidence
   in the category, which is not the same as strong evidence.
5. **Whether a repair signal is used or ignored in the moment it is designed
   for.** Cheap to test, and the whole case for `LOV-017` rests on it.

### 17.1 What the two completed studies changed

**Most of the biggest problems are not software-tractable, and saying so is the
finding.** Ranked by prevalence × severity × tractability
(`couples-real-problems.md`):

| Rank | Problem | Software can help? |
|---|---|---|
| 1 | Feeling unappreciated / unseen | Moderate — only if kept narrow, no gamification |
| 2 | Communication breakdown | **Low-moderate** — *flooding is physiological, not informational* |
| 3 | Mental load / domestic labour | **Low** — *the cognitive noticing, not the list, is the labor* |
| 4 | Money conflict | **Low** — a values-and-trust conflict, not a visibility problem |
| 5 | **Conflict repair** | **Best mechanistic fit for this product** |

Two consequences worth acting on:

- **Do not build a chore or task list.** Shared-task apps have existed for years
  without moving the mental load, because the noticing is the labour. It would
  look like addressing the problem while missing it entirely.
- **Conflict repair is asynchronous, low-arousal and opt-in** — which is exactly
  what a chat-and-memory product already is. `LOV-017` was proposed from
  intuition *before* this research existed and the research arrived at the same
  place by a different route. **Independent convergence is the strongest signal
  in this exercise.**

**What the category systematically ignores:** relationships in genuine crisis —
infidelity aftermath, addiction, caregiving strain, infertility, a checked-out
partner. Avoided because they are clinical-adjacent, low-frequency per couple
(poor retention loops), and legally risky for a wellness brand. Lasting's own
reviewers concede the app *"is unlikely to save a marriage where one partner is
disengaged."* Treat that as the category's working assumption, not an edge case
— and see §14 question 4.

---

## 18. Change log

| Date | Change |
|---|---|
| 2026-09-01 | File created. Consolidates `research/shortlist.md`, `research/codebase-ideas.md`, and three audit documents into one source of truth. IDs `LOV-001`–`LOV-020` assigned. |
| 2026-09-01 | Audits completed: 27 auth/onboarding screens, 11 home/memories/profile screens, design system. |
| 2026-09-01 | Both outstanding studies completed. `LOV-017` raised P2 → P1 on independent convergence. `LOV-001` gained the Marco Polo non-blocking-invite pattern. §17.1 records that most top-ranked couple problems are **not** software-tractable. |
| 2026-08-31 | Market research completed (`research/couples-app-strategy.md`, 41 sources). |

---

# Part B — Team discussion guide

## Before the meeting — 10 minutes each

Everyone reads this file. Then one document each, so all three perspectives are
in the room:

| Person | Reads | Comes ready to argue |
|---|---|---|
| Whoever owns product | `docs/PRODUCT.md` §4, §12 | What is broken and what we are not thinking about |
| Whoever owns frontend | `docs/audit/` (three files) | What is cheap to fix now versus what needs the backend |
| Whoever owns strategy | `docs/research/shortlist.md` + `couples-real-problems.md` §1 | Which problems are worth solving at all |

---

## The one fact everything else depends on

**Two people on two devices cannot currently pair.** Partner A generates a code
and never learns whether B redeemed it. The mock issues one fixed code
(`L8V7QK`). And if a user taps "Do this later", **no screen anywhere in the
signed-in app offers pairing** — the skip button is a trapdoor.

So today, this two-person app cannot be used by two people together.

Everything below is downstream of that. If the meeting only produces one
decision, make it this one.

---

## Decision 1 — What is the next thing built?

The two candidates are both defensible and they pull in different directions.

**Option A — fix the plumbing.** Pairing, persistence, route guards, photo
picker, edit/delete. Unglamorous. But without it there is no product to test and
no way to answer any other question.

**Option B — build the Daily Question.** One question a day, partner's answer
masked until you answer. The only mechanic in this category with published
evidence, and small in code — a variant on the chat message type you already
have.

**The honest tension:** B is the more interesting bet and the research's top
recommendation, but B *requires* A. A prompt neither partner can be notified
about, in an app where nothing persists, cannot be evaluated. You can build B's
UI now against mocks — but you cannot learn anything from it.

**A suggested resolution to argue with:** do the narrow slice of A that unblocks
B specifically — accounts, pairing, one shared object, push — rather than a
complete backend. Then B.

---

## Decision 2 — Three dependencies, yes or no

`expo-clipboard`, `expo-image-picker`, `expo-auth-session` (the last also needs
Google/Apple credentials). All first-party Expo, all small.

They unblock six controls that are currently visibly disabled, including
**adding a photo to a memory** — which today is an empty function, meaning every
memory a real user creates is text-only in a photo-first app.

I did not add them without your call. This one should take thirty seconds.

---

## Decision 3 — Who is this for?

The research recommends **cohabiting unmarried couples, 1–5 years**, because the
archive's value scales with history already accumulated, and your onboarding
(`days-that-matter`, `first-date`, `first-memory`) already targets exactly them.

The alternative worth arguing: **long-distance**. It is a store-listing change
rather than a build, has the highest daily-contact motive of any segment, and is
**the only framing in which your 2,778 lines of chat are a strategic asset rather
than a sunk cost.**

You do not have to pick permanently. But the answer changes whether the Moment
screens are worth finishing.

---

## Decision 4 — Onboarding is 21 screens

24 from Welcome to Home. Roughly triple comparable apps. Nothing persists, so any
interruption restarts it. Two screens ask the same question back to back.

**But** the story it collects is what makes Home, Calendar and Occasions
worthwhile, and would make Timeline worthwhile.

Cutting it is obviously right and not obviously free. Decide what the minimum
path to a paired couple is, and what moves to afterwards.

---

## Decision 5 — Pricing shape (not the number)

Paired charges roughly **$75–80/year per person** and is criticised for it
repeatedly in reviews. Cupla charges per couple.

Do not set a number before you know retention. Do decide the shape — per-couple
is free differentiation on a decision you have not yet made.

---

## The four real disagreements

Where the evidence genuinely conflicts. These deserve the argument.

**1. Is the chat module an asset or a mistake?**
The graveyard is unambiguous: Couple and Tuned both built a private two-person
messenger, both reached real scale, both died — killed by iMessage, not by
rivals. The research says stop investing.
*But* its own top recommendation, the Daily Question, lives **inside** that chat
surface. The argument is against messenger *features*, not the surface. Someone
should push on whether that distinction is real or a rationalisation.

**2. Should Timeline be built?**
It is the cheapest real feature available — the data exists, the store exists,
the tab is stubbed. *But* it would be a **third** retrospective surface, and the
research argues you already have too many. Proposed reconciliation: build it as
where answered prompts accumulate, so it follows the Daily Question rather than
preceding it.

**3. The repair signal — highest value or highest risk?**
Two independent routes reached it: intuition from reading your code, and the
problems research ranking conflict repair as the best mechanistic fit for a
chat-and-memory product. That convergence is the strongest signal in the whole
exercise.
*But* it is also the easiest to get wrong. Done badly, a button trivialises a
real moment. And in a controlling relationship, "why haven't you sent it yet"
becomes a new pressure surface.

**4. How much can software actually do here?**
Uncomfortable, and worth facing together: most of the highest-prevalence couple
problems rank **low** on software tractability. Communication breakdown is
physiological, not informational. The mental load is not a list problem — the
cognitive *noticing* is the labour, which is why years of shared-task apps have
not moved it.
If that is right, the honest product is narrower than the ambition. Better to
agree on that now than discover it in reviews.

---

## The question nobody has answered

**What does this app do when a couple is not happy?**

Every screen assumes affection. There is no design for a couple mid-fight, for
one partner who has checked out, or for a relationship that is ending. Those are
not edge cases — at any moment they are a large share of any real user base.

Related, and currently absent from the code entirely: **no unpair, no export, no
delete.** That is both the breakup question and the safety question, since shared
intimate data in a controlling relationship becomes a weapon.

The category's own posture is telling. Lasting's reviewers concede it *"is
unlikely to save a marriage where one partner is disengaged."* You can decide
that is fine and out of scope — but decide it deliberately, and say so in the
product rather than implying otherwise.

---

## What can start immediately, whatever you decide

None of these need the backend or a dependency:

1. A pairing entry point in the signed-in app — closes the trapdoor
2. Route guards on `(app)` and `(onboarding)` — nothing currently checks anything
3. Empty / loading / error components — none exist; every screen improvises
4. Gate the album screens behind `USE_SAMPLE_CONTENT` — they can never show real data today
5. Merge the two duplicate confirmation screens
6. Delete the empty `module-06-memories`

---

## A note on the state of the code

Worth saying, because the problem lists above are long: the codebase is in good
shape. Tokenised design system with tests that enforce it, two complete themes,
consistent screen composition, honest service boundaries, 1,964 tests, and copy
that is genuinely well written.

The gaps are not sloppiness. They follow from having built screen-first from
Figma frames — and Figma does not draw guards, empty states, error paths, or the
second person's device. That is a normal place to be, and it is fixable in a
known order.

---

# Part C — Build status

#### 1. What exists

##### 1.1 There is no backend, and never has been

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

Each `index.ts` is one line — `export const chatService = createMockChatService()`
— so a real provider replaces one line per service and nothing else.

**Nothing persists.** `src/state/relationshipStore.ts` says so deliberately:
"Nothing persists. There is no token or record to keep until a real provider
exists." No `expo-secure-store`, no MMKV, no AsyncStorage anywhere.

The only outbound network traffic is image loading: sample photos are fetched
from Unsplash's CDN by `expo-image` at render time. Read-only, and those are
placeholder assets meant to be replaced with the couple's real photographs.

##### 1.2 Modules

Built, with real screens: `module-00-auth`, `module-01-onboarding`,
`module-02-home`, `module-03-chat`, `module-03-memories`.

Empty scaffolding — directories and `.gitkeep` only: `module-04-timeline`,
`module-06-memories`, and most of `module-05-profile` beyond the Our Space
screen.

`module-03-chat` and `module-03-memories` share the number 03, and
`module-06-memories` duplicates the memories module's name. Cosmetic, but
confusing; noted rather than renamed.

##### 1.3 Test and quality state

At the time of writing: **168 suites, 1964 tests passing**, `tsc --noEmit`
clean. The suite runs twice, once per theme (`lavender`, `midnight`).

One caveat worth keeping: an intermittent single-test failure was observed once
in six full-suite runs (~17%). It did not reproduce in isolation — the chat
module passed 238/238 across six runs, and `design-system/__tests__` passed
28/28 across six. It appears only under full-suite load and has not been
identified. It is not in the newest code.

---

#### 2. Work completed in the 2026-08-30 → 09-01 sessions

##### 2.1 The chat module

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

##### 2.2 Bugs found and fixed

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

##### 2.3 Sample photography

The root cause of mismatched images: every photo was
`picsum.photos/seed/loveos-<subject>`. The seeds read as meaningful
(`rome-coffee`, `flowers`, `candles`) but **picsum does not search — it hashes
the seed to pick an arbitrary photo.** Deterministic, and blind to the seed's
meaning. So a coffee caption sat over a landscape.

Replaced with 21 hand-curated Unsplash photos in `src/sample/photos.ts`, each
one fetched and visually inspected. Keyword services were tried and rejected:
`source.unsplash.com` is dead (503), `loremflickr` burns attribution watermarks
into the pixels, and Openverse indexes mostly amateur work.

##### 2.4 Layout — the single lever

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

##### 2.5 QA tooling

`.claude/agents/qa-tester.md` — a read-only agent that runs the suites and
checks design parity, contrast, layering and accessibility. It reports; it never
fixes. On its first run it found the lint error above that eleven prior reviews
had missed, and it critiqued its own definition, which was then sharpened.

Note: new agent definitions only register after a Claude Code restart.

---

#### 3. Controls that do not work, and why

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

#### 4. Design divergences from the Figma frames

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

#### 5. Open decisions

##### 5.1 Dependencies

Whether to add `expo-clipboard`, `expo-image-picker`, and `expo-auth-session`
(the last also needs provider credentials). Unblocks six controls in §3.

##### 5.2 The strategic one

`docs/research/couples-app-strategy.md` argues the product's central hypothesis
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

##### 5.3 No unpair, export, or delete exists

Verified absent from `src/`. For an app holding a couple's intimate data this is
both the breakup question and the safety question — shared intimate data can
become an instrument of control. Currently unaddressed anywhere in the product.

##### 5.4 Nothing is pushed

All work is local on `dev`, which tracks `origin/dev` and is shared. `dev` is 75
commits ahead of `main`. The repository does use feature branches
(`feat/m00-auth-cluster` exists), so these commits arguably belong on one —
they went to `dev` because the spec and plan commits were already there and the
Memories and Home modules landed the same way.

---

# Part D — Decision log

#### 2026-08-30 — Chat module

##### Approved by Praveen

| # | Decision | How it was asked | His answer | What it does in the code |
|---|---|---|---|---|
| A1 | **Data layer: mock, not a real backend** | Offered mock / mock+persistence / real backend | "Mock service, same pattern (Recommended)" | `src/services/chat/` — in-memory, one-line swap point in `index.ts`. Nothing persists. |
| A2 | **Palette: chat-scoped, contrast-safe** | Offered chat-scoped / re-palette whole app / ignore new styles | "Chat-scoped, contrast-safe (Recommended)" | Fuschia + Iris added to `tokens/colors.ts`; only chat consumes them. Fuschia barred from body text (measured 3.09:1). |
| A3 | **Scope: the 13 drawn frames only** | Offered drawn frames / + call stats / everything in the backlog | "Build the 13 drawn frames only (Recommended)" | Call stats, in-chat notes, calendar booking and the photo widget were backlogged, not built. |
| A4 | **Design parity: structural + agent review** | He asked "Which one do you think is best?" rather than choosing | Deferred to Claude's recommendation | Claude recommended structural parity with a committed fixture; pixel-diff and Playwright were rejected with reasons. See R12. |
| A5 | **Spec approved** | Spec written, review requested | "yes go ahead" | `docs/superpowers/specs/2026-08-30-chat-module-design.md` became the binding contract. |
| A6 | **Execution: subagent-driven** | Offered subagent-driven / inline | "1" | 16 tasks, each with a fresh implementer, a review, and its own commit. |
| A7 | **Run all remaining tasks** | Asked whether to continue or pause after task 9 | "please continue and complete all the tasks" | Tasks 10–16 ran without further check-ins. |
| A8 | **Integration: keep local** | Offered keep local / push to origin/dev / feature branch + PR | "Keep local, I'll handle it" | Nothing pushed. All commits remain on local `dev`. |

##### Ruled by Claude — no approval sought

These were decided during the build. Each says what it costs if wrong.

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R1 | `load()` must guard against double-subscription | Two screens mounting in one session would subscribe twice and duplicate every partner message | A reset that stops listening; visible immediately in tests |
| R2 | AttachmentSheet's photo tile gets label "Choose photo" | Two elements labelled "Photo" make an accessibility query ambiguous | A screen-reader label slightly more verbose than its visible text |
| R3 | The plan's `memoriesService.create({note, mediaUri})` was wrong on three counts | The real API requires `title`, `date`, `tags`, uses `photoUri`, and returns a `Result` union | One task's test rewritten |
| R4 | Stop instructing implementers to run prettier | **An implementer refused and was right** — the repo has no prettier config, so bare prettier rewrites against house style | None; formatting stays hand-matched |
| R5 | Implement the spec's failed-send retry rather than cut it | `'failed'` was declared but never emitted anywhere; the spec promised retry | One extra fix round on two files |
| R6 | **Task 6 must build the conversation header** — the plan never did | Found by grepping all 16 briefs: without it, the Moment screens would be unreachable dead routes and the journey test would have no trigger | A larger diff than the brief specified |
| R7 | Park the Save-Memory failure UX | No toast primitive existed anywhere; building one is a design-system task, not a chat task | A user whose save fails sees nothing — later fixed, see A11 |
| R8 | **Overruled by the review, and accepted** | Claude proposed hiding the Pinned section during search; the reviewer showed that was an invented mode-switch discarding what the user came for | n/a — the reviewer's fix shipped |
| R9 | Document, don't fix, the Figma parity divergences | Several are product decisions, and the type-ramp values are theme tokens shared with every module | The build differs from the frames in listed, visible ways |
| R10 | Disclose rather than build `MessageGroup` | Cosmetic spacing; building it would restructure a thread renderer four tasks had stabilised | Consecutive messages keep uniform spacing |
| R11 | Fix the `set-state-in-effect` lint error | Real React anti-pattern in shipped code, found by the QA agent because **no task ever ran lint** | A re-render change on one screen |
| R12 | Reject pixel-diff and Playwright for design parity | Font rasterisation varies per machine; `react-native-web` renders shadows and blur unlike native, so both would report unreal differences | Parity checks values, not arrangement |
| R13 | Park the same-minute duplicate accessibility label | The cross-component collision was fixed; what remains is two same-kind captionless messages in one minute | A screen reader hears the same description twice |

---

#### 2026-08-31 — Images, transient states, error surface

##### Approved by Praveen

| # | Decision | His words | What it does |
|---|---|---|---|
| A9 | **Fix the mismatched images** | "I found something unrelated like showing 'Coffee' but the image is unrelated… please use all related images to it" | Root cause: `picsum.photos` **hashes** seeds rather than searching them. Replaced with 21 hand-verified Unsplash photos in `src/sample/photos.ts`. |
| A10 | **Fix the two flagged gaps** | "Fix it" | The Save-Memory error surface (closing R7) and the three transient states Figma drew. |
| A11 | **Replace weak icons and emoji** | "also replace the best icons/emojis with existed" | Reaction set `🖤❤️😂🥺😍👍` → `❤️😂🥹😍👍✨`. |

##### Ruled by Claude

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R14 | Curated Unsplash IDs over keyword services | `source.unsplash.com` is dead (503); `loremflickr` burns watermarks into pixels; Openverse indexes amateur work. **Every photo was opened and looked at** — a first pass at recalled IDs produced a bearded-man portrait for "couple laughing", the exact reported bug | A photo that reads as wrong to Praveen but not to Claude |
| R15 | Keep `❤️` throughout the onboarding copy | Coherent brand voice across 13 screens; not the reported problem | none |
| R16 | Do **not** change the send icon from `arrow-up` to `send` | Both are conventional — iMessage uses an up arrow. Taste, not a defect | none; reversible in one line |
| R17 | Do not add a composer emoji button, though the frame draws one | It would open nothing — another inert control | The composer differs from the frame |

---

#### 2026-09-01 — Responsiveness, broken controls, research

##### Approved by Praveen

| # | Decision | His words | What it does |
|---|---|---|---|
| A12 | **Every page must work on all mobile screens, with one lever** | "use a best components so that i can easily handle the entire website with one chnage" | `src/design-system/tokens/layout.ts` — `column` is now the single lever. Previously the same value was hardcoded in five places. |
| A13 | **Find and fix what isn't working** | "Check some are not working for example Sign out etc" | Sign out was gated behind `Alert.alert`, **unimplemented in react-native-web** — the dialog never appeared, so the handler never ran. |
| A14 | **Research and suggest** | "use another agent for go through the entire app and analyse all the resources, researchs, use real cases and suggest me" | `docs/research/couples-app-strategy.md`, 729 lines with sources. |
| A15 | **Numbered progress updates** | "everytime i use claude then please add the points that are working or what we work through 1, 2, 3, 4" | Saved to Claude's persistent memory; applies to all future sessions. |
| A16 | **Write it all down** | "have you added these all points in md file?" | `docs/STATUS.md` and this file. The prior build's ledger had been deleted by process, taking the reasoning with it. |

##### Ruled by Claude

| # | Ruling | Why | Cost if wrong |
|---|---|---|---|
| R18 | **Add no dependencies without asking** | Six controls need `expo-clipboard`, `expo-image-picker`, or `expo-auth-session` + credentials. Installing changes `package.json` and risked the running dev server | Six controls stay disabled until Praveen decides |
| R19 | Make unfixable controls **visibly disabled**, not silently inert | Follows the `live: false` pattern already in `appNav.ts`. A control that looks pressable and does nothing is worse than one that looks unavailable | Four buttons look unavailable rather than absent |
| R20 | Prioritise phones (320–430pt), not tablets | He said "all mobile screens" | Tablet layout stays a centred column |
| R21 | Commit to `dev` rather than a feature branch | The spec and plan commits were already there, and Memories and Home landed the same way | 39 commits on a shared branch; still unpushed, so cleanly movable |

---

#### Outstanding — nobody has decided these yet

| # | Question | Blocked on |
|---|---|---|
| O1 | Add `expo-clipboard`, `expo-image-picker`, `expo-auth-session`? | Praveen's call. Unblocks six controls. |
| O2 | What should the reaction overflow and header overflow open? | Needs no package — needs a design decision. |
| O3 | Build persistence and the Daily Question? | The research argues the core hypothesis is untestable without it. |
| O4 | Add unpair / export / delete? | Verified absent from `src/`. Both the breakup and the safety question. |
| O5 | Triage the seven Figma divergences | Listed in `docs/qa/chat-test-cases.md`. |
| O6 | Push, or move to a feature branch? | 39 commits local on `dev`. |

---

#### How to keep this file honest

Add an entry when a decision changes what the product does or defers something.
Quote the approval rather than paraphrasing it — "he was fine with it" is not a
record. For a ruling made without asking, always write the cost of being wrong;
that sentence is what makes it reversible later.

---

# Part E — Screen audits

## Audit: auth-onboarding

### Auth + Onboarding Audit

Scope: `src/modules/module-00-auth/screens/`, `src/modules/module-01-onboarding/screens/`, their routes in `src/app/(auth)/` and `src/app/(onboarding)/`, and `src/copy/`. Read-only audit, no code changed.

Context: LoveOS pairs exactly two people, no roles, no admin. The backend does not exist — `pairingService`, `authService`, `storyService` are in-memory mocks (`src/services/pairing/mock.ts` etc.) and the relationship/story/space state lives in plain Zustand stores with no persistence middleware (`src/state/relationshipStore.ts:28-29` says so directly). Nothing survives an app restart.

#### 1. Routes

`src/app/(auth)/`:
- `welcome.tsx` → WelcomeScreen
- `sign-in.tsx` → SignInScreen
- `sign-up.tsx` → CreateAccountScreen
- `verify-email.tsx` → VerifyEmailScreen
- `forgot-password.tsx` → ForgotPasswordScreen
- `reset-password.tsx` → ResetPasswordScreen

`src/app/(onboarding)/`:
- `setup.tsx` → RelationshipSetupScreen
- `profile.tsx` → CreateProfileScreen
- `invite.tsx` → InvitePartnerScreen
- `invitation-sent.tsx` → InvitationSentScreen
- `enter-code.tsx` → EnterPartnerCodeScreen
- `partner-found.tsx` → PartnerFoundScreen
- `confirm-partner.tsx` → ConfirmPartnerScreen
- `connecting.tsx` → ConnectingScreen
- `connected.tsx` → RelationshipConnectedScreen
- `story-begins.tsx` → OurStoryBeginsScreen
- `story-cover.tsx` → StoryCoverScreen
- `when-we-met.tsx` → WhenWeMetScreen
- `first-date.tsx` → FirstDateMemoryScreen
- `became-us.tsx` → BecameUsScreen
- `first-memory.tsx` → FirstMemoryScreen
- `days-that-matter.tsx` → DaysThatMatterScreen
- `story-recap.tsx` → StoryRecapScreen
- `story-ready.tsx` → StoryReadyScreen
- `personalize.tsx` → PersonalizeSpaceScreen
- `ready-to-come-home.tsx` → ReadyToComeHomeScreen
- `welcome-home.tsx` → WelcomeHomeScreen

Both `_layout.tsx` files (`src/app/(auth)/_layout.tsx`, `src/app/(onboarding)/_layout.tsx`) turn off the native header for the whole group — every screen draws its own chrome via `AuthScreenLayout`.

That's 6 auth screens + 21 onboarding screens = 27 screens total between account creation and the app's home.

#### 2. The onboarding journey, mapped

Navigation is all `expo-router` `router.push`/`router.replace` calls inside each screen — there's no central flow definition. The graph, traced from every screen (`file:line` cites the navigation call):

```
(auth)/welcome
 ├─ Sign Up → CreateAccount → VerifyEmail ─┐
 └─ Sign In → SignIn        → VerifyEmail ─┤
                                            ▼
                              (onboarding)/setup  [3-way fork]
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                         ▼
  "Invite My Partner"    "I Have a Partner Code"      "Do this later"
        ▼                       ▼                         ▼
   CreateProfile          EnterPartnerCode          OurStoryBegins
        ▼                    ▼        \
   InvitePartner       PartnerFound   "need an invite" → setup
        ▼                    ▼
  InvitationSent      ConfirmPartner
   (DEAD END —              ▼
   see §5)              Connecting
                             ▼
                   RelationshipConnected
                             ▼
                      OurStoryBegins  ◄── both branches land here
        ┌───────────────────┴───────────────────┐
        ▼ "Let's Begin"                          ▼ "Skip for now"
   StoryCover                              StoryReady
        ▼ "Let's Begin" / "Skip"                 │
   WhenWeMet → FirstDateMemory → BecameUs         │
     → FirstMemory → DaysThatMatter → StoryRecap  │
                    (saves story) ────────────────┤
                                                   ▼
                                            StoryReady
                                                   ▼
                                         PersonalizeSpace
                                                   ▼
                                       ReadyToComeHome
                                                   ▼
                                          WelcomeHome
                                                   ▼
                                          (app)/home
```

**Step count.** From Welcome to Home:
- Longest complete path (code-redeem pairing + full story capture): **24 screens** — Welcome, CreateAccount, VerifyEmail, RelationshipSetup, EnterPartnerCode, PartnerFound, ConfirmPartner, Connecting, RelationshipConnected, OurStoryBegins, StoryCover, WhenWeMet, FirstDateMemory, BecameUs, FirstMemory, DaysThatMatter, StoryRecap, StoryReady, PersonalizeSpace, ReadyToComeHome, WelcomeHome (21 distinct onboarding screens + 3 auth screens).
- The "invite" branch **cannot complete on one device at all** — see §5. It is a shorter tap-count only because it's a dead end, not because it's a lighter flow.
- Shortest possible path to Home: Welcome, CreateAccount, VerifyEmail, RelationshipSetup ("Do this later"), OurStoryBegins ("Skip for now" → straight to StoryReady), PersonalizeSpace (skip), ReadyToComeHome, WelcomeHome — **9 taps, and the user never pairs with anyone and never enters their name.** RelationshipSetupScreen (`src/modules/module-01-onboarding/screens/RelationshipSetupScreen.tsx:27,43`) and OurStoryBeginsScreen (`OurStoryBeginsScreen.tsx:20`) make both of those skippable.

**Verdict: this is too long, and it's a liability.** 21 onboarding screens for a "pair two people and start a shared space" flow is roughly triple what comparable couples apps (Paired, Between, Raft) ask before first use. Worse, the length is front-loaded with account plumbing (3 auth screens) and back-loaded with a 10-screen "story capture" wizard (StoryCover → StoryReady, all optional) that most users will not have real answers for on day one — meeting dates, first-date locations, "when did you become us" are usually not decided in the first two minutes of using an app. The fact that every one of those ten screens is independently skippable is the right mitigation, but it still means the user taps "skip" or "continue" ten times before reaching Home even when they contribute nothing.

#### 3. Screen-by-screen

##### WelcomeScreen — `src/modules/module-00-auth/screens/WelcomeScreen.tsx`
M00-S01, route `welcome`. Entry point, no back arrow. Shows hero collage, headline/subtitle, "Sign Up" (primary) and "Sign In" (link), privacy footer. Presentation only, no auth/session check. Goes to CreateAccount or SignIn. No previous screen; no error or loading state needed since nothing async happens here.
- Strength: honestly presentation-only, clearly documented as such (`:20-21`).
- Uses `AmbientLayer`, `HeroCollage`, `PrivacyFooter` — see §8 for the uncommitted fixes to these three.

##### SignInScreen — `src/modules/module-00-auth/screens/SignInScreen.tsx`
M00-S02, route `sign-in`. Email/password form (`react-hook-form` + `zod`, `mode: 'onBlur'`). Comes from Welcome or CreateAccount's footer link. On success always pushes to VerifyEmail (`:49`) — a hard-coded decision, documented at `:47-48`, because there's no `(app)` route yet to send an already-verified user to. On failure shows a form-level error and clears only the password field (`:53-55`), keeping the typed email — good recovery. "Forgot password" link and disabled Google/Apple buttons present (per the known deliberate disable).
- **UI exists, backend behavior not verified**: `authService.signIn` is presumably a mock; nothing confirms what a "real" successful sign-in (already-verified user) would do, since the code path is permanently short-circuited to VerifyEmail.
- Problem: an already-verified returning user is forced back through VerifyEmail every sign-in. Minor for a mock, but worth flagging before backend integration.

##### CreateAccountScreen — `src/modules/module-00-auth/screens/CreateAccountScreen.tsx`
M00-S03, route `sign-up`. Email/password + live `PasswordRequirements` checklist, `zod` schema. On `EMAIL_ALREADY_EXISTS` sets the error on the email field specifically rather than a form banner (`:48-50`) — good targeted error recovery. Success → VerifyEmail. Disabled social buttons present.
- Strength: field-level vs. form-level error routing is deliberate and correct.

##### VerifyEmailScreen — `src/modules/module-00-auth/screens/VerifyEmailScreen.tsx`
M00-S04, route `verify-email`. Shows envelope illustration, a 60-second resend cooldown timer, "Resend" (disabled while cooling down), "Continue" (replaces to `/(onboarding)/setup`), "Change Email" (back). No real verification check exists — "Continue" is documented as the user self-asserting they clicked the email link (`:111-117`). This is honest about the gap but means **the verification step is theater**: nothing stops a user from tapping Continue immediately without ever opening an email.
- Strength: countdown format and disabled-button contrast are handled with real care (`:96-107`).
- Problem: no visible state for "I never got the email" beyond Resend; no rate-limit-exceeded messaging shown beyond the generic error map.

##### ForgotPasswordScreen / ResetPasswordScreen
Not in the priority list but read for completeness. Both are well-built: ForgotPassword swaps to a "sent" state in place rather than inventing a new screen ID (`:24-27`), and always reports success regardless of whether the address has an account (`:51`) — correct anti-enumeration behavior. ResetPassword has three real states — no-token, form, success — and is explicit that a successful reset **signs the user out** rather than pretending a session exists that the mock contract doesn't grant (`:33-40`). This is the most carefully reasoned screen in the module.

##### RelationshipSetupScreen — `src/modules/module-01-onboarding/screens/RelationshipSetupScreen.tsx`
M01-S01, route `setup`. The fork point: "Invite My Partner" → CreateProfile, "I Have a Partner Code" → EnterPartnerCode, "Do this later" → OurStoryBegins (skips pairing entirely). No form, no async, no loading/error state needed.
- Problem: "Do this later" lets a user skip pairing and land in a story-capture flow that assumes a partner ("when did you become us," "your first date") without ever having one. There's no return path back to pairing surfaced anywhere later in the flow once you've taken this branch (see §6).

##### CreateProfileScreen — `src/modules/module-01-onboarding/screens/CreateProfileScreen.tsx`
M01-S02, route `profile`. Name (required), nickname, birthday (`DateField` via `Controller`), pronouns (all optional), photo well. Only invite-branch users see this screen — code-redeem users never create a profile here (noted at `RelationshipSetupScreen.tsx:15-16`), so their name is filled from the *other* person's device state or is blank forever, which `ConfirmPartnerScreen.tsx:43-46` explicitly guards against with a `youLabel` fallback.
- **UI exists, backend behavior not verified**: photo picker `onPick` is a stub (`:59`) — `expo-image-picker` isn't installed yet, so avatars are initials-only for the whole flow.
- Form quality: proper `react-hook-form` + `zod`, field-level errors via `FormField`/`DateField`.

##### InvitePartnerScreen — `src/modules/module-01-onboarding/screens/InvitePartnerScreen.tsx`
M01-S03, route `invite`. Issues a code on mount (`pairingService.createInvite`), shows it via `CodeDisplay`, "Share" (native `Share.share`) and "Copy" (documented as **not actually wired** — no `expo-clipboard` — it just advances screens, `:61-66`). Both actions go to InvitationSent.
- Problem: the "Copy" button does not copy anything; it's functionally identical to "Share" minus the OS share sheet, which is confusing since it's labelled Copy.

##### InvitationSentScreen — `src/modules/module-01-onboarding/screens/InvitationSentScreen.tsx`
M01-S05, route `invitation-sent`. This is where the invite-branch **dead-ends** — see §5 for the full analysis. Shows the same code, "Share Again" (with a real web-share/clipboard fallback chain, `:45-83` — genuinely well done for a hard cross-platform problem), "Copy" (permanently disabled, honestly, `:85-90`), "Cancel Invitation" behind a `ConfirmDialog` (not `Alert.alert`, consistent with the known web-Alert gap). Cancelling replaces to `setup`.
- Strength: the transient `FeedbackBanner` for the clipboard-fallback copy, keyed by timestamp so repeat taps re-announce (`:36-43`), is a nice touch matching the pattern used elsewhere in chat.
- **Critical problem**: no mechanism on this screen ever detects the partner accepting and moves the user forward. See §5.

##### EnterPartnerCodeScreen — `src/modules/module-01-onboarding/screens/EnterPartnerCodeScreen.tsx`
M01-S04, route `enter-code`. 6-character `CodeInput`, submit disabled until length 6, error kept until the user edits (`:31-34`, deliberate — a near-miss code shouldn't be retyped from scratch). Success → PartnerFound. "I need an invite" link → back to `setup`. Loading via `Button`'s `loading` prop during submit.
- Only redeemable code in the mock is the fixed `L8V7QK` (`src/services/pairing/mock.ts:15,48`) — every invite issued by `InvitePartnerScreen` is also always `L8V7QK`, so the two branches only ever "connect" by coincidence of a shared hard-coded constant, not by any real handshake. Confirms §5.

##### PartnerFoundScreen — `src/modules/module-01-onboarding/screens/PartnerFoundScreen.tsx`
M01-S06, route `partner-found`. Shows the mock partner's avatar/name, "Confirm" → ConfirmPartner, "Not them" (`reject`) → replace `enter-code`. Guards an empty store (deep link/web reload) by bouncing back to enter-code (`:34-39`) — good empty-state handling, though it renders `null` for one frame while doing so (no spinner, likely invisible in practice given it's synchronous).

##### ConfirmPartnerScreen — `src/modules/module-01-onboarding/screens/ConfirmPartnerScreen.tsx`
M01-S09, route `confirm-partner`. Shows both avatars side by side, "Confirm" → Connecting, "Cancel" → replace `enter-code`. Same empty-store guard as PartnerFound.
- **Problem — redundant confirmation**: this screen asks essentially the same question PartnerFoundScreen just asked ("is this really your person?") one screen later, with no new information added except seeing your own avatar next to theirs. This is the clearest merge candidate in the flow (see §6).

##### ConnectingScreen — `src/modules/module-01-onboarding/screens/ConnectingScreen.tsx`
M01-S07, route `connecting`. Real loading state (`ActivityIndicator`) → calls `pairingService.confirmPartner` → replace `connected` on success, or shows an inline error + Retry button on failure (`:73-84`) — this is the one screen in the whole audit with a textbook loading/error/retry pattern, including an unmount guard so a late response doesn't yank a user who backed out (`:30-43`).

##### RelationshipConnectedScreen — `src/modules/module-01-onboarding/screens/RelationshipConnectedScreen.tsx`
M01-S08, route `connected`. Static confirmation, single "Continue" → replace `story-begins`. Note in the code that a formerly-duplicate M01-S10 screen was retired (`:11-13`) — decision hygiene, not a live issue.

##### OurStoryBeginsScreen — `src/modules/module-01-onboarding/screens/OurStoryBeginsScreen.tsx`
M01-S11, route `story-begins`. The single landing point for **both** the just-connected couple and the "do this later" solo-skip path. "Let's Begin" → StoryCover, "Skip for now" → replace StoryReady. No differentiation in copy or behavior between "you just paired" and "you skipped pairing entirely," which reinforces the RelationshipSetup problem above.

##### StoryCoverScreen / WhenWeMetScreen / FirstDateMemoryScreen / BecameUsScreen / FirstMemoryScreen / DaysThatMatterScreen
Five-to-six-screen "story capture" wizard, all individually optional, each with its own local `useState` (not `react-hook-form`/`zod` — see §9), each writing to `useStoryStore` only on submit, each offering an explicit "Skip" link. `WhenWeMetScreen` is the most sophisticated of these — it has real inline validation (year format, year range, required-date) with `setError`/error-clearing-on-edit (`:40-70`) and a `SegmentedControl` for date precision (exact/month-year/year-only), a genuinely nice bit of UX reasoning (documented `:25-27`).
- **Form quality gap**: `FirstMemoryScreen`, `DaysThatMatterScreen`, `FirstDateMemoryScreen`, `BecameUsScreen` use plain `useState` with no validation at all — every field is free text with no length/format check, inconsistent with the `zod`-validated auth/profile screens and with `WhenWeMetScreen`'s own date validation two screens earlier in the same wizard.
- Story data (dates, notes, photo captions) all live only in `useStoryStore` (no persistence) until `StoryRecapScreen`'s submit — see §7.

##### StoryRecapScreen — `src/modules/module-01-onboarding/screens/StoryRecapScreen.tsx`
M01-S18, route `story-recap`. **The point where the story is actually saved** (`storyService.saveStory`, `:71-85`) — everything upstream only lived in the in-memory `useStoryStore`. Has a real empty state ("nothing to show" card, `:97-106`) for a user who skipped every capture screen, and a real error+loading state on save (`:78-81`, `:145`). One of the two best-instrumented screens in the audit alongside ConnectingScreen.

##### StoryReadyScreen — `src/modules/module-01-onboarding/screens/StoryReadyScreen.tsx`
M01-S19, route `story-ready`. Checklist recap ("added"/"skipped" per item, never fake-checking something the user didn't fill in — `:18-21`). Single "Continue" → PersonalizeSpace. Reached either from StoryRecap (after save) or directly via any of the three "skip" shortcuts (RelationshipSetup's "later," OurStoryBegins' skip, StoryCover's skip) — meaning this screen can render entirely empty rows for a user who took the shortest path, which it explicitly handles well.

##### PersonalizeSpaceScreen — `src/modules/module-01-onboarding/screens/PersonalizeSpaceScreen.tsx`
M01-S20, route `personalize`. Space name (required, validated), short name, cover style (`SegmentedControl`, not a swatch grid — accessibility reasoning at `:17-20`). "Skip" bypasses the required-name validation entirely and still advances (`next` is reused unconditionally as the skip handler).

##### ReadyToComeHomeScreen / WelcomeHomeScreen
Static `StatusScreen`s, single CTA each. Both explicitly drop invented design content that would be dishonest (fake "Paris Trip" memory cards; an "Assistant Ready" line for an assistant that doesn't exist) — documented restraint (`ReadyToComeHomeScreen.tsx:12-16`, `WelcomeHomeScreen.tsx:16-18`). `WelcomeHomeScreen` replaces to `/(app)/home`, correctly closing the onboarding stack so back-navigation into setup is impossible from the app.

#### 4. Where a real user would drop out

1. **InvitationSentScreen** (waiting for a partner to accept) — the single most likely abandonment point in the whole flow. A user shares a code, sees no confirmation their partner did anything, and the only actions available are re-share or cancel. See §5.
2. **The 10-screen story-capture wizard** (StoryCover through StoryRecap/StoryReady) — even though every field is skippable, tapping "Skip" six-plus times in a row before reaching a usable app is exactly the kind of friction that produces mid-flow abandonment, especially since none of this content is needed to use the app.
3. **VerifyEmailScreen**, if a user genuinely waits for an email that (in this mock world) never resolves into a real verified state — the only way through is to self-assert with "Continue," which isn't discoverable as the intended action versus "wait for the real email."
4. **RelationshipSetupScreen**, for the invite-sender specifically — anyone who chooses "Invite My Partner" and gets to InvitationSentScreen has no forward progress available at all (dead end).

#### 5. The partner-invite handoff — make or break

Traced fully: partner A (`RelationshipSetupScreen` → `CreateProfileScreen` → `InvitePartnerScreen` → `InvitationSentScreen`) sees a 6-character code and shares it. Partner B receives **only whatever text `Share.share`/Web Share puts in the message** (`src/copy/invitePartner.ts`'s `shareMessage(code)` — a plain string with the code embedded, no deep link, no app-store link, no context beyond the raw text). Partner B's actual first screen inside the app is `EnterPartnerCodeScreen`, reached however they get there themselves (manually opening the app and navigating to "I Have a Partner Code" — there is **no deep link handling** in `(onboarding)/enter-code.tsx` or anywhere in the routes read that would let a shared link land Partner B directly on this screen with the code pre-filled).

The redemption itself, per `src/services/pairing/mock.ts:14-23,57-67`, only ever succeeds for the single hard-coded code `L8V7QK` — which is also the *only* code `InvitePartnerScreen`'s `createInvite()` ever issues (`mock.ts:44-55`). There is no real code generation, no expiry logic beyond a fixed 2099 date, and critically **no link between the two sides at all**: Partner A's `InvitationSentScreen` never polls, subscribes, or otherwise learns that Partner B redeemed anything. `useRelationshipStore` (`src/state/relationshipStore.ts`) is a single in-memory store — there's no second "session" for it to reflect changes from, since there's no backend and no second device state to sync.

**Conclusion: the invite-and-wait side of pairing is entirely unimplemented as a two-party flow.** It works today only as a demo where one person plays both parts on one device (open Invite Partner, then separately navigate to Enter Code and type the fixed code). For an actual two-person scenario, Partner A currently has no way to ever leave `InvitationSentScreen` except to cancel their own invite. This is the single highest-priority gap in the whole audited surface, and it is squarely the "make-or-break" moment the task asked about.

#### 6. Dead ends

- **InvitationSentScreen** — confirmed dead end. Arriving here (by inviting a partner) leaves no forward path; only "cancel and go back to setup" or re-share the same code. See §5.
- No other unconditional dead end was found — every other screen has at least a Continue/Skip and a Back.
- **Soft dead end / no way back to pairing**: once a user takes RelationshipSetupScreen's "Do this later" or either story-flow "Skip for now," there is no button anywhere downstream (StoryReady, PersonalizeSpace, ReadyToComeHome, WelcomeHome) offering to pair with a partner. The only way back into the pairing flow is to `router.back()` manually or relaunch onboarding from scratch — the "later" promise on `setup.tsx` copy ("Do this later") is not honored by any later screen actually re-surfacing the option.

#### 7. What happens if the app is closed mid-onboarding

Everything written above `StoryRecapScreen`'s save point lives only in memory (`useRelationshipStore`, `useStoryStore`, `useSpaceStore` — all plain `create()` with no `persist` middleware, confirmed by grep: no `AsyncStorage`/`MMKV`/`SecureStore` reference anywhere in `src/state/`). Concretely:
- A user who closes the app after creating a profile, issuing an invite, or entering a code loses all of it — profile name, invite code, redeemed partner, connection status. On relaunch they land back at `welcome` (there's no session/route restoration logic in either `_layout.tsx`) and start completely over, including re-registering (since `authService` itself is presumably equally unpersisted, though that's module-00's concern, not read here).
- Story-flow answers (met date, first date, "became us," first memory, key dates) are lost unless the user reached `StoryRecapScreen` and tapped "Save" — `storyService.saveStory` is the only place any of this is written anywhere durable-sounding, and even that "durable" store is itself a mock.
- Space name/cover style (`PersonalizeSpaceScreen`) is never explicitly "saved" via a service call at all (no `spaceService` found) — it only ever lives in `useSpaceStore`, so it is lost on close regardless of how far past it the user gets.
- Net effect: **any interruption anywhere in this 21-screen flow costs the user everything and restarts them at screen one.** There is no resume, no draft state, no "continue where you left off." For a flow this long, that is a serious reliability problem independent of the missing backend — it will be equally true once a real backend exists unless resumption is explicitly designed in.

#### 8. Empty / loading / error states — screen by screen

| Screen | Loading | Error | Empty |
|---|---|---|---|
| SignInScreen | Button `loading` | Form banner, password cleared | — |
| CreateAccountScreen | Button `loading` | Field-level + form banner | — |
| VerifyEmailScreen | Resend `loading` | Resend error text | — |
| ForgotPasswordScreen | Button `loading` (both states) | Form banner | — |
| ResetPasswordScreen | Button `loading` | Form banner | Explicit no-token state (`StatusScreen`) |
| RelationshipSetupScreen | n/a (no async) | n/a | n/a |
| CreateProfileScreen | Button `loading` | Field-mapped form banner | — |
| InvitePartnerScreen | Code renders only once issued (implicit) | Inline error text | Buttons disabled while `!code` |
| InvitationSentScreen | n/a (code already held) | Cancel-invite error, share-fallback feedback banner | — |
| EnterPartnerCodeScreen | Button `loading` | Kept-on-edit inline error | — |
| PartnerFoundScreen | — | — | Guarded empty-store redirect |
| ConfirmPartnerScreen | — | — | Guarded empty-store redirect, `youLabel` fallback for missing name |
| ConnectingScreen | `ActivityIndicator` | Inline error + Retry, unmount-safe | — |
| RelationshipConnectedScreen | n/a | n/a | n/a |
| Story capture screens (Cover/WhenWeMet/FirstDate/BecameUs/FirstMemory/DaysThatMatter) | n/a (no async until Recap) | Only `WhenWeMetScreen` validates | — |
| StoryRecapScreen | Button `loading` | Save error | **Explicit empty-story card** |
| StoryReadyScreen | — | — | Per-row "skipped" state, handles all-skipped gracefully |
| PersonalizeSpaceScreen | — | Required-name inline error | — |
| ReadyToComeHome / WelcomeHome | n/a | n/a | n/a |

Gaps: none of the six story-capture screens (besides `WhenWeMetScreen`) has any validation or error state — there's simply nothing to fail since they're free-text with no submit call. No screen in the flow has a genuine network-timeout/offline state distinct from its generic error message (the mock's `NETWORK` error code exists in `RESERVED` but is only reachable by typing the magic word "OFFLIN"/"BROKEN" as a code — not something a real network blip would trigger).

#### 9. Form quality

`react-hook-form` + `zod` is used consistently and well in module-00 (all four form screens: SignIn, CreateAccount, ForgotPassword, ResetPassword) and in `CreateProfileScreen` (module-01's only `zod`-validated screen — `src/modules/module-01-onboarding/state/profileSchema.ts`). Common pattern: `mode: 'onBlur'`, `FormField` wrapping `Controller`, error kept until next edit, `setValue`/`setError` used precisely (clearing password on auth failure, targeting the email field for `EMAIL_ALREADY_EXISTS`).

Everything else in module-01 past `CreateProfileScreen` — `EnterPartnerCodeScreen`'s code field, and all six story-capture screens — uses raw `useState` with no schema. `EnterPartnerCodeScreen` at least validates length before enabling submit and defers real validation to the service call. The story screens have no validation at all except `WhenWeMetScreen`'s hand-rolled year/date checks. This is an inconsistency worth deliberately deciding on (either "story fields never need validation because they're free text," which is a defensible product call, or bring them in line with the rest of the app).

Keyboard handling is centralized and good: `AuthScreenLayout` (`src/modules/module-00-auth/components/AuthScreenLayout.tsx:58-73`) wraps every form screen in `KeyboardAvoidingView` (iOS `padding`, Android default) + `ScrollView` with `keyboardShouldPersistTaps="handled"` (explicitly to avoid the classic "first tap only dismisses keyboard" bug). This is shared by every module-00 and module-01 screen alike since they all reuse `AuthScreenLayout`.

#### 10. Which steps could merge, or defer until after pairing

- **PartnerFoundScreen + ConfirmPartnerScreen should merge.** Both ask "is this the right person" one screen apart with no new information gained between them (§3). Collapsing to one confirm screen removes a full step from the code-redeem path.
- **Defer entirely, post-pairing**: the whole story-capture wizard (StoryCover → StoryRecap, 7 screens) and `PersonalizeSpaceScreen`. None of it is needed to use the app; all of it is more naturally filled in once the couple is actually inside their shared space with time to think, not mid-signup. This would cut the onboarding flow roughly in half.
- **Consider merging** `RelationshipConnectedScreen` into `ConnectingScreen`'s success state (a brief success flash before auto-advancing) rather than a second full screen requiring another tap — `RelationshipConnectedScreen`'s own comment already notes a near-identical screen was retired once before (`:11-13`) for being a duplicate.
- **StoryReadyScreen** could be dropped for a solo-skip user (someone who took every skip) since it summarizes only "skipped" rows in that case — it currently still renders for zero-content users.

#### 11. Uncommitted user edits to AmbientLayer / HeroCollage / PrivacyFooter

All three (`git diff` reviewed, not modified) are targeted fixes to the same underlying bug: **Unistyles' `StyleSheet.create` output never reaches `expo-image`** — Unistyles binds directly to the native shadow node and expo-image doesn't process it, so any `styles.foo` handed to an `<Image>` silently drops every property, most visibly `width`/`height`, producing a 0×0 image. The diffs replace `styles.shape` / `styles.image` / `styles.icon` with plain object literals (`AmbientLayer.tsx` per-shape `style` objects now carry `position: 'absolute'` inline; `HeroCollage.tsx` introduces a module-level `IMAGE` const including the load-bearing `mixBlendMode: 'multiply'`; `PrivacyFooter.tsx` inlines the lock icon's `9.33×12.25` size). This matches a pattern already fixed in six other components (`Avatar.tsx:52-58`, `PhotoCarousel.tsx`, `PhotoLightbox.tsx`) and is now enforced by a new regression test, `src/design-system/__tests__/expoImageStyles.test.ts`, which walks every file importing `expo-image` and fails if any `<Image>` tag receives a `styles.*` reference. That test currently passes against the tree including these uncommitted edits — i.e., the fix is consistent with the project-wide rule and closes the last three known offenders. No other issues observed in these three files beyond the fix itself.

## Audit: home-memories-profile

### Audit: Home, Memories, Profile

Scope: `src/modules/module-02-home/`, `src/modules/module-03-memories/`, `src/modules/module-05-profile/`, their routes in `src/app/(app)/`, their copy in `src/copy/`. Read-only audit, no code changed.

Backend is entirely absent — every data source is either a real Zustand store filled only by onboarding (`storyStore`, `spaceStore`, `relationshipStore`) or a mock service (`memoriesService`) backed by an in-memory `Map` that starts empty and forgets everything on restart. `src/sample/` is a UI-only fallback gated by `USE_SAMPLE_CONTENT` (`src/sample/index.ts:21`), currently `true`.

---

#### Screens

##### Home Dashboard — `/(app)/home` (`src/modules/module-02-home/screens/HomeDashboardScreen.tsx`)

**Purpose.** The app's landing tab: greeting, days-together, a featured memory, stat tiles, a birthday spotlight, "Coming up" countdowns, an "Upcoming" list, and a "Little things" reminder row.

**What the user sees/does.** Greeting only renders if `spaceName` (or sample) is set (`:152`). Days-together is real (`daysSince(story.met?.value)`, `:80`) with an honest unknown state (`:158-166`, `daysUnknown`/`daysUnknownHint`). "A memory worth keeping" is a swipeable pager over up to 4 photo memories (`:88-94, 174-206`), but the pool is **sample-only** (`:91-93`) — with the flag off, this section never renders, real or otherwise, because nothing computes a "featured" pick from the live memories service. Stat tiles ("Your little world"), the birthday spotlight card, and the "Relationship pulse" card are 100% sample-gated (`:98-117, 208-234, 236-266, 268-285`) and vanish entirely with the flag off — they have no real-data equivalent at all, not even an empty state. "Coming up" is real: built from `story.keyDates` via `buildComingUp` (`src/modules/module-02-home/comingUp.ts:27-46`), with sample rows only as fallback when the couple has entered nothing, and a proper empty-state card otherwise (`:288-297`). "Upcoming" is pure sample, no real equivalent, no empty state — it simply disappears with the flag off (`:313-325`). "Little things" has a real empty-state card (`:348-357`) but no real content path — the only source is `SAMPLE_HOME.littleThings`, so it always shows the empty prompt to a real couple, forever, since there is no capture flow for a "note."

**Flow.** In: bottom nav "Home" tab (always live). Out: featured pager → memory detail; "Coming up" row → Occasion screen; empty-calendar/note CTAs → Calendar / Add Memory.

**Strengths.** Real math (days-together, countdowns) is genuinely computed and never faked once the couple has entered dates — verified by a dedicated no-sample test (`src/modules/module-02-home/screens/__tests__/HomeDashboardNoSample.test.tsx`). The screen degrades gracefully section-by-section rather than crashing when data is missing.

**Problems.** Roughly half the dashboard (stat tiles, spotlight, pulse, "Upcoming") is sample-only with zero real-data path — not "empty state pending backend," just permanently absent for a real couple. That is a materially different, much thinner screen than what a demo of this build shows. "Little things" is the same: it look like a working reminders feature but nothing in the app can ever populate it.

**Functional/UI-only.** Days-together, Coming-up, calendar/note CTAs: functional against real state. Stat tiles/spotlight/pulse/Upcoming/Little-things content: UI exists only for sample content, no backing feature.

##### Calendar — `/(app)/calendar` (`src/modules/module-02-home/screens/CalendarScreen.tsx`)

**Purpose.** Month grid + agenda for the couple's key dates; no Figma frame — built from the dashboard's own feature note ("Calendar", "Notes", "pinned events").

**What the user sees/does.** Month grid with prev/next arrows (state only, not persisted), dots on days with an event (`:153-158`), an agenda list built from real `keyDates` (`buildComingUp`, same source as Home) placed onto calendar dates by countdown rather than a stored date (`:56-59` comment, `:73-76`). Reminders section is sample-only (`:79`), same "Little things" gap as Home — no real capture path, so a real couple sees the reminders empty-state forever.

**Flow.** In: Home's empty-calendar CTA, header back. Out: event row → Occasion screen; add-date/write-note CTAs → Add Memory (not a real date-adding flow — both point at the memory form, which cannot save a key date at all, only a memory).

**Strengths.** Correctly derives calendar placement from the same countdown logic as Home (no duplicated logic, confirmed by shared `comingUp.ts`). Proper empty states for both agenda and reminders.

**Problems.** "Add an Important Date" and "Write a Note" both route to Add Memory (`:82`), which has no fields for a recurring date or a sticky note — the CTA promises something the destination screen cannot do. The offset-based month navigation is pure UI state; nothing persists which month you were viewing.

**Functional/UI-only.** Agenda from real key dates: functional. Reminders: sample-only, no real path. Add-date/write-note CTAs: UI exists, routes to a screen that cannot fulfill the specific promise (adding a *date*, or a *note*).

##### Occasion — `/(app)/occasions/[key]` (`src/modules/module-02-home/screens/OccasionScreen.tsx`)

**Purpose.** Detail screen behind a "Coming up" row — no Figma frame; built because the dashboard previously drew these rows as flat, non-interactive text.

**What the user sees/does.** Countdown chip, occasion label/date; for birthdays, a spotlight photo (sample-only, `:65`) and a "past birthdays" rail filtered from sample memories only (`:66-69`) — a real couple's own past-birthday memories would never surface here since it only reads `SAMPLE_MEMORIES`. Non-birthday occasions get a generic "Add memory" action.

**Flow.** In: Home/Calendar row tap. Out: Add Memory, Calendar, memory detail (from past-birthdays rail).

**Strengths.** Handles a missing/unknown key gracefully with a "not found" state and a way back (`:49-58`).

**Problems.** "Past birthdays" never reflects the real memories library — it is wired to `SAMPLE_MEMORIES` directly, not `memoriesService`, so it can never show what the couple actually saved even once they have birthday-tagged memories.

**Functional/UI-only.** Countdown/label: functional (reads real `keyDates`). Photo + past-birthdays rail: UI-only, sample-fed, no real-data path.

##### Memories Home — `/(app)/memories` (`src/modules/module-03-memories/screens/MemoriesHomeScreen.tsx`)

**Purpose.** Library entry point: count line, add/search, "On this day" teaser, "Your albums" rail, "Recently added" bento grid.

**What the user sees/does.** Loads via `memoriesService.list()`; falls back to `SAMPLE_MEMORIES` only if the real list is empty and the flag is on (`:56-58`) — this is a real, working empty/loading/sample-fallback chain, unlike Home. Empty state is a proper `StatusScreen` with a CTA (`:81-90`). "Your albums" rail is **unconditionally** `SAMPLE_ALBUMS` (`:14, 28, 165-167`) — not gated by `USE_SAMPLE_CONTENT` at all, so even with the flag off and a real, populated memory library, the album rail still shows the same six hardcoded sample albums with their fake Figma-drawn counts (86/32/24/12/18/9, `src/sample/albums.ts:29-64`). "Recently added" correctly reads real memories once they exist.

**Flow.** In: bottom nav "Memories". Out: add → Add Memory; search → Search; "On this day" header/hero → On This Day screen; album card → Album Detail; memory card → Memory Detail.

**Strengths.** This is the one screen in scope where loading/empty/populated/sample-fallback are all deliberately built and tested (`MemoriesHomeNoSample.test.tsx` covers empty state and a failed-load-treated-as-empty path, `:61-67`). "On this day" hero correctly routes its photo tap to the On-This-Day screen rather than the lightbox (`photoTap="press"`, a deliberate, sensible override documented in-line).

**Problems.** The albums rail is not just "sample content filling a gap" — it is architecturally disconnected from both the flag and the real memories, permanently. A real couple who tags 30 memories "Trips" will still see a static "32 memories" Trips cover that has nothing to do with their data, forever, because nothing in `AlbumsScreen`/`MemoriesHomeScreen` ever computes from live tags.

**Functional/UI-only.** Memories list, count, add/search entry: functional. Albums rail: UI-only, permanently disconnected from real data (not just gated by the flag).

##### Memory Detail — `/(app)/memories/[id]` (`src/modules/module-03-memories/screens/MemoryDetailScreen.tsx`)

**Purpose.** Single memory view.

**What the user sees/does.** Title, date/location, caption, private "Our Note" card, "Added by", and a working favorite toggle (`memoriesService.toggleFavorite`, real optimistic update from the service response, `:54-60`). Proper loading (chrome-only, no flash, `:64`), not-found, and network-error states driven by real `Result` codes (`:37-45`).

**Flow.** In: any memory card/photo tap across Home, Memories Home, On This Day, Occasion, Album Detail. Out: favorite toggle; back replaces to Memories Home (`:62`).

**Strengths.** Best-built screen in scope for state handling — real loading/error/not-found paths, not just happy path. Deliberately dropped "Share to Chat" and an overflow "More" menu because neither has anything behind it (`:19-22` comment) — an unusually disciplined choice not to fake affordances.

**Problems — the serious one.** There is **no edit and no delete**. `memoriesService` (`src/services/memories/types.ts:34-39`) exposes only `list`, `get`, `create`, `toggleFavorite`, `search` — no `update`, no `remove`/`delete`. Nothing in the UI offers it either: no edit button, no swipe action, no long-press menu. For an app explicitly pitched as a permanent shared archive, a couple cannot fix a typo'd caption, correct a wrong date, remove a duplicate, or delete a memory they no longer want — ever, at any layer, mock or real. This is the single biggest functional gap in the memories module.

**Functional/UI-only.** Favorite toggle: functional. Everything else on the screen: functional display of real data, no edit/delete capability exists.

##### Add Memory — `/(app)/memories/new` (`src/modules/module-03-memories/screens/AddMemoryScreen.tsx`)

**Purpose.** Create-memory form.

**What the user sees/does.** Photo well, title (required), date, caption, location, private note, save/cancel. Validates only the title (`:37-40`), which is a reasonable minimum-friction choice given everything else is genuinely optional in the design. Save calls `memoriesService.create` and replaces to the library on success (`:64`, correctly not `push`, so back doesn't return to a blank form). Handles a network-style failure via a magic `location: "offline"` sentinel in the mock (`src/services/memories/mock.ts:16, 56`) with a real error message.

**Problems.** `onPickPhoto = useCallback(() => {}, [])` (`:67`) — the photo picker is a complete no-op. Tapping "Tap to add photo" does nothing at all; no picker opens, no placeholder photo is set, nothing. Every memory a real user adds through this form is permanently textual — there is no way, anywhere in this build, for a couple to attach their own photo to a memory. Given Memories Home's "Recently added" bento and "On this day" hero both actively prefer photo memories, a real couple's self-added memories will visibly look worse than the sample content they're being shown, with no path to close that gap. This is flagged in code as deliberate (`expo-image-picker` not yet installed, per `PhotoPicker.tsx:20-22`), but the screen gives no signal to the user that the photo affordance is currently non-functional — tapping it just silently does nothing.

**Functional/UI-only.** Text fields + save: functional, hits the real mock service. Photo picker: UI exists, zero effect — worth calling out explicitly as required by the brief.

##### Search Memories — `/(app)/memories/search` (`src/modules/module-03-memories/screens/SearchMemoriesScreen.tsx`)

**Purpose.** Free-text search over the couple's memories.

**What the user sees/does.** A single input; real debounced-by-effect search against `memoriesService.search` (title/caption/location/note/tags substring match, `mock.ts:83-87`). Three distinct textual states: empty library, no query yet, no results — all wired correctly (`:77-88`). Suggestion chips shown in the Stitch design ("Rome", "coffee", "Sarah") were deliberately dropped rather than faked (`:17-19` comment) — a good, honest call: chips built from sample data would search for content a real couple never saved.

**Strengths.** This is a fully real, fully functional feature — search genuinely works against whatever is in the mock store. Nothing here is sample-dependent.

**Problems.** Minor: it's a plain substring match with no ranking, and there's no way to filter to a specific field (date range, tag, album) — but for a scoped v1 this is a reasonable, honestly-scoped feature rather than a token one, unlike some other screens in this module.

**Functional/UI-only.** Fully functional against the mock service.

##### On This Day — `/(app)/memories/on-this-day` (`src/modules/module-03-memories/screens/OnThisDayScreen.tsx`)

**Purpose.** Memories that fall on today's calendar date across years.

**What the user sees/does.** Groups real memories by month/day (`groupByYear`, tested pure function, `:47-62`), newest year first. With real data and nothing today, or with the flag off, shows a proper empty state with an add-memory CTA (`:126-135`). With the flag on and nothing today, silently re-anchors to October 14 — the date the design was drawn against (`:109-113`) — so the sample content always has something to show; this is documented and deliberate, but worth naming as a “the demo always looks good, 364/365 real days won't” effect once the flag flips off in production.

**Strengths.** Correct grouping logic, proper "years ago" labeling, genuine empty state.

**Functional/UI-only.** Fully functional against real data once populated; the October-14 fallback is sample-only scaffolding, clearly commented as such.

##### Albums — `/(app)/memories/albums` (`src/modules/module-03-memories/screens/AlbumsScreen.tsx`)

**Purpose.** Grid of all albums ("Your albums fill up as you tag memories").

**What the user sees/does.** Renders `SAMPLE_ALBUMS` directly (`:10, 38-48`) — there is no import of `USE_SAMPLE_CONTENT` in this file at all. The `SAMPLE_ALBUMS.length === 0` empty-state check (`:38`) is dead code: that array is a hardcoded literal of 6 entries (`src/sample/albums.ts:28-65`) and can never be empty. The listed "eyebrow" (`Chandu & Sarah`) is likewise hardcoded sample copy, not the real couple's space name.

**Problems — serious, and distinct from "sample fills the empty state."** This screen does not read `USE_SAMPLE_CONTENT`, does not read the real memories service, and cannot ever be empty. A real couple with zero memories, or a real couple with 200 memories none of which are tagged "Trips," sees an identical "Trips — 32 memories" cover either way. This isn't a graceful sample-content fallback like Home or Memories Home; it's a screen that was never actually connected to the app's own data model, unlike its sibling `MemoryCard`/`memoriesInAlbum` logic, which *is* capable of deriving real counts (`memoriesInAlbum` in `src/sample/albums.ts:68-71` works against any `Memory[]`, real or sample — it's just never called with the real list here).

**Functional/UI-only.** Entirely UI-only; not gated, not wired to any real state.

##### Album Detail — `/(app)/memories/albums/[key]` (`src/modules/module-03-memories/screens/AlbumDetailScreen.tsx`)

**Purpose.** One album's cover + feed.

**What the user sees/does.** Cover hero with reversed-out title, subtitle uses the fake Figma `sampleCount` (not `memories.length`, `:70`, `copy/albums.ts:17-19`) alongside `SAMPLE_HOME.coupleName` — again, not the real space name. Feed is `memoriesInAlbum(album)`, called with its default `memories = SAMPLE_MEMORIES` (`:44`, `sample/albums.ts:68`) — so, same as the Albums list, this never reads the real memories service. Proper "album not found" state with a back CTA.

**Problems.** Video tiles are drawn in the design but there is no video field in the data model and no player installed; a video memory silently renders as a still photo (`:20-22` comment) — an honest, documented limitation rather than a broken feature, but worth flagging as a design/data-model gap if video is actually planned.

**Functional/UI-only.** Entirely UI-only, same as Albums list — never reads live memories or the real couple's name.

---

##### Our Space (Profile) — `/(app)/profile` (`src/modules/module-05-profile/screens/OurSpaceScreen.tsx`, 124 lines total for the whole module)

**Purpose.** Per its own header comment, "a deliberate stub" — the design (Stitch e6c82bcb) draws a full hub with couple names, a days-together counter, a private-space note, and rows to Personalize/Our Identity/Space Preferences; none of those destinations exist in code yet.

**What is actually there.** A heading + lede (from the design), an appearance section with a working light/dark `ThemeToggle`, and a sign-out control — the one thing the *design itself never drew* (`copy/ourSpace.ts:18-23`). Sign-out is real: calls `authService.signOut()`, resets `relationshipStore`, and routes to welcome, gated behind a `ConfirmDialog` (not `Alert.alert`, because `Alert` has no react-native-web implementation and the button would otherwise be silently unreachable on web — a real bug caught and documented in-line, `:31-34`).

**What a user would obviously expect and is absent.** Everything the design promises and more: the couple's own names/photos, a days-together counter (redundant with Home, but expected here too), any privacy or notification settings, any partner-management (repairing, viewing partner's info, disconnecting), any account settings (email/password change, delete account), any data export/backup messaging (important given nothing persists across a restart — a couple would reasonably want to know that), and any "About/Help" or app info. As it stands this is a settings screen with exactly one setting (appearance) and one destructive action (sign out); there is no "profile" content at all — no representation of "me" or "partner" anywhere in this scope. Given LoveOS's own premise (paired identity, no accounts/roles beyond the couple), the complete absence of partner-facing info here (is my partner still connected? when did we pair? re-invite if disconnected?) is a bigger gap than it looks from the line count alone.

**Strengths.** Honest about being a stub in its own comments rather than pretending otherwise. The sign-out flow is the most carefully reasoned bit of code in this whole scope (web-Alert bug catch, unconditional state cleanup, order-of-operations comment on reset-before-navigate).

**Functional/UI-only.** Theme toggle and sign-out: fully functional. Everything else a "profile"/"our space" screen would be expected to hold: absent, not merely unwired.

---

#### Cross-cutting findings

**Home dashboard, in aggregate.** With `USE_SAMPLE_CONTENT` on (current default, `src/sample/index.ts:21`), the dashboard looks rich: greeting, days-together, a featured photo, three stat tiles, a birthday spotlight, a relationship-pulse counter, two countdown-style lists, and a reminders row. With the flag off — the true day-one state for a real couple who just finished onboarding — the screen shrinks to: an optional greeting, days-together (or an honest "we don't know yet" prompt), and two list sections that are almost always their own empty-state cards (Coming up, Little things), because there is no way for a couple to add a "little thing" note or an "Upcoming" event anywhere in the product. A first-time couple learns very little from this screen beyond "we know how long you've been together, once you tell us" — the rest of the dashboard's promised richness (little world stats, pulse, spotlight, upcoming plans) has no path to ever appear for a real user, sample flag or not, because there's no feature behind those cards at all (no trip counter, no places counter, no way to schedule an "Upcoming" event distinct from a key date). This is confirmed directly by `HomeDashboardNoSample.test.tsx`, which asserts the sample-only sections are wholly absent, not degraded.

**Memories module.** Add-a-memory is a reasonable, low-friction flow (one required field, everything else optional, correct replace-on-success navigation) undermined by a completely non-functional photo picker — a serious flaw for an app whose best moments (Memories Home bento, On This Day hero, Occasion spotlight) are explicitly photo-first. Search is the most honestly-scoped, fully-functional feature in the whole audited surface. Albums do not earn their place as currently wired: both album screens are permanently disconnected from `USE_SAMPLE_CONTENT` and from the real memories service, so they will show the same six fake sample covers with fake counts to every user, forever, regardless of what they've actually tagged — this reads as an oversight rather than a documented interim choice (contrast with Home/Memories Home, which explicitly gate their sample content and have tests proving the gate works). **There is no edit or delete for a memory anywhere in the code** — not in the UI, not in the service interface, not in the mock. For a product whose stated purpose is a permanent shared archive, this is the most serious functional gap in scope.

**Profile / Our Space.** 124 lines holds a stub screen (heading + appearance toggle + sign-out) standing in for what the design draws as a full settings hub. Absent and expected: partner info/status, account management, privacy/notification settings, any representation of "me" vs "partner." This is the thinnest module in scope by a wide margin and reads as literally unbuilt rather than intentionally minimal — its own code comments say so.

**Empty/loading/error state coverage.**
| Screen | Loading | Empty | Error |
|---|---|---|---|
| Home Dashboard | n/a (store is sync) | Yes, per-section (Coming up, Little things) | n/a |
| Calendar | n/a | Yes (agenda, reminders) | n/a |
| Occasion | n/a | Yes ("not found" for bad key) | n/a |
| Memories Home | Yes (chrome-only) | Yes (StatusScreen) | Failed load treated as empty, not surfaced as an error |
| Memory Detail | Yes (chrome-only) | Yes ("not found") | Yes (real NOT_FOUND/NETWORK/UNKNOWN copy) |
| Add Memory | n/a | n/a | Yes (create failure, incl. a magic "offline" sentinel in the mock) |
| Search | n/a | Yes (3 distinct states: no library, no query, no results) | Treated as empty on failure, not surfaced |
| On This Day | n/a | Yes | n/a |
| Albums | n/a | Dead code, can never trigger | n/a |
| Album Detail | n/a | Yes (empty album), yes ("not found") | n/a |
| Our Space | n/a | n/a | Sign-out failure is silently swallowed by design (documented as intentional) |

Loading states exist only where a screen awaits the async mock service (Memories Home, Memory Detail); Home/Calendar/Occasion read synchronous Zustand stores so they have no loading state to build. Search and Memories Home both fold a genuine service failure into "empty" rather than a distinct error message — a defensible simplification for a mock with no real failure modes, but worth re-examining once a real backend can actually go offline mid-session.

**Cross-screen consistency.** Strong. Every screen in scope uses the same `AppScreenLayout` (header + 350pt-capped column + bottom nav), the same `Card`/`SectionPanel`/`EventRow` primitives, the same back behavior (`onBack` prop → header back arrow, consistent placement), and the same bottom nav (`APP_NAV`, `src/copy/appNav.ts`) with the Timeline tab correctly stubbed `live: false` (disabled, not hidden) pending `module-04-timeline`. Card shapes, spacing tokens, and navigation idioms (push for forward, replace for terminal actions like save/sign-out) are applied consistently across Home, Memories, and Profile — this does read as one product, not three bolted together.

**Prototype vs. production signals.**
- Two screens (`Calendar`, `Occasion`) explicitly have **no Figma frame** at all — they were built from a text note beside the dashboard frames, not from a drawn screen. Functionally coherent, but a sign the design and engineering tracks diverged here.
- `AddMemoryScreen`'s photo picker is inert, with a comment pointing at an "INSTALL-PLAN.md Phase 6" — a clearly interim, not-yet-wired state left in a shippable-looking screen with no in-UI signal that it doesn't work.
- Albums are wired to static sample data with no live-data path at all — this is the strongest "still a prototype" signal in scope, since it's not even gated by the sample-content switch the rest of the app respects.
- No memory can be edited or deleted at any layer — a core CRUD operation missing from the data contract itself (`MemoriesService` type), not just the UI.
- Profile/Our Space is explicitly self-documented in code as "a deliberate stub."

#### Direct answer: can a memory be edited or deleted?

**No.** `memoriesService` (`src/services/memories/types.ts:34-39`) defines only `list`, `get`, `create`, `toggleFavorite`, `search`. There is no `update` or `delete` in the type, the mock implementation (`src/services/memories/mock.ts`), or anywhere in the UI (no edit button, no swipe-to-delete, no long-press menu, on Memory Detail or any list). Favoriting is the only mutation possible on an existing memory.

## Audit: design-system

### LoveOS design system audit

Read-only audit of `src/design-system/`, `src/components/`, and `src/app/` routing/layout.
LoveOS is a two-person couples app: no admin, no roles, no backend yet (nothing persists).

#### 1. Inventory

##### `design-system/primitives/` (11)

| Component | Purpose |
|---|---|
| `Text.tsx:54` | The only way to render type — no `style` prop, by design. Variant + tone drive everything. |
| `Button.tsx:37` | The only button in the app. 4 variants (primary/soft/outline/link), built-in double-tap guard, loading spinner, disabled state that swaps fill+ink for contrast rather than dimming opacity. |
| `Input.tsx:74` | The only text field. Filled, radius 12, one control height. Invented focus/error/disabled states (Figma never drew them). |
| `Avatar.tsx:36` | Circular person avatar; falls back to initials, then to a labelled empty circle — never a silhouette. |
| `Card.tsx:15` | Bordered surface, generic container. |
| `CodeDisplay.tsx:31` | Read-only formatted pairing code (`L8V7QK` → `L8V · 7QK`), spelled out for screen readers. |
| `CodeInput.tsx:27` | Segmented code entry, one hidden `TextInput` behind N visual boxes. |
| `CountUp.tsx:29` | Animates a number counting up to a value; final value is always the accessible label; respects reduce-motion. |
| `DateField.tsx:63` | Typed `mm/dd/yyyy` birthday field, not a calendar picker (deliberate). Includes `isValidBirthday`. |
| `Divider.tsx:18` | Horizontal rule, optional centered label, always flexible width. |
| `SegmentedControl.tsx:30` | One-of-N segmented choice control (used for date precision). |

##### `design-system/patterns/` (14)

| Component | Purpose |
|---|---|
| `AppHeader.tsx:25` | Top bar for `(app)` and `(onboarding)`: symmetric back-button/spacer + centered wordmark. |
| `AppScreenLayout.tsx:33` | Shared chrome for every `(app)` screen: header + 448pt-capped content column + `BottomNav`. Children optional so a loading screen can render chrome-only. |
| `BottomNav.tsx:36` | The 5-tab bottom bar. Renders not-yet-built tabs disabled rather than hiding them. |
| `EventRow.tsx:28` | One row inside a `SectionPanel`: icon tile + title + detail line. |
| `FooterPrompt.tsx:22` | "Prompt text + inline link" footer (e.g. "New to LoveOS? Create an account"). |
| `PhotoCarousel.tsx:34` | Swipeable paged photo strip with dots; degrades to a plain image for a single photo. |
| `PhotoLightbox.tsx:49` | Full-bleed photo viewer, opened by tapping any photo. |
| `PhotoPicker.tsx:24` | Circular photo well with add affordance; takes `onPick`, doesn't own the picker library (stubbed until Phase 6). |
| `PressableScale.tsx:28` | Generic "answers the touch" pressable wrapper (scale to 0.98), respects reduce-motion. |
| `SectionPanel.tsx:24` | Titled group: one soft surface holding a stack of row cards. |
| `SocialButton.tsx:36` | Google/Apple sign-in button. Monochrome glyph flagged as a placeholder pending OAuth branding compliance. |
| `StatusScreen.tsx:22` | Centered artwork + headline + lede + optional actions. Shared by onboarding's Connecting/Connected screens, and reused ad hoc as an empty-state layout elsewhere (see §2). |
| `ThemeToggle.tsx:25` | Self-contained lavender/midnight toggle button. |
| `ThemedStatusBar.tsx:17` | Status bar glyph color keyed to the active theme (not OS appearance). |

##### `src/components/` (4 real components + 3 empty placeholder dirs)

| Component | Purpose |
|---|---|
| `feedback/FeedbackBanner.tsx:43` | Self-dismissing success/error toast. Announces via `AccessibilityInfo`, `accessibilityRole="alert"`. The one transient-message primitive in the app. |
| `feedback/ConfirmDialog.tsx:53` | Confirm/cancel modal, built on RN `Modal` specifically because `Alert.alert` has no web implementation (this was a real "Sign Out doesn't work on web" bug). |
| `forms/FormField.tsx:25` | The only file wiring `react-hook-form` to `Input`. Keeps the primitive form-library-agnostic. |
| `media/`, `moments/`, `navigation/`, `relationship/` | Empty — only `.gitkeep`. Scaffolded, unused. |

#### 2. States — the verdict

**Improvised, not systematised.** There is no `EmptyState`, `LoadingState`, `ErrorState`, or offline component anywhere in `design-system/` or `components/`. Every screen writes its own:

- **Loading**: no spinner/skeleton convention. The pattern that recurs is "return chrome with no children" — e.g. `MemoriesHomeScreen.tsx:79` (`if (memories === null) return <AppScreenLayout activeTab="memories" />`), commented as a deliberate anti-flash choice, but that decision and its markup are re-derived per screen, not centralized. Only one `ActivityIndicator` outside `Button.tsx` exists in the whole app: `ConnectingScreen.tsx:77`, hand-built into that one screen.
- **Empty**: every list screen hand-rolls its own `X.length === 0 ? <bespoke markup> : <list>` branch: `MemoriesHomeScreen.tsx:81` (reuses `StatusScreen` + `Button`), `HomeDashboardScreen.tsx:288` (a raw `Card`+`Text`+`Button` block), `OccasionScreen.tsx:124` (just a `Text` line), `AlbumDetailScreen.tsx:75`, `OnThisDayScreen.tsx:126`, `CalendarScreen.tsx:172,222`, `PinnedAndSearchScreen.tsx:120`, `AlbumsScreen.tsx:38`. No two are visually identical (some get an illustration+heading+CTA via `StatusScreen`, some get one muted line of body text). `StatusScreen` is being asked to do double duty — it was built for onboarding status screens, not as a general empty-state component — and only some screens reach for it.
- **Error**: no error-state layout/illustration at all. `FeedbackBanner` covers a *transient* pass/fail toast (e.g. save failed), not a persistent "this screen failed to load" treatment. There's no retry affordance pattern.
- **Offline**: nothing. No `NetInfo`/connectivity check anywhere in `src/` (grepped for `NetInfo`, `isConnected`, `useNetInfo` — zero hits). Given there is no backend yet, this may be intentionally deferred, but there's no seam for it either (no wrapper, no hook stub).

This is the single biggest gap in an otherwise disciplined system: nothing about these four states has been extracted into a place a new screen would naturally reach for, so the next screen someone builds will invent a fifth variant of "empty" rather than importing one.

#### 3. Missing components

Checked against `components/feedback/` (already has `FeedbackBanner`, `ConfirmDialog`) before flagging anything as absent.

1. **Empty/loading/error state components** (see §2) — the highest-value gap.
2. **Skeleton loader** — no shimmer/placeholder-block primitive; the "chrome-only, no spinner" convention has no shared visual for the content area itself.
3. **List row primitive** — `EventRow` is the closest thing, but it's specific to icon-tile+title+detail; `MemoryCard`/`PhotoMemoryCard` (module-level) and chat's row treatments are separate, unrelated implementations. There's no generic `ListRow`/`SectionHeader` pair a new list would reach for (`SectionPanel` covers grouping but not a header-only pattern used outside a panel).
4. **Badge/chip** — no small-status or tag component exists anywhere (checked `primitives/` and `patterns/`); a couples app will likely want this for tags on memories/occasions.
5. **Switch/toggle (generic)** — `ThemeToggle` is a bespoke on/off button for exactly one setting; there's no generic boolean `Switch` control for a settings screen that will need more than one toggle.
6. **Avatar stack / pair avatar** — `Avatar` renders one person; a two-person app will very likely want a "both partners" composed avatar (overlapping pair), which doesn't exist.
7. **Pull-to-refresh** — no `RefreshControl` wiring anywhere in `app/` or `modules/` screens sampled; all lists are static-render-then-improvise-empty.
8. **Tooltip** — none found; low priority for a two-person app with no complex UI to explain.
9. **Bottom sheet** — none found; `ConfirmDialog`'s centered-modal pattern is the only overlay idiom, no slide-up sheet for e.g. action menus.
10. **Date picker (calendar-style)** — explicitly and deliberately not built (`DateField.tsx:50-52`); this is a documented decision, not an oversight, and shouldn't be read as a gap.

Of these, items 1–3 matter most for a product (not prototype) at this stage; 4–7 are near-term needs as more screens land; 8–10 are lower priority or already deliberately excluded.

#### 4. Navigation

- Three route groups exist as documented: `(auth)`, `(onboarding)`, `(app)` (`src/app/_layout.tsx:23-27`), each with its own `_layout.tsx` that simply sets `headerShown: false` and does nothing else (`src/app/(auth)/_layout.tsx:11`, `src/app/(onboarding)/_layout.tsx:11`, `src/app/(app)/_layout.tsx:11`).
- **No guard is actually implemented.** The root layout's comment states the intended access rules — `(auth)` skips when signed in, `(onboarding)` requires a session, `(app)` requires session + partner (`src/app/_layout.tsx:24-27`) — but no code enforces any of it. `src/app/index.tsx:12` unconditionally redirects to `/(auth)/welcome`, and nothing checks auth/pairing state before rendering `(app)` or `(onboarding)` screens. Any screen in any group is reachable directly today; this is explicitly flagged in the file's own comment as future work, not a design decision, so it should be tracked as an open gap rather than assumed to still be pending by accident.
- **Chrome consistency**: `(auth)` and `(onboarding)` both disable the stack header and let each screen draw its own top bar (documented as intentional per-screen variance — Welcome has no back arrow, Sign In does). `(app)` uses one consistent chrome (`AppScreenLayout` → `AppHeader` + `BottomNav`) across all its screens. So chrome is *consistent within* each group but the three groups don't share a chrome contract with each other — acceptable, since only `(app)` has persistent bottom nav needs.
- **Back behavior**: `AppHeader`'s back button is opt-in via an `onBack` prop (`AppHeader.tsx:9-11`); screens that don't pass it get a same-size empty spacer instead of a back arrow, so back-navigation is a per-screen choice, not automatic from the router stack. This is consistent but means a screen author must remember to wire it — nothing forces `onBack` when a screen is not a tab root.
- **BottomNav / `appNav.ts`**: 5 tabs (`home`, `memories`, `chat`, `timeline`, `profile`); `timeline` correctly ships `live: false` and renders disabled rather than hidden (`src/copy/appNav.ts:13`, `BottomNav.tsx:26-29`) — a considered choice, documented, and tested (accessibilityState.disabled is set, `BottomNav.tsx:74`).
- **Unreachable screens**: `timeline` has no route and an empty `href` (`appNav.ts:13`) — by design, not a bug. Everything else under `(app)` is reachable via router path or as a sub-route (chat moment screens, memories album/detail/new/search, occasions `[key]`), consistent with the file tree.

#### 5. Theming and responsiveness

- Two themes, `lavender` (light) and `midnight` (dark), assembled from one explicit `ThemeColors` type (`theme.ts:17-129`) so adding a color to one theme and forgetting the other is a **compile error**, backed further by a runtime parity test (`theme.parity.test.ts`, referenced at `theme.ts:14-15`). This is unusually rigorous for a project this age.
- Non-color tokens (`control.height`, `spacing`, `radii`, `typography`, `elevation`, `layout`) are one shared object referenced by both themes (`theme.ts:138-155`) — dark mode is explicitly "a repaint, not a relayout." Good discipline.
- Dark mode does not follow the OS: themes are named for their palette (not `light`/`dark`), so Unistyles' `adaptiveThemes` is deliberately not used; the app always launches in `lavender` (`unistyles.ts:36`) and the user must opt into `midnight` via `ThemeToggle`. This is documented as intentional, and is genuinely complete as far as the token/theme layer goes — but note it currently is **not persisted** (`unistyles.ts:31-34`, explicit TODO-by-comment: "nothing in this app persists yet, on purpose"). So dark mode is complete as a *runtime* feature but resets to lavender on every app restart.
- **Breakpoints are essentially decorative.** `breakpoints.ts` defines `xs: 0` / `md: 768`, but a repo-wide grep for actual breakpoint-keyed variants (`variants: { md: ... }`, `breakpoints.md`, etc.) found exactly one file using anything at that scope (`CodeInput.tsx`), and it isn't even a breakpoint-variant usage. The only real responsiveness lever is `theme.layout.column` (448pt cap via `maxWidth`) applied in `AppScreenLayout.tsx:98-105` and its `AuthScreenLayout` counterpart — this only engages on tablet-or-wider viewports; **at 320pt it does nothing at all**, because the layout is `width: '100%'` up to that cap. In other words: the system is fluid-down/capped-up by design, and 320pt support is really just "does content wrap and not overflow," which was not verified here screen-by-screen.
- No `useBreakpoint`-style hook or responsive-variant helper exists, so if a real tablet-specific layout change (not just a width cap) is ever needed, there's no established pattern to reach for yet.

#### 6. Accessibility

Genuinely disciplined in the primitives that exist:
- `Button` sets `accessibilityRole="button"`, `accessibilityState={{ disabled, busy }}`, and a real double-tap guard (`Button.tsx:74-79`); disabled state is a solid-fill/ink swap rather than opacity, specifically because opacity alone failed contrast (`Button.tsx:130-137`, documented against spec D20.4).
- `Avatar` always has an accessible label, even for an empty name (`Avatar.tsx:39,46-47`).
- `FeedbackBanner` and `ConfirmDialog` both call `AccessibilityInfo.announceForAccessibility` explicitly because `accessibilityLiveRegion` only works on Android and iOS VoiceOver ignores it — a real, correctly-diagnosed cross-platform gap (`FeedbackBanner.tsx:35-41`, `ConfirmDialog.tsx:65-70`).
- `SegmentedControl` carries selection via `accessibilityState.selected`, not color alone (`SegmentedControl.tsx:27-28`).
- `CodeDisplay` spells out characters individually for screen readers rather than reading the formatted string as a word (`CodeDisplay.tsx:27-29`).

Gaps found:
- **No heading semantics.** Grepped for `accessibilityRole="header"` across `src/` — zero hits. `Text`'s `h1`/`h2`/`h3` variants are purely visual; a screen reader has no way to jump between headings the way it does on web/native apps that set this role.
- **AppHeader's back button is 40×40** (`AppHeader.tsx:69-73`), under the 44pt touch-target guideline. `BottomNav`'s tab pills clear 44pt comfortably (icon 24 + label + padding).
- **No font-scaling ceiling anywhere**, which is good for scaling but combined with several *fixed*-height controls (`control.height: 56` for `Button`/`Input`/`SocialButton`, `AppHeader`'s 40pt edges) means large accessibility text sizes were not verified against clipping — nothing in the codebase caps or tests this.
- `chatContrast.test.ts` (full read) checks exactly four pairings — bubble ink on both bubble fills, ink on `accentSoft`, `accent` against the page, and label-on-`accent` — each ≥4.5:1, plus a regression guard that `chat.accent` is never the old Fuschia hex. It's narrow but well-targeted: chat is the one place many colors mix into text-bearing surfaces. It does **not** check `feedback.error`/`feedback.success` against the surfaces they render on, nor button/disabled states, nor placeholder text contrast — those live in the separate `theme.contrast.test.ts` (not read in depth here) if covered at all.
- `noUntokenisedColours.test.ts` (full read) statically greps every `.tsx`/`.ts` file outside `tokens/`/`themes/`/`test/` for raw hex or `rgba(...)` literals and fails the build if any exist outside an explicit, justified `DELIBERATE` allow-list (currently one entry: `PhotoLightbox`'s black scrim, justified inline). This is a strong, low-maintenance guard against the classic "one hardcoded color breaks dark mode" bug class. What it explicitly does **not** catch: colors expressed as a computed string/template (it's a regex over literal text) or a color introduced through a third-party component's own prop default — it is a static-source check, not a rendered-output check.

#### 7. Component quality

- No duplication found among the design-system primitives/patterns themselves — the doc comments repeatedly call out *avoiding* a second implementation (e.g. `ThemeToggle` built on `Button` rather than a bespoke pressable, `SocialButton` explicitly kept as a pattern rather than a `Button` variant because it carries provider semantics).
- The one component doing more than one job is **`StatusScreen`**, being pressed into service as both "onboarding status" and, in at least `MemoriesHomeScreen`, "empty-state layout" — not because it's poorly built, but because there is no dedicated empty-state component and it is the closest fit (see §2/§3). This is worth splitting out explicitly rather than letting `StatusScreen` accrete more responsibilities as more screens reuse it for "empty."
- `Button`'s double-tap guard (`isHandling` ref + 600ms timeout) duplicates logic that would recur anywhere a similar pressable needs the same guard — currently fine since `Button` is genuinely "the only button in the app," but if `PressableScale` (a separate generic pressable primitive) ever needs the same guard, this logic should move to a shared hook rather than being copied.
- Module-level components sampled (`MemoryCard`, `PhotoMemoryCard`, per §2) are not part of the shared layer and were only checked for consumption patterns, not audited for quality — they appear to be the seed of a "list row" component that hasn't been promoted to `design-system/patterns/` yet.

#### Summary

The token/theme layer, `Text`/`Button`/`Input` primitives, and the two accessibility-focused tests are unusually rigorous for a project this young — compile-time theme parity, a static hardcoded-color guard, and genuinely-diagnosed cross-platform accessibility fixes (live regions, `Alert.alert` on web) are not typical at this stage. The gaps are concentrated exactly where the brief expected: states (empty/loading/error/offline) are entirely improvised per screen with no shared component, several product-shape components (skeleton, badge, switch, pair-avatar, pull-to-refresh, bottom sheet) don't exist yet, and the three route groups have no actual auth/pairing guard behind their documented intent.

---

# Part F — Research

## Research: couples-app-strategy

and # Couples-app strategy — where LoveOS should spend the next month

**Status:** Recommendation. Not approved, not planned.
**Scope:** Product strategy only. No source code was changed.

This document does three things: inventories what is actually built, sets that
against what the market and the evidence say, and then recommends a prioritised
set of moves. The third list — **do not build** — includes the founder's own
backlog items, assessed straight.

Where the evidence is thin, it says so. Anything marked *speculative* is a
judgement call with no citation behind it.

---

#### 1. What exists

##### 1.1 Modules

Counted by real `.ts`/`.tsx` files, excluding `.gitkeep`:

| Module | Files | Lines | State |
|---|---|---|---|
| `module-03-chat` | 40 | 5,164 | Built. 13 Figma frames, mock service, Figma-parity fixture, QA catalogue |
| `module-01-onboarding` | 34 | 2,746 | Built. Pairing + story capture, S01–S20 |
| `module-00-auth` | 23 | 2,456 | Built. Sign-up, sign-in, verify, reset |
| `module-03-memories` | 16 | 2,199 | Built. Library, detail, add, albums, on-this-day, search |
| `module-02-home` | 9 | 1,501 | Built. Dashboard, calendar, occasions |
| `module-05-profile` | 2 | 228 | One screen (`OurSpaceScreen`) — heading, lede, sign-out |
| `module-04-timeline` | 0 | 0 | Empty scaffolding. Tab exists in `appNav.ts` with `live: false` |
| `module-06-memories` | 0 | 0 | Empty scaffolding, duplicate of `module-03-memories`. Flagged for deletion in the chat spec §14 |

Roughly 14,300 lines of well-tested UI across five real modules. The
craftsmanship is high: every string is centralised in `src/copy/`, contrast is
asserted as unit tests, the design divergences from Figma are documented rather
than silently patched (`docs/qa/chat-test-cases.md`), and screens compose from a
service→store→component→screen layering that is genuinely testable.

##### 1.2 What is *not* there, and matters more than the modules

- **No backend.** Every service in `src/services/` is a typed mock behind a
  swap-at-one-line boundary. `src/services/api/generated/` holds a `.gitkeep`.
- **No persistence of any kind.** `src/state/relationshipStore.ts:28` says it
  outright: "Nothing persists." No AsyncStorage, no SecureStore, no MMKV — none
  are installed.
- **No push notifications.** `expo-notifications` is not a dependency.
  `src/services/notifications/` is an empty directory.
- **No camera, image picker, or audio.** `docs/qa/chat-test-cases.md` CHAT-081
  records that photo staging and voice "recording" are both mocked placeholders.
- **No encryption story.** No E2EE, no key management, nothing.
- **No unpair, no account deletion, no data export.** A repo-wide grep for
  `unpair|breakup|deleteAccount|export data|disconnect` returns nothing.
- **No partner data model.** The partner is the hardcoded string "Sarah" in
  `ChatHeader.tsx`, `Composer.tsx`, and `src/copy/chat.ts`, which says so
  explicitly: "there is still no store-backed partner profile to read a name
  from."
- **The auth contract is blocked.** `docs/superpowers/specs/2026-08-16-v3-contract-blockers.md`
  lists eight blockers. B8 is the one that matters: v3 "drops `pairingStatus`
  and every couples/profile/onboarding endpoint." The contract the team is
  waiting on cannot serve the core product concept.

##### 1.3 What the copy and sample content say the product is

`src/config/brand.ts`: *"Your relationship. Beautifully kept."*
`src/copy/welcome.ts`: *"A private digital home for everything that makes you,
you"* / *"Private by design. Your space belongs to both of you."*

The sample content (`src/sample/`) draws one specific couple: 1,395 days
together, Rome and Amalfi and Bangkok, "apartment 4B", 8 trips, 42 places, no
children, not married, an anniversary and two birthdays. Memory captions are
warm and specific — "You ordered for both of us in terrible Italian and it
worked", "The one where we missed the last train back."

The voice is consistent and good: small, warm, possessive-plural, never
clinical. "Our little world." "186 little pieces of us." "Your little
conversations." It is a *keepsake* voice, not a *coaching* voice. That is a
positioning decision the codebase has already made, and it is a defensible one.

##### 1.4 The honest summary of the inventory

LoveOS today is **a shared archive with a chat tab attached**, built to a very
high standard as an unpersisted prototype. Both halves are retrospective. There
is no prospective mechanic anywhere in the product — nothing that gives a couple
a reason to open it *today* that did not exist yesterday. The two candidates the
Home dashboard gestures at ("Leave a little note", "Add an Important Date") are
empty-state cards, not a ritual.

---

#### 2. The market

##### 2.1 The graveyard, and what killed each one

This category has a long list of dead products, and they died in recognisable
ways.

| Product | Fate | The lesson |
|---|---|---|
| **Couple** (formerly Pair, by TenthBit) | 100,000 users in its first week; acquired by Life360 in 2016; defunct since April 2019 ([Wikipedia](https://en.wikipedia.org/wiki/Couple_(app))) | A private two-person messenger. Fast initial growth, no durable reason to stay off iMessage. Its shutdown also left users scrambling for their data ([rymc.io](https://rymc.io/blog/2019/decoupling/)) |
| **Tuned** (Meta NPE) | Shut down 2022 after ~909,000 downloads ([TechCrunch](https://techcrunch.com/2022/07/25/meta-is-shutting-down-tuned-its-social-app-for-couples/)) | Same shape — a private couples space. Meta could not make it work with unlimited distribution |
| **Honeydue** | Grew 20k → 500k registered users on near-zero marketing; divested from Mission Lane in 2024; sunset 31 Aug 2026 ([Finextra](https://www.finextra.com/pressarticle/87810/mission-lane-acquires-honeydue), [App Store](https://apps.apple.com/us/app/honeydue-couples-finance/id1157633945)) | Real product-market fit in a couples niche, free model, no price — and still not a business |
| **Zeta** (couples banking) | Acquired by Acorns, shut down May 2025 | Couples-only utilities get absorbed, not scaled |
| **Lasting** | Acquired by Talkspace in Nov 2020, folded into the Talkspace platform; Talkspace itself acquired by UHS for $835M ([MobiHealthNews](https://www.mobihealthnews.com/news/talkspace-dives-relationship-counseling-acquisition-lasting)) | The clinical wedge is real but its exit is "become a feature of a telehealth company" |

The pattern: **private-two-person-messenger is the most reliably fatal shape in
this category, and it is the shape of the module LoveOS has invested most in.**
Couple and Tuned both got to substantial scale and both died. Neither was killed
by a competitor couples app; both were killed by iMessage and WhatsApp, which
are already installed, already contain the couple's history, and already work.

##### 2.2 What survives, and what its users complain about

An analysis of 1–3 star reviews across the five most-used couples apps of 2026
(Paired, Lasting, Love Nudge, Evergreen, Cupla) found this complaint
distribution ([Unstar](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026)):

| Complaint | Share of 1–3 star reviews |
|---|---|
| Everything locked behind the paywall | 28% |
| Questions repeat, content runs dry | 22% |
| Free trial auto-charged | 19% |
| Sync between partners breaks | 16% |
| Generic, not built for *this* relationship | 10% |

Per-app, briefly:

- **Paired** — the category leader. ~4.7 iOS, ~8M downloads, reported ~100k
  daily active couples. Praised for design and the daily question. Criticised
  for "the hardest paywall" in the category, and — repeatedly — for charging
  **per person rather than per couple**, around $6/month or roughly $75–80/year
  ([The Quality Edit](https://www.thequalityedit.com/articles/paired-app-review),
  [CoupleBee](https://couplebee.com/blog/paired-app-reviews)). Third-party
  revenue estimates of ~$200k/month exist but are unverified vendor estimates
  and should be treated as an order of magnitude, not a figure.
- **Lasting** — therapist-designed structured sessions. Clinical, effective for
  couples who commit, wrong for anyone wanting a light daily touchpoint.
- **Evergreen** — 4.8 rating, streaks and gamified prompts, "genuinely fun first
  experience." Complaints cluster entirely on longevity: content runs thin,
  prompts repeat, the streak outlives the material.
- **Cupla** — the logistics outlier: shared calendar, reminders, lists. Free tier
  plus ~$4.99/month or ~$44.99/year *for the couple*. Users who came for
  coordination like it; users who came for connection find it thin.
- **Love Nudge** — genuinely free, 5-Love-Languages tracker, dated UI, one
  framework and no depth beyond it.
- **Gottman Card Decks** — free, and functions as a loss-leader for Gottman
  Institute retail and the ~$139–250 Relationship Adviser programme.

Two of those complaint rows are structural gifts to LoveOS. **"Content runs
dry" (22%)** is a problem an app with an archive can solve and an app without one
cannot. **"Charges per person" and "paywall" (28%)** are pricing decisions
LoveOS has not made yet and can simply make differently.

##### 2.3 Monetisation and retention reality

Category norms: freemium subscription, $5–15/month, annual plans discounted
hard, trials that default to annual. Nobody in this category has found a
non-subscription model that works; Honeydue's free model is the counter-example
and it ended in a sunset notice.

The retention numbers are the sobering part. Across 75,000+ subscription apps
([RevenueCat, State of Subscription Apps](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026)):

- **~72% of annual subscribers cancel within the first year** (worsened from
  ~56% the prior year). 35% of annual cancellations happen in month one.
- Hard paywalls convert at a **10.7% median download-to-paid** at day 35 versus
  **2.1% for freemium** — roughly 5x. Revenue per install at day 60: $3.09 vs
  $0.38.
- 1-year retention is essentially identical between the two models (27% vs 28%),
  so the hard-paywall advantage is acquisition, not stickiness.

Now apply the dual-adoption multiplier. Every one of those numbers assumes one
user. A couples app needs two. If partner-B activation is 60% and each partner
independently churns at category rates, the couple-level survival curve is
roughly the product of two individual curves. **A couples app with
category-average per-user retention has materially worse couple-level retention
than a solo app with the same numbers.** This is not a marketing problem; it is
arithmetic, and it is why this category's graveyard is long.

---

#### 3. What the evidence actually supports

##### 3.1 The strongest single study in this space

The best available evidence for the *app* form of this category is a mixed-methods
evaluation of Paired published in JMIR
([PMC12001865](https://pmc.ncbi.nlm.nih.gov/articles/PMC12001865/)). It is worth
reading in full. Headline findings:

- MQoRS relationship-quality score was **35.5% higher for users of >3 months
  versus new users** (7.03 vs 5.19; 95% CI 31.1–43.7%; *P*=.002).
- **70.6%** (223/316) of users who used it 6–7 days/week agreed their
  relationship felt stronger, versus **54.1%** (106/196) of less-frequent users
  (*P*<.001).
- 59.5% (440/740) overall agreed the relationship felt stronger.
- Longitudinal arm: 440 users across four time points over three months,
  improvements across communication, emotional connection, conflict, and sexual
  intimacy.

**Be careful with this.** The duration and frequency findings are
cross-sectional and correlational on a self-selected sample of *paying
subscribers*. The obvious rival explanation — couples whose relationships are
going well keep the subscription, and couples whose relationships are not, don't
— is not ruled out. The authors say as much: the sample "may be more open to
positive relationship care and more digitally literate," the design "precludes
generalization to all Paired users," app metrics were not obtained (usage was
self-reported), and nothing was measured beyond three months. It is proof of
concept, not proof of effect.

The wider meta-analytic literature is consistent but weak: a 2025 BMC systematic
review and meta-analysis found a significant, moderate pooled effect for digital
interventions on relationship satisfaction, while flagging high heterogeneity,
frequent "some concerns" or "high" risk-of-bias ratings, and relationship
satisfaction often being only a secondary outcome
([BMC Psychology](https://link.springer.com/article/10.1186/s40359-025-03444-y)).

**Practical read: the mechanism with the most support in this category is a
short, recurring, reciprocal prompt that produces an offline conversation.** Not
courses. Not scores. Not content volume.

##### 3.2 The two qualitative findings that should change the product

Both come from the same JMIR paper and both are more actionable than the
effect sizes.

1. **The intervention is the partner, not the content.** "We have shown that an
   intervention without these features can be personally relevant because
   partners effectively create content for each other. They 'receive' an
   intervention that has a unique human touch (their partner's) that is not only
   personalized but intimately personal." This is why the content-treadmill
   complaint (22% of bad reviews) is a *symptom*: the app is treated as a
   content library when the value is the exchange.

2. **Streaks became a commitment scoreboard.** An interviewee: *"I'm on a streak
   of 27 days and he's on 2, it gets to me... feeling like he's not as committed
   to working on our relationship."* The paper's own warning: "App-based
   indicators of conjoint accountability may cause difficulties for couples
   where problematic relationship dynamics already exist."

There is also a quietly important line: users "may discuss questions with their
partner who does not have the app." Partial adoption works. That is a lever for
the dual-adoption problem, and section 5.2 uses it.

##### 3.3 Gottman, honestly

Gottman's work is the most commercially applied relationship science and the
most oversold. The defensible parts: observable conflict-interaction patterns
predict outcomes; contempt is the most corrosive; repair attempts matter; the
positive-to-negative ratio during conflict is a real, replicated correlate.

The parts to avoid quoting: the famous 90%+ divorce-prediction accuracy figures
were largely fitted post hoc rather than cross-validated. Heyman and Slep (2001)
raised overfitting concerns; Stanley, Bradbury and Markman (2000) criticised the
four-horsemen work on conceptual and methodological grounds; and a
cross-validation attempt (Kim, Capaldi & Crosby, 2007) did not reproduce the
prediction accuracy
([The Hazards of Predicting Divorce Without Crossvalidation](https://www.researchgate.net/publication/6730328_The_Hazards_of_Predicting_Divorce_Without_Crossvalidation)).
The "magic five hours" is a practitioner heuristic, not a trial result. Use
Gottman as a source of *prompt content and framing*; do not build a diagnostic
or a score on it, and do not put "research-backed" on a marketing page pointing
at a number that did not cross-validate.

**Self-expansion (Aron)** is better-supported than most app features that cite
it: shared novel and challenging activity is reliably associated with
relationship quality via inclusion-of-other-in-self
([overview](https://en.wikipedia.org/wiki/Self-expansion_model)). Worth noting
that the same literature finds *non-shared* self-expansion can reduce passion
unless the partner supports it — so "do a new thing together" is supported;
"track your individual growth in a couples app" is not.

**Gratitude and perceived partner responsiveness** are real constructs with real
literatures, and expressed gratitude is one of the few micro-interventions with
plausible transfer to an app. The evidence for a *digital* gratitude prompt
specifically improving relationship outcomes is thin. Treat as promising, not
established.

**Features with no evidence base worth naming:** love-language typologies
(popular, commercially durable, empirically weak), relationship "scores" and
health ratings, compatibility percentages, and streaks. Streaks have evidence —
against them (§3.2).

##### 3.4 Segments

| Segment | Real difference in need | Fit with what is built |
|---|---|---|
| **Dating (<1 yr)** | Novelty and disclosure. High willingness to try, highest breakup rate, no shared history to archive | Poor. The archive is empty and the relationship may not survive the trial |
| **Long-term unmarried / cohabiting (1–5 yrs)** | Drift and routine. Have real shared history; not yet in the married-and-invisible phase | **Strong.** This is literally who `src/sample/` describes |
| **Married / long-tenured** | Best archive fit, but lowest propensity to download a relationship app absent a crisis | Good product fit, poor acquisition fit |
| **Long-distance** | Highest daily-contact motive of any segment; asynchronous presence is the whole problem | The only segment for which the built chat and Moments modules have a genuine reason to exist |
| **New parents** | Well-evidenced decline in relationship satisfaction, medium effect from pregnancy to 12 months postpartum ([Frontiers meta-analysis](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.901362/full)) — but childless newlyweds decline similarly over comparable spans, so the parenthood-specific component is smaller than it looks. Effective interventions here are facilitated co-parenting programmes such as Family Foundations, not archives | Poor. Wrong product, and the least free time of any segment |

**Recommended wedge: long-term unmarried couples, 1–5 years, cohabiting.**
Not because it is the biggest market, but because the archive's value is a
function of history already accumulated, and this cohort has enough of it to get
value on day one from the onboarding flow that is already built
(`days-that-matter.tsx`, `first-date.tsx`, `first-memory.tsx`).

**Long-distance is the cheapest secondary test**, and it is a positioning
change, not a build: the same app, described differently in the store listing.
It is also the only story under which the 5,164 lines of chat are a strategic
asset rather than a sunk cost. *Speculative — worth an ASO experiment, not a
roadmap commitment.*

---

#### 4. Do next

Ordered. Each item states what it is in this codebase's terms, why, rough cost,
how it fits what exists, and the metric that says it worked.

##### 4.1 Pick a backend and persist one narrow slice — do not wait for the v3 contract

**What.** Stand up account + pairing + one shared object type + push, on a BaaS
(Supabase or Firebase), behind the service boundaries that already exist. Every
`src/services/*/index.ts` is already a one-line swap point; that architecture
decision was correct and now needs cashing in.

**Why.** Nothing persists. Nothing notifies. **The product's central hypothesis
— that a couple will open this daily — is currently untestable**, and no
recommendation below can be validated without this. Waiting on the v3 auth
contract is not an option: `2026-08-16-v3-contract-blockers.md` B8 records that
v3 drops every couples, profile and onboarding endpoint. The contract cannot
serve pairing at all, and seven other blockers remain open.

**Cost.** The largest item here — weeks, not days. But it is the only one that
is unavoidable, and building it on a BaaS rather than a bespoke contract saves
most of that.

**Metric.** A paired couple's data survives an app restart on two devices, and
a write by one partner produces a push on the other's device within 5 seconds.

##### 4.2 The Daily Question, delivered as a message in the existing chat

**What.** A new `services/prompts/` mock-then-real service and a `prompt` variant
on the existing `ChatMessage` union in `src/services/chat/types.ts`. The prompt
arrives in the conversation as a distinct bubble; answering is a reply. The
reciprocity rule: **your partner's answer is masked until you answer.** No new
screen, no new tab, no new navigation.

**Why.** This is the only mechanic in the category with published evidence
behind it (§3.1), and the reciprocity gate is simultaneously the answer to the
dual-adoption problem (§5.2). It also converts the chat module from a doomed
iMessage competitor (§2.1) into the delivery surface for the one thing that has
a reason to exist here.

**Cost.** Small. `MessageBubble`, `Composer`, `ReplyPreview`, `chatStore`,
`DayDivider` and a 40-file test harness already exist; this is a message kind
and a service, not a feature area.

**Metric.** Reciprocity completion — the share of prompts where **both**
partners answered within 48 hours. Target something like 40% in week 4; below
20% and the mechanic has not landed.

##### 4.3 Answered prompts become memories automatically

**What.** When both partners have answered, the exchange writes itself into the
Memories library as a dated entry. `chatStore.ts` already has
`memoryFromMessage`; this is that path, run automatically at reciprocity rather
than manually from the context menu.

**Why.** Two problems, one change.

- *Cold start.* Memories opens empty for a real couple; the populated library in
  the design is `src/sample/memories.ts`. Manual entry is the highest-friction
  action in the product and nobody does it twice.
- *Content treadmill.* 22% of the category's bad reviews are "the questions
  repeat." An app with an archive can make repetition the **feature**: show the
  couple what they answered to this same question a year ago. Paired
  structurally cannot do this. LoveOS already built the archive.

**Cost.** Small-to-medium. The memories service, store, detail screen and
on-this-day route all exist.

**Metric.** Archive accretion — median memories per couple at day 30 that were
created *without* the manual add flow. If that number is not several times the
manual-entry count, the automation is not working.

##### 4.4 Design the exit before launch, not after

**What.** Three things, specified now because they constrain the pairing schema
in 4.1:

1. **Take my copy** — export everything, per person, always available, no
   partner approval, no partner notification.
2. **Pause our space** — reversible, freezes writes, keeps reads. For the fight
   that is not a breakup.
3. **Unpair** — one side can trigger it. Both are notified, with a grace window
   (7 days is a reasonable default) before shared content is severed. Each
   person keeps their own copy; neither can unilaterally delete the other's.

**Why.** There is currently no unpair, no delete, no export anywhere in `src/`.
This is not a missing feature; it is a missing *design*, and it is the
under-served question in the whole category. The evidence:

- When Couple shut down, users had to fight to get their shared history out
  ([rymc.io](https://rymc.io/blog/2019/decoupling/)). Tuned at least gave a
  data-download window before it went dark
  ([TechCrunch](https://techcrunch.com/2022/07/25/meta-is-shutting-down-tuned-its-social-app-for-couples/)).
- CSCW 2026 research on digital severance (Yin, Chiang & Xiao, 30 participants)
  finds that severance is a *relational event* shaped by power and control:
  people post-breakup act as "archivists or revisionists" of shared data, and
  asymmetric severance — one person can cut, the other cannot — produces
  disempowerment and ambiguous loss for both parties
  ([arXiv 2601.03551](https://arxiv.org/abs/2601.03551), [ACM](https://doi.org/10.1145/3788050)).
- Related CHI 2024 work on shared sexual content after a breakup documents how
  badly platforms serve the deletion question
  ([ACM](https://dl.acm.org/doi/10.1145/3613904.3642722)).

The design principle that falls out: **shared memories are two copies, not one
jointly-owned copy.** Store them that way from day one. Joint ownership sounds
romantic and is a legal and emotional trap — it means one person's grief can
delete the other's history, or one person's refusal can hold it hostage.

**Cost.** Small if built alongside the pairing schema this month. Very expensive
as a retrofit, because it is a data-model decision, not a screen.

**Metric.** Severance completion — of couples who unpair, the share who
successfully exported first. And, honestly: treat a *high* export rate as
success. A person who leaves with their memories intact is a person who might
recommend the app.

##### 4.5 A safety pass on what already exists

An app holding a couple's private archive, in an intimate two-person account, is
a coercive-control surface by default. These mitigations are cheap now and hard
later.

- **No location. Ever.** eSafety Commission research links location-sharing
  features to increased digital coercive control
  ([ABC coverage](https://www.abc.net.au/news/2025-05-15/location-sharing-apps-esafety-commission-coercive-control/105289994)).
  There is none in the build today. Keep it that way and write it down as a
  product principle, because it will get proposed.
- **No cross-partner accountability displays.** No streaks compared between
  partners, no "last seen", no "Sarah hasn't answered yet" nag. The JMIR study
  documents the exact harm (§3.2). Note that `ReadReceipt.tsx` already exists in
  chat — decide deliberately whether it applies to prompt answers. Recommend
  not.
- **A genuinely private space.** Per-memory and per-day private notes the
  partner cannot see and cannot be told exist. Paired reviewers name this gap
  precisely: because answers are shared, "it is not the place to process a
  frustration you are not ready to say out loud yet." The absence of a private
  layer is itself a coercion risk — an app where *everything* is visible to the
  partner is an app that can be demanded as proof.
- **A quiet exit.** Export and unpair must be reachable without generating a
  partner-visible signal the leaving person cannot control, and the account
  screen must not advertise recent activity. The NNEDV Safety Net checklist for
  survivors is the right test to design against
  ([techsafety.org](https://www.techsafety.org/choosingapps/)); "safety by
  design" as a general framing is well set out in
  [The Conversation](https://theconversation.com/technology-enabled-abuse-how-safety-by-design-can-reduce-stalking-and-domestic-violence-170636).
- **App-level biometric lock.** Cheap, and the single most requested control by
  people whose partner has physical access to their phone.

**Cost.** Mostly decisions, plus one private-notes field and one lock screen.
Days.

**Metric.** This one does not get a growth metric. The check is a written
threat-model doc, reviewed against the Safety Net checklist, before the first
external build ships.

---

#### 5. The three questions that decide whether this works

##### 5.1 Why would a couple open this daily?

Today: they would not. Nothing in the app changes between yesterday and today.
An archive is opened on anniversaries and after holidays, which is a
several-times-a-year rhythm, not a daily one. A chat is opened daily but only if
it is *the* chat, and it will not be.

The daily-open engine has to be something that (a) is new each day, (b) is
generated by the partner rather than by content, and (c) produces an offline
conversation rather than more screen time. That is exactly the prompt-plus-
reciprocity mechanic in 4.2, and it is why it is ranked where it is.

A second, slower engine arrives once 4.3 has filled the archive: "on this day"
resurfacing, which is the mechanic that makes photo apps sticky. It cannot come
first, because it needs a year of content.

Note the anti-metric. A Paired interviewee: *"it's a little time spent on the
app for a lot of love gained."* Rising session length in this product is a
symptom of a leak, not a win. Do not optimise it.

##### 5.2 The dual-adoption problem

This is the structural defect of the category and it deserves a direct attack
rather than a nudge.

**Three things to do.**

1. **Make partner-B's first action a reply, not a signup.** The invite should
   deliver *content*, not an empty account — partner A answers the first
   question, and the invite partner B receives contains "Chandu answered
   today's question. Answer to see it." Partner B arrives with a reason to be
   there in the first ten seconds instead of an onboarding flow.
2. **Make the reciprocity gate do the retention work.** Masking A's answer until
   B answers means A has a self-interested reason to nudge B — the app never has
   to. The JMIR study observed exactly this happening organically ("partners
   remind each other to answer questions").
3. **Make solo use non-embarrassing.** The same study found users discussing
   questions "with their partner who does not have the app." A single-player
   mode that still delivers a prompt and still writes to the archive keeps the
   funnel alive when partner B takes three weeks to join, and it means a
   half-adopted couple is a slow conversion rather than a dead account.

What *not* to do: guilt mechanics, partner-visible activity scores, or "your
partner hasn't opened the app in 5 days." Every one of those is a coercion
surface (§4.5) and the evidence says they backfire (§3.2).

**Measure it as W4 dual-active rate:** the share of paired couples where *both*
partners opened the app on ≥4 distinct days during week 4. Not DAU, not MAU, not
per-user retention. This single number is the product.

##### 5.3 Privacy and trust

The brand promise is already written: *"Private by design. Your space belongs to
both of you."* Nothing in the build backs it yet, and the gap between that
sentence and an unencrypted BaaS is the kind of thing that ends a couples app
publicly.

Minimum credible position for launch:

- No ads, ever, and say so in the store listing. This is a differentiator worth
  more than the revenue (§6.3).
- Encryption at rest and in transit as table stakes. Full E2EE is genuinely hard
  with a two-device sync model, key recovery, and server-side search — do not
  promise it unless it is built. Promising E2EE and shipping TLS is worse than
  promising nothing.
- No training on user content, stated plainly. The "LOVEOS AI" card in
  `src/copy/chat.ts` is currently non-interactive; the moment it becomes real,
  this becomes the first question anyone asks.
- A plain-language data page: what is stored, who can see it, what happens on
  unpair, what happens if the company shuts down. That last one is the promise
  Couple broke and Tuned kept, and it costs nothing to make now.

---

#### 6. Do later

- **"On this day" as a push.** The archive's real daily hook. The route
  (`memories/on-this-day.tsx`) and copy already exist. Blocked on 4.1 (push) and
  4.3 (content). Revisit once median archive depth passes ~30 items.
- **Calendar as real coordination.** `CalendarScreen.tsx` and `calendar.ts` exist
  and realise the Figma pinned note. Cupla shows the demand is real, and Cupla's
  reviewers also show that logistics buyers and connection buyers are different
  people. Finish it as a supporting utility, not a pillar, and only after 4.2.
- **The Timeline module.** Empty scaffolding, tab already stubbed `live: false`
  in `appNav.ts`. It is the natural home for the story data onboarding already
  collects. Low urgency: it is another retrospective surface, and the product
  has two already.
- **Monetisation.** Do not price before you know W4 dual-active retention;
  pricing a product with unknown retention is guessing. When you do:
  - **One price per couple, not per person.** Paired's per-person pricing is a
    named, recurring review complaint. Cupla prices per couple. This is free
    differentiation.
  - **Freemium, not a hard paywall**, despite hard paywalls converting ~5x
    better at day 35. The counter-argument is honest and worth stating: in a
    two-person product, a paywall that partner B hits is not a monetisation
    event, it is a broken product — and 28% of the category's bad reviews are
    already about paywalls. The RevenueCat data also shows 1-year retention is
    effectively identical between the two models, so the hard-paywall advantage
    is front-loaded acquisition, which is the wrong thing to optimise before
    retention is proven.
  - Budget for ~72% annual churn (§2.3) in any model.
- **Photo widget / "mini Snap".** From the founder's backlog. This is a real
  idea, but it is a *distribution* play, not a retention play: a home-screen
  widget showing the partner's latest photo is the kind of thing that gets
  screenshotted and shared, and Locket proved the format works. Two conditions
  before building it: 4.1 must exist (widgets need a real backend and background
  refresh), and 4.2 must have proven the daily habit — a widget on a product
  nobody opens daily is a widget nobody installs. Cost is non-trivial: native
  WidgetKit and App Widget work, outside the Expo-managed comfort zone the repo
  currently sits in, plus `expo-image-picker`/camera which are not installed.
  Revisit in the quarter *after* the daily habit is proven.

---

#### 7. Do not build

Including the founder's own backlog, assessed straight.

##### 7.1 Chat as a messaging replacement — stop investing

`module-03-chat` is 5,164 lines, the largest module in the repo, and the
strategic case for it is the weakest. No couple will move their conversation off
iMessage or WhatsApp into an app with no history, no group chats, no delivery
guarantee and one contact. **Couple and Tuned both built exactly this, both
reached real scale, and both are dead** (§2.1).

This is not "delete it." The chat surface becomes valuable the moment it carries
the daily prompt (4.2) — as a *ritual channel*, not a messenger. But stop adding
messenger features. Specifically: do not wire `expo-image-picker`, `expo-camera`
or audio recording for chat attachments (CHAT-081 flags all three as mocked);
wire them for **Memories** instead, where a captured photo has somewhere to
live. And do not build the "LOVEOS AI" card into a real assistant — it is
currently a non-interactive card in the Figma frame and should stay one until
there is a reason for it beyond "everyone has AI now."

##### 7.2 Call and video statistics ("you have called each other n times… 22 hours totally")

From the Figma backlog. **Do not build this.** Two independent reasons, either
of which is sufficient.

- **Cost.** It presupposes real voice and video calling. There is no WebRTC
  dependency in `package.json`; `VoiceMomentScreen.tsx` and
  `VideoMomentScreen.tsx` are UI shells. Shipping real calling means signalling
  infrastructure, TURN servers, per-minute cost, and platform call-UI
  integration — a quarter of work minimum — for a payoff that is a vanity
  counter.
- **Safety.** A per-partner log of call frequency and duration is precisely the
  artefact that becomes an instrument in a controlling relationship: *"you only
  called me twice this week."* It is the same failure mode as the streak
  scoreboard the JMIR study documented (§3.2), with a harder edge. This is the
  clearest "never" in the backlog, not merely a "later."

##### 7.3 Note-taking in calls

Depends entirely on 7.2 existing, so it inherits the same verdict. Setting that
aside: people do not take minutes of a phone call with their partner. *This
second point is speculative — I found no research either way — but the
dependency alone settles it.*

Note-taking **in chat**, separated from calls, is a different and much better
idea: it is close to the "Leave a little note" empty-state card the Home
dashboard already draws, and it is cheap. Fold it into the prompt work (4.2)
rather than treating it as its own feature.

##### 7.4 Calendar *booking*

The founder's backlog says "calendar booking," which implies reserving
restaurants or activities. That is a supply-side marketplace wearing a calendar's
clothes; see 7.5. A shared calendar without booking is already partly built and
is in §6.

##### 7.5 A marketplace, and ads

Both floated. Both are wrong for this product, and the reasons differ.

**Ads** destroy the only asset the product currently has. `welcome.ts` promises
*"Private by design. Your space belongs to both of you."* An advertisement
between two memories is the single fastest way to make that sentence a lie, and
it is unrecoverable — it is the thing every review will lead with. The
arithmetic is bad too: two users per paying account means roughly half the ad
inventory per relationship of a normal app, at CPMs for an audience you cannot
segment without reading intimate content, which is the one thing you have
promised not to do.

**A marketplace** (gifts, flowers, date bookings, experiences) needs supply-side
operations, merchant relationships, fulfilment support and returns handling —
none of which this team has — to serve a transaction that happens perhaps twice
a year per couple. The unit economics of an anniversary-frequency purchase
cannot fund a subscription-frequency product.

Honeydue is the case to sit with: 500,000 registered users, genuine organic
growth, a real couples niche, a free model — and a sunset notice in August 2026.
The lesson is not "monetise harder." It is that this category only supports a
business when someone pays for the core product, and every attempt to avoid
charging for it has ended the same way.

##### 7.6 Streaks, scores, and compatibility percentages

Streaks: the JMIR study documents them turning into a commitment scoreboard
between partners, and Evergreen's reviewers name streaks-plus-thin-content as
the exact churn moment (§2.2, §3.2). Relationship health scores and
compatibility percentages: no evidence base, reductive by construction (Lupton's
critique, discussed in the JMIR paper), and a ready-made instrument for a
controlling partner. A gentle "you've answered together 14 times" retrospective
in the archive is fine; a live, comparable, partner-visible counter is not.

##### 7.7 `module-06-memories`

Empty scaffolding duplicating `module-03-memories`, already flagged for deletion
in the chat spec §14. Delete it. Not a strategy item — just noise in every
future search of the tree.

---

#### 8. The metrics that matter

Six numbers. Everything else is decoration.

| Metric | Definition | Why |
|---|---|---|
| **W4 dual-active rate** | % of paired couples where *both* partners opened on ≥4 distinct days in week 4 | The only number that measures the actual product. Not DAU |
| **Reciprocity completion** | % of prompts both partners answered within 48h | Whether the core mechanic landed |
| **Partner-B activation** | % of invites redeemed within 72h, plus the drop-off screen | The dual-adoption funnel's single leakiest point |
| **Archive accretion** | Median memories per couple at day 30 created *without* manual entry | Whether 4.3 solved cold start |
| **Severance rate + export rate** | % of couples who unpair; of those, % who exported first | Trust. A high export rate is a good outcome |
| **Session length** | Tracked as an **anti-metric** | If it rises, the product has become a place to spend time instead of a prompt to leave it |

---

#### 9. Sources

Competitive and market:
- [Paired vs Lasting: 5 Couples Apps Ranked (2026) — 1–3 star review analysis](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026)
- [Paired App Review, The Quality Edit](https://www.thequalityedit.com/articles/paired-app-review)
- [Paired App Reviews: Pros, Cons & Alternatives, CoupleBee](https://couplebee.com/blog/paired-app-reviews)
- [Couple (app) — Wikipedia](https://en.wikipedia.org/wiki/Couple_(app))
- [Decoupling, or: where's my data? — Ryan McGrath, on Couple's shutdown](https://rymc.io/blog/2019/decoupling/)
- [Meta is shutting down Tuned — TechCrunch](https://techcrunch.com/2022/07/25/meta-is-shutting-down-tuned-its-social-app-for-couples/)
- [Talkspace acquires Lasting — MobiHealthNews](https://www.mobihealthnews.com/news/talkspace-dives-relationship-counseling-acquisition-lasting)
- [Mission Lane acquires Honeydue — Finextra](https://www.finextra.com/pressarticle/87810/mission-lane-acquires-honeydue)
- [Honeydue on the App Store (sunset notice)](https://apps.apple.com/us/app/honeydue-couples-finance/id1157633945)
- [RevenueCat, State of Subscription Apps — benchmarks](https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026)

Evidence base:
- [Exploring the Potential of a Digital Intervention to Enhance Couple Relationships (the Paired App): Mixed Methods Evaluation — JMIR / PMC12001865](https://pmc.ncbi.nlm.nih.gov/articles/PMC12001865/)
- [Effectiveness of digital interventions on relationship satisfaction: systematic review and meta-analysis — BMC Psychology 2025](https://link.springer.com/article/10.1186/s40359-025-03444-y)
- [Transition to Parenthood and Marital Satisfaction: A Meta-Analysis — Frontiers in Psychology 2022](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.901362/full)
- [Changes in relationship satisfaction across the transition to parenthood: a meta-analysis — PubMed](https://pubmed.ncbi.nlm.nih.gov/20001143/)
- [The Hazards of Predicting Divorce Without Crossvalidation — on Gottman's prediction accuracy](https://www.researchgate.net/publication/6730328_The_Hazards_of_Predicting_Divorce_Without_Crossvalidation)
- [Self-expansion model — overview](https://en.wikipedia.org/wiki/Self-expansion_model)

Breakup, safety and trust:
- [Dissolving a Digital Relationship: A Critical Examination of Digital Severance Behaviours in Close Relationships — CSCW 2026](https://arxiv.org/abs/2601.03551) ([ACM](https://doi.org/10.1145/3788050))
- ["Delete it and Move On": Digital Management of Shared Sexual Content after a Breakup — CHI 2024](https://dl.acm.org/doi/10.1145/3613904.3642722)
- [Choosing and Using Apps: Considerations for Survivors — NNEDV Safety Net](https://www.techsafety.org/choosingapps/)
- [Technology-enabled abuse: how 'safety by design' can reduce stalking and domestic violence — The Conversation](https://theconversation.com/technology-enabled-abuse-how-safety-by-design-can-reduce-stalking-and-domestic-violence-170636)
- [Location-sharing apps linked to increased risk of digital coercive control, eSafety research — ABC](https://www.abc.net.au/news/2025-05-15/location-sharing-apps-esafety-commission-coercive-control/105289994)

Internal:
- `docs/superpowers/specs/2026-08-30-chat-module-design.md` (§13 out-of-scope backlog, §14 known inconsistencies)
- `docs/qa/chat-test-cases.md` (CHAT-081 mocked capture, manual-only cases)
- `docs/superpowers/specs/2026-08-16-v3-contract-blockers.md` (B8: v3 drops all couples endpoints)
- `src/config/brand.ts`, `src/copy/welcome.ts` (the privacy promise)
- `src/state/relationshipStore.ts:28` ("Nothing persists")

## Research: couples-real-problems

### The real problems couples face — and which ones software can touch

Companion to `couples-app-strategy.md` (market, competitors, monetisation, retention, relationship-science evidence). That document's only "problem" section is the dual-adoption problem, which belongs to the business, not the couple. This document exists to fix that: ten problems couples actually live with, what the evidence says, what it feels like from inside, and — the point of the exercise — an honest verdict on whether an app can help at all.

Status: complete draft.

#### 0. How to read this

- **Ranking** (Section 1) is prevalence × severity × software-tractability, judged qualitatively, not computed from a formula. A problem can be extremely prevalent and severe (money) and still be low-tractability if the mechanism of harm is structural, not informational.
- **Evidence tiers**: *Strong* = peer-reviewed, replicated, or large-sample (Gottman longitudinal cohorts, national surveys like Natsal-3, meta-analyses). *Moderate* = single peer-reviewed study, credible practitioner consensus, or large but non-random survey (Ipsos, YouGov-style panels). *Weak* = advocacy-site or content-marketing summaries repeating a stat without a visible source — common in this space and flagged where used. *Extrapolation* = my own inference where I could not find direct evidence, marked as such.
- Real user voice was harder to source cleanly than expected — see the note at the end of Section 2. Where I could not find verbatim forum quotes I say so rather than inventing them.

#### 1. Problems, ranked

Ranked by prevalence × severity × how much a software layer (as opposed to a person, a policy, or a therapist) can plausibly move the needle.

| Rank | Problem | Prevalence | Severity | Software-tractability | Verdict |
|---|---|---|---|---|---|
| 1 | Feeling unappreciated / unseen | High — cited in ~17–25% of breakups as "lack of respect/appreciation" (Natsal-3) and pervasive below the threshold of breakup | High — erodes the positive-sentiment buffer that makes everything else survivable | **Moderate** — noticing and naming effort is a narrow, well-defined act software can prompt | Software can help meaningfully, in a small way, if it stays narrow |
| 2 | Communication breakdown (demand-withdraw, stonewalling) | Very high — the demand-withdraw pattern is one of the most replicated findings in couples research | Very high — predicts divorce with reported >80–90% accuracy in Gottman's cohorts | **Low-moderate** — the pattern is behavioral and reflexive, not a knowledge gap; teaching a skill is not the same as changing a nervous-system reaction in the moment | Software can teach the concept; it cannot be in the room when flooding happens |
| 3 | The mental load / division of domestic labour | Very high — women perform ~37% more unpaid domestic work even in dual-earner households | High — a documented cause of chronic resentment, burnout, and depression/anxiety in the overloaded partner | **Low** — the imbalance is structural (who actually does the noticing, planning, remembering) and a shared task list has a well-documented history of becoming one more thing the same partner maintains | Software can make the load *visible*; it cannot redistribute it, and has failed at this before |
| 4 | Money — what couples fight about | High — ~34% of partnered Americans name money as a conflict source, ~70% of married couples argue about it monthly | High — more likely than other conflict types to recur, trigger contempt, and predict divorce (30% higher divorce risk at weekly-argument frequency) | **Low** — money conflict is about values, power, and trust, not a shared-budget UI; fintech has tried this for a decade with limited relationship-level effect | Software can surface facts (who spent what); it cannot arbitrate values |
| 5 | Conflict repair (after the fight) | Universal — Gottman's core finding is that *all* couples fight; repair capacity is what differs | Very high — inability to repair, not conflict frequency, predicts deterioration | **Moderate** — repair is a delayed, asynchronous, low-arousal act (an apology text, a note) which is exactly the register software communicates in well | The best-fit problem on this list for a chat-and-memory product, and currently unaddressed by LoveOS |
| 6 | Drift and routine in long-tenure relationships | High — "grew apart" is the single most-cited reason for relationship breakdown (36–39%), more than infidelity or arguments | Moderate-high — slower and quieter than a fight, but the "slow drift" divorce pattern surfaces ~16 years in | **Moderate** — noticing patterns over time and resurfacing shared history is something software (especially an archive) is structurally suited to do | Plausible fit, and close to what LoveOS's memory module already does — if it's used for this and not just nostalgia |
| 7 | Time scarcity in dual-career households | High and rising — dual-earner couples spend ~0.6 fewer hours/day together than single-earner couples; combined paid+unpaid work runs ~139 hrs/week | Moderate-high — a 1 SD drop in couple leisure time roughly doubles break-up probability in one cited estimate | **Low** — the scarcity is real hours in a day, not a discovery or coordination problem; scheduling nudges do not create time | Software can protect the time that exists (a calendar hold); it cannot manufacture time that doesn't |
| 8 | Intimacy and desire discrepancy | High — estimates of desire mismatch range widely (25–80% depending on definition and study), 15–20% of marriages meet a "sexless" threshold | High where present — sex-related dissatisfaction can account for a large share of overall relationship dissatisfaction in some estimates | **Low** — this is medical, psychological, and deeply private; a general consumer app has no business here beyond the lightest possible nudge to talk | One of the clearest "leave alone, refer out" problems |
| 9 | The transition to parenthood | Very high among parents — meta-analytic evidence of a medium satisfaction decline from pregnancy to 12 months postpartum | High — compounds with sleep deprivation, mental load and time scarcity simultaneously | **Low-moderate** — some of the decline is developmental and not preventable (a meta-analysis found non-parent couples also decline somewhat over the same period); an app is not a co-parent | Marginal help at best; risk of the app implying a fixable problem that mostly isn't |
| 10 | Long-distance relationships | Moderate — ~34% of college-age relationships are long-distance at any time; overall LDR failure rate (~42%) is close to geographically-close couples | Moderate — the highest-risk period is actually *closing* the distance (~33% break up within 3 months of moving in together), not the distance itself | **Moderate** — this is the one problem on the list that is substantially a communication-bandwidth problem, which is squarely software's home turf | Good fit, but LoveOS's current chat is a poor substitute for what actually correlates with LDR survival (daily video, concrete reunion plans) |

Where the ranking differs from a naive "what does an app have features for" view: mental load and money rank near the top of severity but near the bottom of tractability. This is deliberate — severity and tractability are different axes, and conflating them is exactly how products end up promising more than they can deliver.

#### 2. Communication breakdown

**Prevalence and severity.** The demand-withdraw pattern — one partner pursues/criticizes, the other withdraws/stonewalls, each response intensifying the other — is one of the most extensively studied dysfunctional couple dynamics (moderate-strong evidence; multiple replications, summarized in an eScholarship review: https://escholarship.org/content/qt1g37d6w6/qt1g37d6w6.pdf). Gottman's Four Horsemen (criticism, contempt, defensiveness, stonewalling) reportedly predicted divorce with over 90% accuracy in his longitudinal cohorts (https://www.gottman.com/blog/the-four-horsemen-stonewalling/), and couples caught in demand-withdraw in their first years of marriage are cited as having an 80%+ chance of divorcing within five years (https://therapydave.com/gottman/demand-withdraw-pattern-destroying-relationships/) — treat the specific "80%" figure as *moderate* evidence; it is widely repeated in practitioner sources but I could not trace it to the original dataset.

**What it looks like day to day.** Not a dramatic fight — the small, repeated failure to turn toward a partner's "bid for connection" (a comment, a sigh, a "look at this"). Gottman's Love Lab found that couples who stayed together turned toward bids 86% of the time; couples who later divorced did so only 33% of the time (https://www.simplypsychology.com/articles/bids-for-connection-gottman). Concretely: one partner mentions something from their day and gets a grunt in response; a request becomes a complaint becomes contempt; one person raises their voice, the other goes quiet and physically checks out (flooding → stonewalling), and the conversation ends with nothing resolved and both people feeling worse than before it started.

**Verdict: low-to-moderate tractability.** This is a real-time, physiological, reflexive pattern — Gottman's own remedy is a 20-minute physiological self-soothing break before productive conversation can resume. Software is not present in the room during flooding and cannot regulate a nervous system. What it *can* do: teach the vocabulary (bids, flooding, the four horsemen) so a couple recognizes the pattern in hindsight, and create a low-stakes asynchronous channel for the things that are hard to say face to face. What it cannot do: intervene mid-argument, and it should not pretend a "communication tip of the day" changes a conditioned response built over years.

*A note on user voice*: I looked for verbatim Reddit/forum text on this and the mental-load and money topics; search results mostly surfaced therapist blogs and content-marketing sites quoting or paraphrasing forum sentiment rather than the original threads (e.g., a paraphrased Reddit exchange — "She's burned out. She sees you as another chore." — surfaced secondhand via an aggregator, not the original post). I'm flagging this rather than presenting paraphrase as direct quotation. The lived texture below is drawn from what practitioner and journalistic sources report users saying, which is a real signal but a weaker one than a primary quote.

#### 3. Drift and routine in long-tenure relationships

**Prevalence and severity.** In the UK's Natsal-3 national survey, "grew apart" was the single most common reason cited for relationship breakdown — 39% of men, 36% of women — ahead of arguments (27–30%), infidelity (18–24%), and lack of respect/appreciation (17–25%) (strong evidence, national probability sample: https://pmc.ncbi.nlm.nih.gov/articles/PMC5363851/, full text https://journals.plos.org/plosone/article/file?type=printable&id=10.1371/journal.pone.0174129). Gottman's research separately describes a "slow drift" divorce pattern distinct from early, hostile divorce — emotionally disengaged couples who separate much later, around 16 years in (moderate evidence, Gottman Institute framing, reported via https://www.psychologytoday.com/us/blog/couples-thrive/202602/were-just-different-now-why-couples-drift-and-what-to-do).

**What it feels like.** Not a rupture — an absence. Date nights become logistics meetings. Partners stop telling each other how their day actually went and settle for the transactional version. Life transitions (career, kids, health) happen in parallel rather than together, and each partner adapts privately; by the time it's named, both people may feel like they're co-managing a household with a stranger.

**Verdict: moderate tractability — the best structural fit on this list for an archive-based product.** Drift is partly a *forgetting* problem — losing track of who you were to each other and what you used to do — and surfacing shared history, resurfacing an old memory, or naming a routine that quietly died are things a well-designed memory feature can plausibly do. The caveat: nostalgia is not the same as re-engagement. An app that only shows you photos of who you used to be, without prompting new shared experience, risks becoming a highlight reel that makes the present routine feel worse by comparison rather than better.

#### 4. The mental load and division of domestic labour

**Prevalence and severity.** This is real, well-documented, and almost entirely absent from `couples-app-strategy.md` (0 mentions), which is the gap this document exists to close.

- Women perform on the order of 37% more unpaid domestic work than men even in households where both partners work full-time (moderate-strong, cross-study synthesis: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10231910/). One cited study found 71.3% of men versus 95.2% of women performing any unpaid domestic activity at all.
- The distinguishing concept in the current research (Daminger, *Journal of Marriage and Family*, 2026: https://onlinelibrary.wiley.com/doi/10.1111/jomf.70029) is that the *cognitive* component — anticipating needs, remembering, planning, worrying — is where the gender gap is widest, and it is precisely the part that doesn't show up on a chore chart. A chore-splitting app measures the wrong half of the problem by construction.
- Health consequences are documented, not just relational ones: work-family-personal time conflict and effort-reward imbalance in unpaid domestic work are associated with depression and anxiety in women specifically, not men, in the same studies (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9407714/).
- Mechanistically: the Gottman Institute's own framework for why this causes long-term damage is that unrecognized "emotional debt" degrades marital satisfaction over time and feeds contempt, one of the four strongest predictors of divorce (moderate evidence, practitioner synthesis: https://drrondaporter.com/the-silent-resentment-trap-mental-load/).

**What it feels like from the inside.** Descriptions converge on a specific complaint: it's not that the partner refuses to help with a task when asked — it's that being asked *is* the labor. "None of it appears on a chore chart, yet it shapes how smoothly daily life runs" is a common framing across multiple sources describing remembering birthdays, monitoring school communications, noticing a child's mood shift, tracking when the milk runs out before it's out. The distinctive emotional note is not anger so much as *invisibility* — doing continuous, effortful work that produces no artifact the other partner can see, and therefore no credit.

**Verdict: low tractability, and worth being blunt about why.** Shared task-list and chore-splitting apps (Tody, OurHome, Maple, plus every general to-do app repurposed for this) have existed for years and the underlying research complaint hasn't moved, because:
1. A shared list still requires someone to *notice* what needs to go on it — which is the cognitive labor in question. Software can host the list; it cannot do the noticing.
2. In practice, one partner (usually the one already carrying the mental load) ends up maintaining the app too, adding a second layer of invisible labor: app administration.
3. The imbalance is downstream of division-of-labor norms, employment asymmetries, and household power — not a UI or reminder-system deficit.

What software *can* honestly do: make the invisible visible after the fact — a log of who initiated what, surfaced not as a scoreboard (which breeds resentment and gamed inputs) but as an occasional, gentle reflection prompt ("here's what got carried this month"). That's a modest, awareness-level intervention, not a fix. Any product framing that implies an app will "solve" mental-load imbalance should be treated as a trust-breaking overclaim.

#### 5. Money — what couples actually fight about

**Prevalence and severity.** About 34% of partnered Americans name money as a source of relationship conflict, rising to 47% among 18–24 year-olds (Ipsos, moderate-strong: https://www.ipsos.com/en-us/money-fights-one-three-34-partnered-americans-identify-money-source-conflict-their-relationship). One survey-derived figure puts the average couple at 58 money-related arguments a year, with 70% of married couples arguing about money at least monthly (weak-moderate, industry-survey sourcing: https://101financial.com/money-fights-in-marriage/ and https://www.chipchick.com/2025/03/heres-how-often-couples-fight-about-money-so-lets-break-down-the-numbers-on-financial-feuds). Gottman Institute research (cited via https://www.psychologytoday.com/us/blog/couples-thrive/202405/why-couples-fight-about-money) finds money conflicts more persistent than other conflict types — more likely to stay unresolved, more likely to trigger contempt, more likely to recur — and couples arguing about money weekly are reported as 30% more likely to divorce.

**What it's actually about.** Not the numbers. The recurring texture across sources is disagreement over impulse spending (37% cite a partner spending too much on non-essentials) and honesty (36% admit being untruthful with their partner about money — "financial infidelity"). Underneath that: money functions as a proxy for control, security, and values — frugality versus generosity, present enjoyment versus future safety — which is why it resists resolution the way logistics disagreements don't.

**Verdict: low tractability for a general consumer app, though for different reasons than mental load.** A shared-budget or expense-tracking layer is a solved fintech problem (Splitwise, Honeydue, dozens of others) and doesn't touch the actual conflict, which is about values and trust rather than visibility of transactions — most couples already know roughly what things cost; they disagree about whether spending that money was right. Where software has an honest, narrow role: making spending visible to *both* partners removes one specific fuel source (financial infidelity, i.e., hidden spending) without pretending to adjudicate the values disagreement underneath it. LoveOS, with no financial data model and no plan to build one per the strategy doc, is correctly not building in this space — this section confirms that's the right call, not an oversight.

#### 6. Intimacy and desire discrepancy

**Prevalence and severity.** Estimates vary widely by definition and methodology — a genuine case of source conflict, not just noise. One frequently cited figure: 80% of couples experience mismatched libido at some point (weak sourcing, unclear methodology, via https://www.psychologytoday.com/us/blog/hidden-desires/202503/when-libidos-clash-i-love-you-but-im-not-in-the-mood). Other estimates put the range at 30–40% experiencing some desire mismatch during the relationship, and about 25% reporting a felt difference in desire level at a point in time (moderate, Medium/BYU-linked synthesis: https://medium.com/@matherscd/how-big-a-problem-is-desire-disparity-in-heterosexual-relationships-865ea410ba3e, https://scholarsarchive.byu.edu/facpub/4621). Sexless marriage (variously defined, typically <10 times/year) affects a reported 15–20% of marriages, with mismatched libido cited as present in 67% of those cases (moderate, industry-blog sourcing: https://www.connectedcouples.app/blog/sexless-marriage-statistics). The American Association for Marriage and Family Therapy is cited as identifying desire discrepancy as one of the most frequent presenting issues in couples therapy. Severity: some sources claim sexual dissatisfaction can account for 50–70% of overall relationship dissatisfaction when present (weak — a single widely-repeated figure without a traceable primary study; treat as directionally true, not precise).

**What it feels like.** A private, often shame-laden asymmetry — one partner feeling perpetually rejected, the other feeling perpetually pressured — that couples frequently do not discuss directly because it implicates self-worth and body image on one side and desirability/rejection on the other.

**Verdict: low tractability, and this is a "leave alone" domain for a general consumer app.** This is medical (hormonal, medication-related), psychological (trauma, body image, mismatched attachment needs), and intensely private. It is also one of the areas where a wellness app claiming to help could do real harm — either by trivializing it into a "spice up date night" prompt, or by creating a data trail (frequency logs, mood check-ins tied to intimacy) that becomes a surveillance mechanism inside the relationship itself. The honest software role is a light touch: normalize that discrepancy is common (reduce shame), and point toward a sex therapist or AASECT-certified specialist. Anything past that is out of scope for a product without clinical oversight.

#### 7. The transition to parenthood

**Prevalence and severity.** A 2022 meta-analysis (49 studies, 97 parent samples) found a medium-sized decrease in marital satisfaction from pregnancy to 12 months postpartum, and a smaller further decline from 12–24 months (strong evidence, meta-analytic: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9350520/, https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.901362/full). Notably, the same meta-analysis found non-parent couples also show a small decline over an equivalent period — meaning some of this is simply what happens to satisfaction over years of a relationship, not purely a parenthood effect. First-time parents decline more than second-time parents; father involvement and non-traditional gender-role attitudes are associated with better maternal post-birth satisfaction, while marital inequity is associated with worse (https://pmc.ncbi.nlm.nih.gov/articles/PMC10468068/).

**What it feels like.** Sleep deprivation, a sudden and often unequal expansion of the mental load (see Section 4 — the two problems compound directly here), and a near-total loss of the couple-level time and spontaneity that supported connection before. Several sources frame it as parents becoming excellent co-managers of a household and poor partners to each other, simultaneously.

**Verdict: low-to-moderate tractability, and a place to be modest, not ambitious.** Some of the satisfaction decline appears to be developmental rather than a solvable deficit — throwing features at it risks implying "you should be able to fix this" to exhausted new parents who mostly need sleep, practical help, and time, none of which an app provides. A narrow, honest role exists: protecting a sliver of couple-directed attention (a check-in, a shared memory that isn't only about the baby) and naming the drop in satisfaction as normal and time-limited so it isn't misread as relationship failure. That is closer to reassurance than intervention, and should be framed as such.

#### 8. Long-distance relationships

**Prevalence and severity.** Around 34% of romantically involved college students report being in a long-distance relationship at a given time, highest among first-years (moderate, single 2021 survey study, cited via https://www.connectedcouples.app/blog/long-distance-relationship-statistics). Overall LDR failure rate is cited around 42%, notably similar to geographically-close relationship failure rates — suggesting distance itself is not the dominant risk factor (weak-moderate sourcing, industry aggregator: https://explorewitherin.com/the-2026-report-key-statistics-on-long-distance-relationships/). One counterintuitive and better-supported finding: the highest-risk transition is not the distance phase but *closing* it — moving in together after being long-distance, with one estimate at 33% break-up within three months of cohabiting (moderate). Protective factors cited: a concrete future plan to close the distance (breakup rate drops to ~20%) and daily video calls (~70% one-year survival rate) — treat these specific percentages as *weak-moderate*, repeated across content sites without a clearly traceable single study, though directionally consistent with what's known about relationship maintenance behaviors.

**What it feels like.** Compensating for physical absence with more deliberate communication — one 2013 study found LDR partners reported *higher* intimacy and more meaningful self-disclosure than geographically close partners, attributed to "behavioral adaptation" (moderate evidence). The strain is less about the relationship itself and more about logistics, uncertainty about the future, and the anxiety of an unscheduled ending point.

**Verdict: moderate tractability — the one problem here that is substantially a bandwidth/logistics problem, which is closer to software's actual competence.** A shared timeline of a relationship, an asynchronous archive, and a chat channel are direct analogues to what LDR couples already report doing informally and what correlates with survival. The honest caveat: LoveOS's current chat, per the strategy doc, is not a video or calling feature, and the evidence specifically credits daily video and concrete reunion planning — not text chat — as protective. A chat-and-memory product without a calendar-linked "reunion countdown" or video layer is addressing an easier, adjacent version of the LDR problem, not the one the evidence says matters most.

#### 9. Conflict repair (what couples do badly after, not during, a fight)

**Prevalence and severity.** This is arguably the single most important reframing in Gottman's body of work: conflict itself is not what predicts relationship failure — about 69% of relationship problems are described as "perpetual," rooted in personality differences that never fully resolve and instead need ongoing management (strong, oft-cited Gottman finding). What predicts failure is the *absence of repair* after conflict — the capacity to interrupt escalation and reconnect (strong, Gottman longitudinal research, summarized at https://couplestherapyinc.com/gottman-repair-attempts/ and https://www.angermanage.co.uk/rupture-and-repair-in-relationships-the-gottman-method/). Two mechanical findings matter for tractability: repair attempted early in a conflict succeeds far more often than repair attempted late ("repair early, repair often"), and repair reliably fails while either partner is still physiologically "flooded" — Gottman specifies a genuine 20-minute-plus physiological cool-down as a precondition, not a tactical retreat.

**What it feels like / what goes wrong.** Couples routinely skip repair altogether — the fight ends via exhaustion, distraction, or one partner giving up, not resolution — and grievances accumulate silently as unspoken resentment (directly compounding Sections 3 and 4). Where repair is attempted, it's often attempted too early (while still flooded, so it lands as insincere or reignites the fight) or too late (days pass, and the moment for a natural apology has closed, so it never happens at all).

**Verdict: the best-fit problem on this list for a chat-and-memory product, and currently unaddressed by LoveOS.** Gottman's own repair categories — "I'm sorry," "I feel," "I appreciate," "let's find common ground" — are short, asynchronous, low-arousal verbal acts. That register is exactly what a chat surface can hold well, and better than in-person repair in one specific way: it removes the requirement that repair happen face-to-face and immediately, which is precisely when Gottman's evidence says it fails (both partners still flooded). A "cool down, then send" prompt, a private draft space for an apology or repair message, or a nudge that surfaces 24–48 hours after a detected rough patch, are all plausible and modest. The limits: software cannot detect flooding, cannot know a fight happened unless a couple discloses it, and a repair prompt sent at the wrong moment (mid-flood) could make things worse, not better — this needs to be opt-in and user-triggered, not inferred and pushed.

#### 10. Feeling unappreciated or unseen

**Prevalence and severity.** In the Natsal-3 breakdown data, "lack of respect or appreciation" was cited by 17–25% of respondents as a reason for relationship breakdown (strong, same national survey as Section 3). A 2020 study in *Current Psychology* found both feeling appreciated and expressing appreciation independently associated with higher marital satisfaction (moderate, single study, secondhand-cited — I could not locate and verify the primary source directly, flagging as moderate rather than strong). Practitioner sources converge on describing this as one of the most common presenting complaints in couples therapy, and note a specific asymmetric pattern: the partner who feels unseen is often already substantially disengaged by the time it's raised (weak-moderate, practitioner synthesis, not a controlled study).

**What it feels like.** Less a single grievance than an accumulation — "thousands of unnoticed moments" in which effort goes unacknowledged and gratitude fades into expectation. A specific self-reinforcing cycle recurs across sources: one partner withdraws because they feel unvalued, the other becomes defensive because the withdrawal reads as criticism, and the resulting distance confirms both partners' sense of not being seen.

**Verdict: moderate tractability — a genuinely good, narrow fit, if kept narrow.** Noticing and naming a partner's effort is a small, well-defined act, and prompting it (a daily or weekly "say what you noticed" nudge, a private space to leave an appreciation that surfaces later as a memory) is close to evidence-based gratitude-journaling interventions that exist independent of relationship apps. The risk is trivialization and gamification — if "appreciation" becomes a streak to maintain or a scripted button-tap ("send a heart"), it manufactures the appearance of noticing without the substance, and a partner can generally tell the difference between a felt observation and a compliance action.

#### 11. Time scarcity in dual-career households

**Prevalence and severity.** Dual-earner married couples spend about 0.6 fewer hours per day together than single-earner couples (3.2 hours/day total), and working adults report roughly one hour of quality time per day with spouse and children combined, with one estimate of a 26% decline in couple quality time over time (moderate, ACF/HHS time-use analysis: https://acf.gov/sites/default/files/documents/opre/spending_time_together.pdf). Combined paid and unpaid work for fulltime dual-earner couples is cited at 139 hours/week versus 125 hours/week for single-earner households (moderate). One HBS-linked estimate: a one-standard-deviation decrease in couple leisure time is associated with a doubling of marital break-up probability (moderate — a striking figure worth flagging as needing the original paper for effect-size interpretation; treat directionally).

**What it feels like.** Time scarcity is described as the most frequently cited challenge among dual-career couples specifically — not a lack of love or commitment, but a genuine absence of unscheduled hours, compounded by asymmetric division of the "second shift" (dual-earner fathers average ~20 more hours/week than mothers in one cited breakdown, which folds this problem back into Section 4's mental-load imbalance).

**Verdict: low tractability, similar reasoning to money.** The scarcity is literal — hours in a day that do not exist — not a discovery, memory, or coordination failure that an app resolves by existing. A calendar nudge to protect a recurring date slot has some value (protecting time that's already agreed on is easier than manufacturing more), but there is a real risk that a "quality time" feature becomes one more thing competing for the scarce time it claims to protect — reading a chat prompt is not the same as being present, and for an exhausted dual-career couple, an app asking for daily engagement is itself a time tax.

#### 12. What the category ignores, and why

Cross-referencing against `couples-app-strategy.md`'s competitor landscape (Paired, Lasting, Relish, Gottman Card Decks, Between, and others) and this research pass, the pattern is consistent: the category clusters heavily around communication tips, date-night prompts, and "get to know your partner" question decks — all low-conflict, positive-affect content that assumes a baseline-functional relationship. Largely absent, and plausibly for the reasons stated:

- **Mental load / domestic labor** — genuinely hard to build for honestly (Section 4), and any feature that surfaces imbalance risks generating conflict inside the app rather than resolving it. Unglamorous and conflict-generating, not unmonetisable per se.
- **Money conflict** — avoided because it requires either integrating real financial data (a different, regulated product category) or staying so shallow it's decorative. Also: money apps and relationship apps are built by different teams solving different problems, and nobody has found the wedge that unifies them.
- **Addiction, chronic illness, caregiving, infertility, grief** — barely appear anywhere in this competitive set, and not in the ten-problem brief either, which is itself notable. These are high-severity, well-documented sources of relationship strain (per Section 12 background reading: addiction is described as requiring individual treatment before couples work is even productive; infertility couples show a specific gendered polarization pattern where problem-solving from one partner reads as invalidation to the other). They are ignored because they are clinical-adjacent, low-frequency for any individual couple (so poor retention-loop material), and carry real liability if a consumer app mishandles them.
- **Infidelity and its aftermath** — a leading cause of divorce (behind money and comparable to "grew apart" in some framings) and completely outside what any reviewed app attempts, almost certainly because trust-repair after betrayal is squarely clinical work, and a wrong intervention here is reputationally and ethically dangerous for a wellness brand.
- **In-law and extended-family conflict, cultural/religious difference in cross-cultural relationships, and immigration-status stress on a relationship** — not surfaced in the research base I could find framed as "app-relevant," and not in this brief's ten either, worth flagging as a possible genuine blind spot in this document as much as the category.

The honest generalization: the category builds for the *maintenance* of a relationship that is basically fine, because that is the segment where users self-select in, engagement loops can be built, and liability is low. It avoids the *repair* of a relationship that is struggling and the *treatment* of conditions (addiction, infidelity trauma, clinical depression showing up as relationship conflict) that require a licensed professional — correctly, per the discussion below, but rarely admits that's what's happening.

#### 13. The uncomfortable section

**What happens when an app designed for happy couples is used by an unhappy one?** Most of the reviewed products (per both this research and `couples-app-strategy.md`'s competitor notes) are built around positive-affect content — appreciation prompts, date ideas, "how well do you know each other" games. Used by a couple already in conflict, this content can misfire in a specific way: a cheerful daily prompt lands as tone-deaf or performative when the couple hasn't spoken civilly in days, and a shared memory feature that surfaces "happy" photos from years ago can read as a rebuke (a highlight reel of a relationship that no longer exists) rather than a comfort. Lasting's own reviewers state this plainly: the app is "unlikely to save a marriage where one partner is disengaged, where there's active crisis, or where the issues require professional intervention" (moderate, direct product-review sourcing: https://www.choosingtherapy.com/lasting-app-review/). That's an unusually candid admission from inside the category, and it should be the working assumption for any product in this space, not an edge case to handle later.

**What about a couple where one partner has checked out?** This is a specific, researchable state — reduced reactivity, indifference rather than escalation during disagreement, loss of shared ritual and future planning, described across multiple clinical sources as a late-stage predictor closely tied to stonewalling (https://www.psychologytoday.com/us/blog/social-instincts/202508/3-signs-a-partner-has-already-checked-out-of-a-relationship). Practically: an app cannot distinguish "busy" from "checked out" from engagement data alone, and a nudge sent to a partner who has already emotionally exited will not re-engage them — it may instead give the still-invested partner false reassurance that "we're working on it" via an app, delaying the harder conversation or professional help that the situation actually needs. There's also a genuine asymmetry-of-motivation risk baked into every "both partners use this together" product: the reviewed apps repeatedly surface user complaints that they were the one prompting sessions while their partner ignored them — the app becomes another site where the imbalance (see Section 4) plays out, this time with app-usage guilt added on top.

**What about relationships that should end?** A product whose entire design language is oriented toward connection, memory-keeping, and "growing together" has an implicit design bias toward relationship continuation. That is a real duty-of-care question, not a hypothetical one: an app that only ever offers "here's how to reconnect" content has no answer for a user for whom the honest, healthy next step is separation, and a product that never allows for that outcome is not neutral — it is advocating, by omission, for staying. Concretely, duty of care here looks like: (1) never framing disengagement, conflict, or a request to delete shared data as a failure state or a "streak broken" the way engagement-loop products often do; (2) building an accessible, un-buried path out — data export and account separation should be as easy to find as onboarding, a signal already flagged in the strategy doc's "design the exit before launch" section, and doubly important once you're actually looking at what a bad-fit relationship experiences inside a connection-first product; (3) recognizing that some inputs (repeated appreciation prompts going unanswered, an archive that stops being added to, one partner's account going quiet) are legible signals of exactly the checked-out pattern described above, and the responsible design response is *not* to escalate engagement pressure in response (more reminders, guilt-inflected copy) but to back off and, where appropriate, surface a resource pointer rather than a re-engagement nudge.

**Where is the line between a wellbeing product and a clinical one, and what must never be claimed?** Over 90% of mental-health-adjacent apps are unregulated "wellness" tools, not FDA-authorized medical devices, specifically because they don't claim to treat, diagnose, or augment treatment of a condition (moderate-strong regulatory-landscape summary: https://www.fda.gov/media/189391/download, https://www.kff.org/mental-health/rise-in-use-of-mental-health-apps-raises-new-policy-issues/). LoveOS sits, and should stay, unambiguously on the wellness side of that line — it is not staffed or licensed to do otherwise. Concretely, that means never claiming to: detect or diagnose relationship distress, abuse, or mental health conditions from usage patterns; replace couples therapy (the evidence in Section 9 and the direct efficacy literature, e.g. https://www.southdenvertherapy.com/blog/do-relationship-apps-work-therapist-review, is consistent that apps are a supplement at best and explicitly not a substitute where real distress exists); or provide crisis intervention. A related, sharper risk specific to a *couples* product rather than an individual wellness app: relationship-tracking and monitoring features (shared calendars, location-adjacent memory-tagging, "how much have you talked this week" style analytics) sit uncomfortably close to the mechanisms used in real coercive control, where partner monitoring of communications and activity is a documented abuse pattern (moderate-strong, domestic-violence literature: https://www.esafety.gov.au/key-topics/domestic-family-violence/coercive-control, https://www.bwss.org/understanding-online-coercive-control/). Any shared-visibility feature needs to be designed so it cannot be repurposed by one partner to monitor the other without consent, which is a real constraint on features like shared timelines or "who's been active" indicators, not a theoretical one — and worth an explicit design review pass, not an assumption that "it's for couples so it's fine."

#### 14. What LoveOS is currently built to address

Cross-referencing the module inventory (`module-00-auth`, `module-01-onboarding`, `module-02-home`, `module-03-chat`, `module-03-memories`, `module-04-timeline`, `module-05-profile`, `module-06-memories`) against the ten problems above, using the strategy doc's own inventory section (`couples-app-strategy.md` §1) as the source of truth for what exists:

- **Drift and routine (Section 3)** — plausibly addressed, in principle, by the memory/timeline modules, *if* they're used to resurface shared history rather than just archive new photos. The strategy doc's own honest-summary section (§1.4) should be checked against this, but this document takes no position on current implementation quality — that's out of scope here.
- **Feeling unappreciated / unseen (Section 10)** and **conflict repair (Section 9)** — closest conceptual fit to a chat surface, but the strategy doc records that chat is currently general-purpose messaging (and its own §7.1 explicitly says stop investing in chat-as-messaging-replacement), not a repair- or appreciation-specific surface. So: addressable by the existing architecture, not currently addressed by it.
- **Long-distance (Section 8)** — chat and a shared archive are directionally relevant, but the evidence specifically credits video calls and concrete reunion planning as protective, neither of which appears to exist per the strategy doc's inventory.
- **Mental load, money, intimacy, parenthood, time scarcity, and the mechanics of communication breakdown itself (Sections 2, 4, 5, 6, 7, 11)** — not addressed by any existing module, and for several of them (Sections 4, 5, 6), this document's verdict is that they *shouldn't* be, at least not beyond a light-touch, narrow, clearly-bounded feature.

Net: LoveOS's current surface area (onboarding story capture, chat, memory archive) is structurally suited to at most three of the ten problems examined here (drift, appreciation, conflict repair) — and only partially even for those, since none of the existing modules were evidently designed with these specific mechanisms in mind. That is a narrower claim than the product's general framing ("capturing a couple's story") implies, which is the same gap this whole document was commissioned to find.

#### 15. Build for versus leave alone

**Worth building for**, with the tractability ceiling stated honestly in each case:
- Conflict repair (Section 9) — best mechanistic fit; asynchronous, low-arousal, opt-in.
- Feeling unappreciated / unseen (Section 10) — narrow, low-risk, well-evidenced act (noticing effort); avoid gamification.
- Drift and routine (Section 3) — natural fit for an archive product; must actively resurface, not just store.
- Long-distance (Section 8) — good fit *if* the product adds what the evidence says actually matters (video, concrete reunion planning), not just more chat.

**Leave alone, or touch only at the lightest possible level:**
- Mental load (Section 4) — awareness-level reflection at most; do not claim redistribution.
- Money (Section 5) — visibility of spending at most; do not attempt values arbitration.
- Intimacy/desire discrepancy (Section 6) — normalize and refer out; no tracking, no logging tied to frequency.
- Transition to parenthood (Section 7) — reassurance that the decline is normal; no implication of a fix.
- Time scarcity (Section 11) — protect existing agreed time; do not add a new engagement tax.
- Communication breakdown mechanics (Section 2) — teach the vocabulary after the fact; cannot intervene mid-flood.

**Do not build, full stop, without clinical backing LoveOS does not have:** anything for addiction, infidelity trauma, chronic illness/caregiving strain, infertility, or grief — all real, all severe, all outside this document's ten but surfaced in Section 12 as the category's (and this brief's) blind spot. And: no feature, anywhere in the product, that infers or claims to detect abuse, checked-out status, or clinical distress from usage data — the honest answer when a relationship is failing is to get out of the way, not to instrument it.

#### Sources

Communication / conflict:
- https://escholarship.org/content/qt1g37d6w6/qt1g37d6w6.pdf — demand-withdraw pattern review
- https://www.gottman.com/blog/the-four-horsemen-stonewalling/
- https://therapydave.com/gottman/demand-withdraw-pattern-destroying-relationships/
- https://www.simplypsychology.com/articles/bids-for-connection-gottman
- https://couplestherapyinc.com/gottman-repair-attempts/
- https://www.angermanage.co.uk/rupture-and-repair-in-relationships-the-gottman-method/

Drift / breakdown reasons:
- https://pmc.ncbi.nlm.nih.gov/articles/PMC5363851/ — Natsal-3, reported reasons for relationship breakdown
- https://journals.plos.org/plosone/article/file?type=printable&id=10.1371/journal.pone.0174129
- https://www.psychologytoday.com/us/blog/couples-thrive/202602/were-just-different-now-why-couples-drift-and-what-to-do

Mental load / domestic labour:
- https://onlinelibrary.wiley.com/doi/10.1111/jomf.70029 — Daminger, gratitude/resentment and division of labor, JMF 2026
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10231910/ — unpaid domestic work and mental disorders
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9407714/ — workload and gender, Brazil primary health care study
- https://drrondaporter.com/the-silent-resentment-trap-mental-load/

Money:
- https://www.ipsos.com/en-us/money-fights-one-three-34-partnered-americans-identify-money-source-conflict-their-relationship
- https://www.psychologytoday.com/us/blog/couples-thrive/202405/why-couples-fight-about-money
- https://101financial.com/money-fights-in-marriage/
- https://www.chipchick.com/2025/03/heres-how-often-couples-fight-about-money-so-lets-break-down-the-numbers-on-financial-feuds

Intimacy / desire:
- https://medium.com/@matherscd/how-big-a-problem-is-desire-disparity-in-heterosexual-relationships-865ea410ba3e
- https://scholarsarchive.byu.edu/facpub/4621
- https://www.connectedcouples.app/blog/sexless-marriage-statistics
- https://pubmed.ncbi.nlm.nih.gov/38234271/ — desire discrepancy qualitative study

Parenthood:
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9350520/ — transition to parenthood meta-analysis
- https://pmc.ncbi.nlm.nih.gov/articles/PMC10468068/ — fathers' relationship satisfaction

Long-distance:
- https://www.connectedcouples.app/blog/long-distance-relationship-statistics
- https://explorewitherin.com/the-2026-report-key-statistics-on-long-distance-relationships/

Time scarcity:
- https://acf.gov/sites/default/files/documents/opre/spending_time_together.pdf
- https://www.hbs.edu/ris/Publication%20Files/Buying%20Quality%20Time%20Combined_4254a96d-c4b2-4e96-ab8d-c58aab5e0fb8.pdf

Appreciation:
- https://empathi.com/blog/feeling-unappreciated-in-a-relationship/
- https://www.embodiedwellnessandrecovery.com/blog/why-feeling-unappreciated-in-a-relationship-can-slowly-destroy-love-the-neuroscience-of-emotional-neglect-resentment-and-lasting-connection

Uncomfortable section / duty of care:
- https://www.choosingtherapy.com/lasting-app-review/ — direct admission an app can't help disengaged/crisis couples
- https://www.psychologytoday.com/us/blog/social-instincts/202508/3-signs-a-partner-has-already-checked-out-of-a-relationship
- https://www.esafety.gov.au/key-topics/domestic-family-violence/coercive-control
- https://www.bwss.org/understanding-online-coercive-control/
- https://www.fda.gov/media/189391/download — FDA digital mental health device scope
- https://www.kff.org/mental-health/rise-in-use-of-mental-health-apps-raises-new-policy-issues/
- https://www.southdenvertherapy.com/blog/do-relationship-apps-work-therapist-review — efficacy limits, therapist perspective
- https://news.harvard.edu/gazette/story/2025/06/got-emotional-wellness-app-it-may-be-doing-more-harm-than-good/

## Research: competitor-ui-patterns

### Competitor UI and Interaction Patterns

Research scope: the interface and interaction layer of couples apps and adjacent products, for comparison against LoveOS's frontend. Market landscape, the shutdown graveyard, monetisation, retention arithmetic, and relationship science are covered in `docs/research/couples-app-strategy.md` and are deliberately not repeated here — this document stays on the UI/interaction surface: onboarding sequencing, the partner-invite handoff, the daily surface, the daily ritual, the archive, empty states, notifications, and account controls.

Evidence standard: every claim below is either sourced (a URL is given) or explicitly flagged `(inference — not verified)` where it is a plausible read of a screenshot-less description rather than something a cited source states directly. A few sources describe the flow without describing exact screens the invited person sees; that gap is called out rather than guessed at.

#### Products covered

Paired, Lasting, Evergreen, Cupla, Love Nudge (5 Love Languages), Gottman Card Decks, Locket, Marco Polo, BeReal, Duolingo, Day One, Apple Photos Memories.

#### LoveOS baseline (for comparison only — from the completed audit, not re-researched here)

- Onboarding: 21 screens (24 Welcome-to-Home)
- Partner-invite handoff: broken — partner A never learns partner B redeemed the code
- No shared empty/loading/error state components — every screen improvises
- Chat module (2,778 lines), memory archive with albums/search/on-this-day, home dashboard
- `module-04-timeline` empty, profile barely started
- No backend

---

#### 1. Onboarding: step counts and sequencing

**Duolingo — 38 screens before the first paywall, but investment precedes the ask.**
Duolingo's onboarding is documented at roughly 38 screens across personalization (language, level, goal, daily-time commitment, motivation), a first lesson completed *before* any payment is requested, mascot/celebration screens, permission requests (notifications, widgets — some re-asked later), and only then a soft paywall with four plan options ("Try now" framing) ([tasu.ai teardown](https://tasu.ai/library/duolingo)). The organizing principle the teardown names: screens are sequenced so the user has *built something or has something to lose* before being asked to pay — investment before ask ([tasu.ai](https://tasu.ai/library/duolingo)).
- Why it exists: Duolingo needs enough personalization data to make placement/content decisions, and enough perceived investment (a completed first lesson) to survive a paywall screen without mass abandonment.
- Applies to LoveOS? Partially. LoveOS's problem is not "screens before paywall" (LoveOS has no monetisation yet) — it's screens before *any use of the core product*, and the core product is a shared, two-person artifact, not a solo skill lesson. A first lesson is a unit of value one person can complete alone in 60 seconds; a couples app's "first lesson" (a daily question, a memory) is only a unit of value once *two* people have engaged, which is exactly the step LoveOS's invite flow currently breaks.
- Adopt/adapt/ignore: **Adapt** the sequencing principle (build investment before asking for something), not the screen count. 38 screens is not a target; it's evidence that screen count alone isn't the problem — sequencing and payoff-per-screen is. LoveOS's 21-24 screens should be judged by "what did the user get for each screen," not against Duolingo's raw count.

**Evergreen — signup under 5 minutes, then a hard paywall before the main app.**
Evergreen's flow: an initial relationship assessment (communication style, relationship length, current friction points) → a topic-selection screen that gives users a sense of choice → a hard paywall presented at roughly the one-minute mark, offering an annual plan (7-day trial, "SAVE 58%" badge) and a monthly plan → only then the main app ([App Showcase teardown](https://screensdesign.com/showcase/evergreen-relationship-growth)). The same source notes this paywall-before-core-product placement "could lead to significant drop-off," and flags that there is no forced tutorial after the paywall — a user can start an exercise immediately.
- Why it exists: Evergreen is optimizing subscription conversion off the emotional high of an assessment ("we understood your relationship") before the user has seen whether the content is any good.
- Applies to LoveOS? No monetisation exists yet, so the paywall-placement lesson doesn't transfer directly. What does transfer: Evergreen's assessment-then-choice pattern (assessment → let the user pick which topic/track to start with) is a legitimate personalization step LoveOS's 21 screens do not appear to include — LoveOS's onboarding is described as long without being personalization-driven.
- Adopt/adapt/ignore: **Ignore** the hard-paywall-before-first-use placement (Evergreen's own reviewers cite it as a drop-off risk). **Adapt** the assessment → topic-choice pattern, if and when LoveOS wants onboarding screens to earn their place by producing a personalization payoff rather than just profile/consent fields.

**Lasting — an assessment that doubles as content routing, not a generic quiz.**
Lasting opens with an assessment covering communication, conflict, appreciation, sex, family culture, finances, emotional connection, in-laws, friends, and parenthood, and uses the results to determine which lessons/resources to surface first ([ChoosingTherapy review](https://www.choosingtherapy.com/lasting-app-review/)). Reviewers note the app is "engaging and user-friendly" but that "more onboarding guidance would be helpful, as the feature depth can feel overwhelming for new users" — i.e., the assessment is good but everything *after* it dumps too much surface area on the user at once ([same source](https://www.choosingtherapy.com/lasting-app-review/)).
- Why it exists: Lasting is therapist-designed and structured like an EFT/Gottman-informed clinical intake — the assessment is doing real routing work, not just collecting a profile.
- Applies to LoveOS? Yes, as a contrast case. LoveOS has no equivalent routing assessment — its 21 screens are (per the audit) largely account/profile/pairing mechanics, not content personalization. Lasting shows what a *long* onboarding looks like when every screen changes what the user sees next; LoveOS's long onboarding does not currently do that.
- Adopt/adapt/ignore: **Adapt** — if LoveOS keeps a long onboarding, each screen should route to something (a starting daily-question topic, a suggested chat opener), following Lasting's model, rather than only collecting setup data.

**Cross-cutting observation on step count.** None of the five couples apps have a clearly documented onboarding screen count in public sources (support docs describe *flows*, not screen counts, and app-teardown sites cover Duolingo/Evergreen in that level of detail but not Paired/Lasting/Love Nudge/Cupla). This is a genuine evidence gap — I could not verify a screen-count benchmark for the couples-app category specifically. The "roughly triple comparable apps" claim in the LoveOS audit should be read as a claim about generic mobile-onboarding norms (most consumer app onboarding research suggests 3-7 screens is typical, per general UX teardown literature, not couples-app-specific data), not as a verified 1:1 comparison against Paired or Cupla's actual screen counts, which I could not find published.

---

#### 2. The partner-invite handoff

This is the section the brief calls the single most valuable part of this research, so it gets the most detail and the most direct sourcing.

##### Paired — code/link surfaced at four separate touchpoints, not just onboarding

Per Paired's own support article, the pairing code/link is available at:
1. Initial account creation, right after entering name and choosing a profile photo
2. After answering the first onboarding question, via an explicit "Invite Partner" action
3. The Home tab, at any time after onboarding, via an icon at the top of the screen
4. The "Us" tab, after onboarding, by tapping the blank partner-image placeholder

([Paired Support: "How do I pair with my partner?"](https://support.paired.com/en/articles/164636-how-do-i-pair-with-my-partner))

Two things worth noting precisely because they are gaps in the source, not findings: the support article does **not** describe what happens on the invited partner's side — what screen they land on, whether they see the inviter's name/photo before accepting, or whether the inviter is notified in real time when the partner completes pairing. That is a real evidence gap; I did not find a first-hand account of the invited side of Paired's flow. What the article does confirm: once paired, "you can see each other's answers to Daily questions, quizzes, games and question packs," and any active subscription "automatically synchronizes after pairing" so both partners share Premium ([same source](https://support.paired.com/en/articles/164636-how-do-i-pair-with-my-partner)).
- Why the four-touchpoint design exists: it treats pairing as a task that can legitimately be deferred — a user might install alone, explore one question, and only then decide to invite a partner. It does not force pairing to happen before any value is seen.
- Applies to LoveOS? Directly. LoveOS's audit finding — partner A never learns partner B redeemed the code — is a notification/confirmation gap, not a placement gap. Paired's model of "the code is always reachable" doesn't by itself solve that; it only reduces the cost of *re-sending* an invite if the first one goes stale. LoveOS needs the confirmation loop Paired's own docs don't actually describe either.
- Adopt/adapt/ignore: **Adopt** the multi-touchpoint availability (don't gate the invite behind a single onboarding screen; keep it reachable from Home/profile after the fact, so a user who skips inviting during onboarding isn't punished for it). This does not solve LoveOS's actual bug (missing confirmation), but it is a legitimate independent improvement.

##### Cupla — the clearest documented pattern for exactly LoveOS's failure mode

Cupla's help center is unusually direct about the failure LoveOS has: **"If one of you looks connected and the other does not, that is a wrong-account problem, not an invite problem"** ([Cupla: "How do I sync with my partner?"](https://www.cupla.app/help/en/articles/15051407-how-do-i-sync-with-my-partner)). The mechanism:
- Invite screen reachable during onboarding or anytime via the menu → "Invite Partner to Cupla"
- Two paths: share a link (partner downloads and creates an account), or share a 6-digit invite code that the partner enters on their home screen via a specific tile labeled "Got an invite code from your partner?"
- Cupla explicitly distinguishes the invite code from login/device-verification codes: "This is not the code for signing in" — a small but real UX decision, because conflating the two code types is a plausible source of the exact confusion LoveOS's audit flagged
- Documented resolution path for the "one connected, one not" state: it means the two people are signed into two different Cupla accounts, and re-sending the invite will not fix it — the fix is signing into the correct account

(all: [Cupla Help Centre](https://www.cupla.app/help/en/articles/15051407-how-do-i-sync-with-my-partner))

The source does not explicitly describe the confirmation screen/notification the *inviting* partner sees at the moment the *invited* partner successfully redeems the code — this is the same gap as Paired. What is documented, unusually, is that this exact class of failure (one side shows connected, one doesn't) is common enough that Cupla wrote a support article normalizing it and naming the real cause. That is itself a datapoint: **even a working two-person invite flow apparently produces enough of this confusion that it needs a dedicated FAQ entry** — meaning the failure mode isn't unique to LoveOS's implementation, it's a structural risk in any two-account pairing model.
- Why it exists: two independent auth accounts being asked to converge on one shared relationship object is inherently fragile — session state, multiple devices, and re-installs all create ways for the two accounts to disagree about pairing state.
- Applies to LoveOS? Extremely directly — this is closest published analogue to LoveOS's exact bug.
- Adopt/adapt/ignore: **Adopt.** Two concrete, low-cost changes modeled directly on Cupla: (1) ship a support-doc-worthy explicit state check — a "your partner is not seeing this yet? you may be signed into different accounts" self-diagnosis surfaced *in-app*, not just as a help article, and (2) make the invite code visually and functionally distinct from any device/login verification code, so users don't confuse the two code types LoveOS may eventually have (e.g., email verification vs. partner code).

##### Locket — link-first, contact-second, and asymmetric friend-request semantics

Locket's onboarding asks for phone number, first/last name, then immediately prompts "invite friends with a text message" ([nerdschalk guide](https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/)). To add someone: search contacts or username, or share/receive a link, or accept from a suggestions list; but critically, **"your new friend will be added once they accept your friend request"** — a mutual-acceptance gate, not an automatic connection on link-tap ([Locket Help Center: "How do I add friends on Locket?"](https://help.locket.com/en/articles/7914880-how-do-i-add-friends-on-locket)). The invite-link flow specifically: tap your link → the recipient can "send you a friend request," which you (the original sender) then still have to approve ([Locket Help Center: "How do I share my invite link?"](https://help.locket.com/en/articles/7914923-how-do-i-share-my-invite-link)).
- Why the two-step (link → request → accept) exists: Locket is a many-to-many friend graph (widget shows photos from *multiple* friends, capped at 20), so it needs a request/accept model the way any social graph does — a link alone can't establish trust in both directions.
- Applies to LoveOS? Only partially — LoveOS is explicitly a 1:1 pairing, not a friend graph, so the extra request/accept round-trip Locket needs for its many-to-many model is arguably unnecessary overhead for a couple. But the underlying principle — the inviter should get an explicit, visible confirmation event distinct from the general "someone joined" ambient update — is exactly the missing piece in LoveOS.
- Adopt/adapt/ignore: **Adapt.** Don't copy the two-step accept flow (wrong topology for 1:1), but do copy the idea that redemption should produce a discrete, named event ("X accepted your invite") the *original device* actually receives, not merely a changed pairing-status flag the UI happens to read on next load.

##### BeReal — link-or-username, contacts-first-class, one-way "may know" suggestion surface

BeReal's invite surface: a friend icon opens contacts-with-BeReal-accounts (first-class, at the top of suggestions), a "People You May Know" list (friends-of-friends), a username search with an "Add" button, and a shareable profile link users can post to other social networks or copy/paste directly ([BeReal Help Center: "Invite & Add Friends"](https://help.bereal.com/hc/en-us/articles/7537949847069-Invite-Add-Friends); corroborated by [Alphr](https://www.alphr.com/add-friends-bereal/)). Like Locket, this is a friend-request model (send request → other party approves), not a paired-device handoff — again the wrong topology for a couples app, included here mainly because BeReal's *daily ritual* mechanics (below) are the more relevant transferable pattern from this product.

##### Marco Polo — the most instructive "graceful non-blocking invite" of the set

Marco Polo's add-people flow checks a phone number against the platform: existing users show a **Chat** button; non-users show an **Invite** button that sends a text with a download link ([Marco Polo Support: "How do I add someone to Marco Polo?"](https://support.marcopolo.me/article/47-add-people)). The detail that matters most for LoveOS: **"A person doesn't have to be on the app for you to record and send them a Polo. They'll be able to view and respond to Polos you've sent once they create an account"** ([same source](https://support.marcopolo.me/article/47-add-people)). In other words, Marco Polo does not block the inviting user's core action (recording a video message) on the invitee's acceptance at all — you can create content addressed to someone who hasn't joined yet, and it simply waits for them.
- Why it exists: video messaging's core loop (record → send) has no reason to be gated behind a completed handshake; Marco Polo decouples "can I use the product" from "has the other person joined."
- Applies to LoveOS? Very directly, and this is the single most exportable idea in this whole section. LoveOS's invite handoff is currently a hard gate — pairing has to complete before the shared surfaces (chat, memories) mean anything. Marco Polo's model suggests a different framing: let partner A start using chat/memories/daily-question immediately, addressed to a not-yet-joined partner B, with content queued and delivered the moment B joins — rather than treating "pairing complete" as a blocking precondition for any product value.
- Adopt/adapt/ignore: **Adopt the framing, adapt the mechanics.** A full "message a phone number that has no account yet" implementation is a bigger backend lift than LoveOS's current no-backend state supports, but the *design principle* — don't gate core product value behind invite completion, let A start "writing to us" before B has joined, and surface it to B the moment they do — directly addresses the audit's finding that A never learns B redeemed the code, by reframing the redemption event as "unlocking A's already-created content" rather than a silent status flip A has no way to observe.

##### Summary judgment on the invite handoff

The best real-world precedent for LoveOS's specific bug is **Cupla's documented "wrong-account problem"** framing — not because Cupla necessarily solves it well, but because it is the only source that explicitly names and normalizes the exact symptom (one side connected, one not) and ties it to a diagnosable cause rather than treating it as a black box. The single best *design idea* to steal, though, is **Marco Polo's non-blocking invite** — treating an unaccepted invite as a queued/pending state that doesn't block product use, rather than a gate.

---

#### 3. The daily surface (what a user sees first each day)

**Paired — a status-driven "Discuss" tab, not a single card.** All started conversations (daily question, question packs, games, quizzes, exercises) live in a Discuss tab, and each item's status makes clear whose turn it is: "is it your turn, your partner's turn, or is it time to start a chat to follow-up on your answers" ([Paired Support: "How do I keep track of my partner's activity?"](https://support.paired.com/en/articles/164643-how-do-i-keep-track-of-my-partner-s-activity)). This is a turn-based status model, not a single "today's question" screen.
- Why: because the core mechanic (both partners answer, then compare) is inherently asymmetric in time — one partner usually answers first — the surface needs a way to represent "waiting on them" as a first-class state, not just "answered/unanswered."
- Applies to LoveOS? Directly — LoveOS's home dashboard and any daily-question feature will have the identical asymmetric-turn problem the moment two people are involved. A single "did you answer today?" boolean is insufficient; the real states are: neither answered, you answered/waiting on partner, partner answered/waiting on you, both answered/ready to discuss.
- Adopt/adapt/ignore: **Adopt** the turn-state model as an explicit UI state, not an implicit derived one.

**BeReal — a synchronized, no-personalization, one-shot daily surface.** Everyone in the same time zone gets a "Time to BeReal" push at the same unpredictable time each day, then has two minutes to capture, with late posts explicitly marked as late to everyone who sees them ([BeReal Help Center: "Time to BeReal"](https://help.bereal.com/hc/en-us/articles/7350386715165--Time-to-BeReal); corroborated by [Kapwing](https://www.kapwing.com/resources/when-is-bereal-notification-time/)). The randomness is deliberate — it exists specifically to prevent staging or curating a "good" moment ([same source](https://help.bereal.com/hc/en-us/articles/7350386715165--Time-to-BeReal)).
- Why: BeReal's entire value proposition is anti-curation; unpredictability is the mechanism that enforces authenticity.
- Applies to LoveOS? Not directly — a couples app's daily prompt is not trying to catch anyone off guard, and unpredictable timing for two people who may be in different time zones, at work, or asleep would be actively hostile rather than authentic. The reciprocity mechanic (both people show up in the same window) doesn't map cleanly onto two people, only onto a broadcast network.
- Adopt/adapt/ignore: **Ignore** the randomized-timing mechanic itself. There is a narrower idea worth separating out: BeReal's "posted late" label is a low-cost, non-punitive way of marking asynchronous participation without hiding it — that idea (mark when a partner's answer arrived late relative to the prompt, without blocking or shaming) could translate, but the synchronized-surprise mechanic should not.

**Cupla — a utility surface, not a ritual surface.** Cupla is positioned as "shared calendar, reminders, and lists built for couples" ([Unstar comparison table](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026)) — its daily surface is logistics (what's on today, what's due), not an emotional prompt. This is a meaningfully different daily-surface model from Paired/Evergreen's "answer today's question."
- Applies to LoveOS? LoveOS currently has no daily-ritual surface at all (per the audit, chat + memory archive + dashboard, no timeline). Cupla is evidence that "daily surface" doesn't have to mean "emotional prompt" — a couple's app can earn daily opens through shared logistics instead of or alongside intimacy content. Given LoveOS's `module-04-timeline` is empty and the existing strategy doc already recommends a Daily Question delivered via chat, this is a secondary option worth naming rather than adopting: a shared-logistics surface (upcoming dates, shared reminders) is a lower-risk daily-open driver than an emotional prompt, because it doesn't require both partners to be emotionally "on" to be useful.
- Adopt/adapt/ignore: **Adapt** as a secondary/future surface, not a replacement for the daily-question direction the strategy doc already recommends.

---

#### 4. The daily ritual: prompt delivery and one-sided answers

**The turn-state problem is universal wherever a prompt exists (Paired, Evergreen implicitly, Lasting's paired-reflection exercises).** All three prompt-based apps in this set have the same structural fact: a two-person prompt is not "answered" as a single event, it's answered in two independent events that may be minutes or days apart. Paired's Discuss-tab turn states (above) are the most concretely documented handling of this. Evergreen's daily-question/streak mechanic is described only at the marketing level in available sources ("streaks and gamified prompts... 'genuinely fun first experience'" per the [Unstar comparison](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026)) — I could not find a sourced description of what Evergreen shows a user whose partner hasn't answered yet, and flag that as unverified rather than guess at it.

**Marco Polo's asynchronous framing again applies here.** "Send and respond when convenient... watch it whenever they'd like, as many times as they'd like, and reply when it's convenient" ([CitizenSide](https://citizenside.com/technology/how-to-use-the-marco-polo-app/)) — the entire product is built around there being no penalty, visible or implied, for delayed response. There is no streak, no "they haven't replied" indicator visible to the sender described in any source reviewed.
- Why it exists: video messages take longer to consume than text, so Marco Polo had to design out any pressure around response latency or the format would feel like an obligation instead of a convenience.
- Applies to LoveOS? Yes, specifically to how a "your partner hasn't answered yet" state should read. Paired's honest "it's their turn" status and Marco Polo's total absence of response-pressure signaling represent two different design choices for the same underlying fact (asymmetric response time). A couples app plausibly wants closer to Paired's explicit-but-neutral framing (so the waiting partner has information) without drifting into something that reads as pressure or guilt on the slower partner.
- Adopt/adapt/ignore: **Adopt** an explicit but neutral turn-state indicator (à la Paired), and **adopt** Marco Polo's discipline of never signaling delay as a failure — no "they still haven't answered" red flag, just a calm "waiting" state.

**Duolingo's streak/loss-aversion model is the wrong pattern to import here, and the reason is structural, not aesthetic.** Duolingo's streak is built on daily solo practice where the only actor whose behavior needs reinforcing is the single user; loss aversion over a personal streak works because the user fully controls whether it continues ([Digia teardown](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/); [Deconstructor of Fun](https://duolingo.deconstructoroffun.com/mechanics/streaks)). A couples-app streak is jointly controlled — one partner can break it regardless of the other's effort, which turns a motivational mechanic into a source of blame between two people, which is a fundamentally different (and worse) social dynamic than a solo streak breaking. The existing strategy doc already flags "streaks, scores, and compatibility percentages" under "do not build" — this section corroborates that from the notification-design angle specifically: Duolingo's own notification restraint (capped at two pushes/day, "save notifs" reserved only for imminent loss) is evidence the mechanic requires careful tuning even in the single-user case it was designed for; grafting it onto a two-user case removes the one lever (individual control) that makes the tuning work at all.
- Adopt/adapt/ignore: **Ignore** the streak mechanic. **Adopt** only the notification-restraint discipline underneath it (cap frequency, reserve urgency for genuinely time-limited moments) as a general notification principle, decoupled from streaks entirely.

---

#### 5. The archive: history, resurfacing, search

**Day One's "On This Day."** Described by users as "a constant source of joy," resurfacing entries from a year (or more) prior, explicitly to motivate continued journaling by showing payoff ("looking back at old posts... amazed with how far they've come") ([Reflection.app review](https://www.reflection.app/journaling-apps/day-one); [dayoneapp.com features](https://dayoneapp.com/features/)). The mechanism as described is calendar-anchored (same date, prior year) rather than content-similarity-driven.
- Applies to LoveOS? Directly — LoveOS's memory archive already has an "on-this-day" feature per the audit inventory, so this is validation that the feature choice is sound, not a new idea to import. The transferable detail is *why* it works for retention: it rewards past consistency by making old entries valuable later, which only works if there's enough history to resurface — a cold-start problem for any new couple (see empty states, below).
- Adopt/adapt/ignore: **Adopt** (already directionally built) — the open question is what LoveOS shows when there's nothing yet to resurface, which Day One's marketing material does not address and is a genuine gap in available sources.

**Apple Photos Memories — algorithmic, non-consensual curation as a feature, not a bug.** The algorithm builds memories around dates, trips, and recognized faces via on-device face grouping, processes only when the phone is charging and idle, and — notably — does **not** ask permission per photo and does not exclude old or "awkward" photos; screenshots and years-old images are equally eligible ([Vaultaire guide](https://vaultaire.app/guides/what-shows-in-iphone-photo-memories/); [Gizmodo](https://gizmodo.com/google-apple-photos-memories-curated-videos-settings-ho-1849607083)). Apple has had to retroactively carve out exclusions for sensitive content (e.g., Holocaust-related sites) after user reports of distressing auto-generated memories ([iDropNews](https://www.idropnews.com/news/the-ios-155-photos-app-wont-automatically-create-memories-from-sensitive-locations/185591/)).
- Why it exists: full automation (no per-photo curation prompt) is what makes resurfacing feel effortless and "found" rather than curated — but that same automation is precisely what creates the failure mode (surfacing something painful without warning).
- Applies to LoveOS? The lesson is a caution more than a pattern to copy: a couples memory archive resurfacing "on this day" content automatically carries the same risk — a memory from a fight, an ex-partner-adjacent photo, or a since-breakup context could resurface without warning. Apple's own retrofitted exclusion list is direct evidence this isn't hypothetical.
- Adopt/adapt/ignore: **Adapt with a safety valve** — automatic resurfacing is good for engagement, but LoveOS should design in a way to mute/exclude a specific memory or date range from resurfacing (something Apple only added after user harm was reported), rather than assuming automation is safe by default.

**Gottman Card Decks — a browsable, non-chronological archive; no history of "answered" prompts at all.** The app is 1,000+ flashcards across 14 decks, and the only "archive" behavior documented is per-card favoriting via a star icon for quick re-access later ([Adoree review](https://adoree.ai/blog/gottman-card-deck-app); [MWM listing](https://mwm.ai/apps/gottman-card-decks/1292398843)). There is no evidence in available sources of a couple's own answer history being archived at all — the deck is a static content library, not a shared journal. One reviewer explicitly notes the app "does not listen, remember, or adapt to your relationship" ([Adoree](https://adoree.ai/blog/gottman-card-deck-app)).
- Applies to LoveOS? As a negative example — Gottman Card Decks is popular and well-reviewed *despite* having no memory of what a couple has already discussed, which suggests content quality alone can carry a product some distance without an archive. But it also means Gottman Card Decks solves a different problem (conversation starters) than LoveOS is trying to solve (a couple's own relationship history) — the two shouldn't be compared as competitors on archive depth.
- Adopt/adapt/ignore: **Ignore** as a model (LoveOS's memory archive is already a materially more ambitious and more appropriate feature than a static deck) — but useful as a reminder that a couples tool doesn't have to have any memory to be liked, so LoveOS's investment in albums/search/on-this-day is a differentiator worth defending, not a "nice to have."

---

#### 6. Empty states

This is the area with the thinnest sourced material — none of the products researched publish a screenshot-level description of their empty states in support docs, and this is explicitly flagged as a gap rather than papered over.

**What is sourced:** Locket's day-one state is described only inferentially — a new user is asked for phone number and name, then immediately prompted to invite friends by text, and "the widget would naturally appear blank... [until] friends accept your invitations and start sending photos" ([nerdschalk](https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/) — the "widget would naturally appear blank" characterization is the search summary's inference from Locket's documented mechanics, not a directly quoted support statement, so treat it as `(inference — not verified)` at the pixel level, though the underlying mechanic — no friends, no photos, blank widget — is confirmed).

Evergreen's marketing copy claims "no overwhelming onboarding tour or forced tutorial; you can start your first exercise immediately" ([App Showcase teardown](https://screensdesign.com/showcase/evergreen-relationship-growth)), which implies there is no dedicated empty state screen at all — the user is dropped straight into a real exercise rather than shown a placeholder.

**What is not sourced, and should not be guessed at:** exact copy or visuals for a first-open chat thread, an empty memory archive, or an empty timeline, for any product in this set. This is a genuine limitation of the research — app-store screenshots for these products are optimized to show populated states (this is universal marketing practice), and no teardown or UX case study in the search results documented an empty-state screenshot specifically.
- Why this matters for LoveOS anyway: the one thing that *is* clearly established across sources is that the two products with the most deliberate anti-empty-state design (Duolingo: first lesson before paywall; Evergreen: exercise immediately, no forced tour) both solve emptiness by giving the user something to *do* immediately rather than something to *look at* (a designed placeholder). That's a real, transferable principle even without pixel-level examples.
- Adopt/adapt/ignore: **Adopt the principle** — LoveOS's audit already flags "no empty/loading/error state components exist." The fix implied by this research is not primarily "design a beautiful empty-archive illustration," it's "give the user an action that produces content" (e.g., an empty memory archive's empty state should default to "add your first memory" as an inline action, not a static message) wherever the surface allows it. Where an empty state genuinely cannot offer an action (e.g., chat waiting on an unaccepted invite), that's exactly where Marco Polo's non-blocking-invite framing (§2) becomes relevant — let the empty state be about content already created and pending delivery, not a dead end.

---

#### 7. Notifications

**Duolingo — capped, tiered, and channel-integrated.** Routine reminder notifications are capped at two pushes per day maximum, fire around the user's own revealed habit window (not a fixed global time), and are kept separate from "save" notifications, which are reserved specifically for imminent loss (a streak about to expire, a league promotion about to close) ([Digia](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/)). Some notifications are sent *in* the language being learned, doubling as a micro-lesson rather than reading as a pure interruption ([same source](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/)).
- Applies to LoveOS? The tiering idea (routine vs. urgent, capped frequency) transfers regardless of the streak mechanic itself — a "your partner answered, come see" notification is routine; nothing in a couples app should resemble Duolingo's "save" urgency tier, because there's no equivalent legitimate loss event that isn't also socially punitive (see §4 on why streak-loss framing is actively harmful between two people).
- Adopt/adapt/ignore: **Adopt** frequency capping and routine/urgent tiering as a general discipline; **ignore** any notification framed around loss or lapsed-streak urgency.

**Marco Polo — user-controlled dampening, explicitly named.** Beyond a simple on/off toggle, Marco Polo's settings include a specifically-labeled "Send Me Fewer Notifications" option, alongside standard Do Not Disturb ([search summary of Marco Polo notification settings](https://support.marcopolo.me/article/69-notification-settings)). The product frames itself explicitly as ad-free and pressure-free — "no interruptions or intrusions... no tricks to keep you on the app for longer than you wish" ([marcopolo.me](https://www.marcopolo.me/account-resources/)).
- Why it exists: Marco Polo's target use case (family/close friends) is one where over-notifying would actively damage the relationship the product is meant to serve — the same is arguably even more true for a couples app.
- Applies to LoveOS? Directly, and more so than for most products in this set, because a couples app's notifications are about the user's actual relationship — a naggy notification here has social cost (it can read as the *app* nagging the *partner* to respond, putting pressure on the relationship itself) beyond ordinary notification fatigue.
- Adopt/adapt/ignore: **Adopt** an explicit "fewer notifications" self-service dampener as a first-class settings option, not just system-level Do Not Disturb.

**BeReal — the anti-pattern shown honestly.** BeReal's core mechanic *is* a mandatory, unpredictable, urgent push — the opposite of Duolingo/Marco Polo's restraint — and it works only because unpredictability and urgency are the entire point of the product (anti-curation), not a growth tactic bolted onto unrelated content. It's included here specifically as a boundary case: this is what "notification as core mechanic rather than reminder" looks like, and it's a legitimate design choice for BeReal precisely because the product's whole premise depends on synchronized spontaneity.
- Adopt/adapt/ignore: **Ignore** for LoveOS — the reasons a couples app would want unpredictable urgent pushes do not exist; two people who already have an ongoing relationship don't need to be caught off guard, they need a calm, reliable surface.

---

#### 8. Settings, privacy, account controls

**Paired's unpair and delete flows are cleanly documented and worth using as a baseline.**
- Unpair: reachable from the "Us" tab; after unpairing, "you will not be able to see your previous partner's answers to questions, question packs and couple games" ([Paired Support: "How do I unpair my account from my partner's?"](https://support.paired.com/en/articles/164637-how-do-i-unpair-my-account-from-my-partner-s)).
- Delete account: reached from Settings; requires an explicit "I agree to delete my account" checkbox tap before the "Delete my account" button becomes actionable; described as irreversible — "all your data, progress and relationship history within Paired will be removed and can't be recovered"; if paired, the ex-partner immediately loses access to the deleting user's answers ([Paired Support: "How do I delete my account?"](https://support.paired.com/en/articles/164620-how-do-i-delete-my-account)).
- Sharp edge worth calling out: **deleting the account does not cancel the subscription** — a separate, easy-to-miss action the user has to know to take independently ([same source](https://support.paired.com/en/articles/164620-how-do-i-delete-my-account)). This is a real complaint-generating gap (billing continues after the product access is gone) and is directly relevant to the strategy doc's existing point about "designing the exit" (§4.4 there) — this is one concrete way an exit can be designed badly even when the unpair/delete mechanics themselves are clean.

**Cupla — a three-way choice at disconnect, and a `reset` distinguished from `delete`.** Disconnecting from a partner presents three explicit options: delete all events/to-dos, delete only shared events/to-dos (implying personal ones are preserved), or reset the account entirely; each is stated as permanent and non-restorable ([search summary of Cupla's disconnect article](https://help.cupla.app/article/28-how-do-i-disconnect-from-my-partner)). Account deletion is a separate flow (More → My Account → Delete Account → mandatory reason-for-leaving selection) ([search summary of Cupla's delete-account article](https://help.cupla.app/article/12-how-do-i-delete-my-account)).
- Why the three-way choice at disconnect exists: because Cupla is a shared-calendar/to-do tool, a breakup doesn't necessarily mean a user wants to lose their *own* logistics data, just the shared portion — the options reflect that data ownership is not automatically joint just because it was created inside a paired context.
- Applies to LoveOS? Directly relevant to the memory archive specifically: on unpair/breakup, does a memory created by one partner but tagged with both, or a chat history, belong to one person, both, or neither? Cupla's model — giving the user a real choice among granularities rather than one blunt "delete everything" — is the more respectful and more defensible design.
- Adopt/adapt/ignore: **Adopt** the disconnect-time choice-of-scope pattern (what happens to shared content on unpair is a decision the user should make explicitly, not one the app makes for them by default), and **adopt** Paired's explicit-confirmation-before-irreversible-delete pattern, while **fixing** the subscription-survives-deletion gap Paired itself has (not applicable yet since LoveOS has no monetisation, but worth designing around before it does).

No sourced material was found describing data export specifically (as distinct from delete) for any of Paired, Cupla, Lasting, Evergreen, or Love Nudge — none of their public help centers surfaced an export feature in search results. That absence is itself a datapoint: **export does not appear to be a feature any of the five couples apps in this category ship**, which is worth naming plainly rather than assuming it exists somewhere unsearched.

---

#### 9. Patterns worth adopting, adapting, or ignoring — summary table

| Pattern | Source | Adopt/Adapt/Ignore | One-line reason |
|---|---|---|---|
| Non-blocking invite — let the inviter use the product before the invitee joins | Marco Polo | **Adopt (framing)** | Directly reframes LoveOS's "A never learns B redeemed the code" bug as "redemption unlocks A's queued content," not a silent flag flip |
| Explicit, named "wrong-account" self-diagnosis for broken pairing | Cupla | **Adopt** | Closest documented real-world analogue to LoveOS's exact invite bug |
| Explicit turn-state UI (your turn / their turn / ready to discuss) | Paired | **Adopt** | Couples apps need a first-class "waiting on partner" state, not a boolean |
| Multi-touchpoint invite access (not gated to one onboarding screen) | Paired | **Adopt** | Lets a user defer inviting without losing the ability to do it later |
| Choice-of-scope at disconnect (delete shared / delete all / reset) | Cupla | **Adopt** | Respects that not all paired content is jointly owned by default |
| Explicit confirm-before-irreversible-delete + but fix subscription-survives-delete gap | Paired | **Adopt, with the gap fixed** | Clean pattern, but Paired's own gap (sub keeps billing) is a cautionary detail |
| Frequency-capped, tiered (routine vs. urgent) notifications | Duolingo | **Adopt (discipline only)** | Applies independent of the streak mechanic it was built for |
| Self-service "send me fewer notifications" dampener | Marco Polo | **Adopt** | A couples app's nagging notification has social cost beyond the individual user |
| Assessment-that-routes-content (not just a profile form) | Lasting | **Adapt** | If onboarding stays long, each screen should change what comes next |
| Automatic on-this-day resurfacing, with a manual exclude/mute safety valve | Apple Photos Memories | **Adapt (add the safety valve)** | Apple only added exclusions after user harm was reported — build it in from the start |
| Assessment → topic-choice personalization | Evergreen | **Adapt** | Legitimate personalization LoveOS's current onboarding doesn't have |
| Streaks / loss-aversion framing applied to a joint two-person action | Duolingo | **Ignore** | Turns a motivational mechanic into inter-partner blame; already flagged as "do not build" in the strategy doc, and this research corroborates why from the notification-design side |
| Randomized-surprise daily-post timing | BeReal | **Ignore** | Solves an anti-curation problem a couples app doesn't have; would just be hostile across time zones/schedules |
| Friend-request/accept graph mechanics (Locket, BeReal) | Locket, BeReal | **Ignore (wrong topology)** | Built for many-to-many social graphs; LoveOS is 1:1 pairing, doesn't need the extra round-trip |
| Hard paywall before first real use of the product | Evergreen | **Ignore** | Evergreen's own reviewers flag this as a drop-off risk; not applicable yet anyway (no LoveOS monetisation) |

**The one pattern most worth deliberately rejecting:** the Duolingo-style streak/loss-aversion mechanic applied to a joint couple action. It is the most tempting to copy (Duolingo's retention numbers are the best-known in consumer mobile) and the most structurally wrong fit — a shared streak converts a motivational device into a two-person blame mechanism the moment one partner is busier than the other for a day, which is a near-certainty in any real relationship.

---

#### 10. Sources

- [Paired Support: How do I pair with my partner?](https://support.paired.com/en/articles/164636-how-do-i-pair-with-my-partner)
- [Paired Support: How do I unpair my account from my partner's?](https://support.paired.com/en/articles/164637-how-do-i-unpair-my-account-from-my-partner-s)
- [Paired Support: How do I delete my account?](https://support.paired.com/en/articles/164620-how-do-i-delete-my-account)
- [Paired Support: How do I keep track of my partner's activity?](https://support.paired.com/en/articles/164643-how-do-i-keep-track-of-my-partner-s-activity)
- [Cupla Help Centre: How do I sync with my partner?](https://www.cupla.app/help/en/articles/15051407-how-do-i-sync-with-my-partner)
- [Cupla Knowledge Base: How do I disconnect from my partner?](https://help.cupla.app/article/28-how-do-i-disconnect-from-my-partner)
- [Cupla Knowledge Base: How do I delete my account?](https://help.cupla.app/article/12-how-do-i-delete-my-account)
- [Locket Help Center: How do I share my invite link?](https://help.locket.com/en/articles/7914923-how-do-i-share-my-invite-link)
- [Locket Help Center: How do I add friends on Locket?](https://help.locket.com/en/articles/7914880-how-do-i-add-friends-on-locket)
- [nerdschalk: How to Use Locket Widget: Step-by-step Guide](https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/)
- [BeReal Help Center: Invite & Add Friends](https://help.bereal.com/hc/en-us/articles/7537949847069-Invite-Add-Friends)
- [BeReal Help Center: Time to BeReal](https://help.bereal.com/hc/en-us/articles/7350386715165--Time-to-BeReal)
- [Alphr: How To Add Friends in BeReal](https://www.alphr.com/add-friends-bereal/)
- [Kapwing: When Does BeReal Send the Notification to Post?](https://www.kapwing.com/resources/when-is-bereal-notification-time/)
- [Marco Polo Support: How do I add someone to Marco Polo?](https://support.marcopolo.me/article/47-add-people)
- [Marco Polo Support: Notification settings](https://support.marcopolo.me/article/69-notification-settings)
- [Marco Polo: Account and Privacy Resources](https://www.marcopolo.me/account-resources/)
- [CitizenSide: How to Use the Marco Polo App](https://citizenside.com/technology/how-to-use-the-marco-polo-app/)
- [tasu.ai: Duolingo onboarding teardown](https://tasu.ai/library/duolingo)
- [Digia: Duolingo's Habit-Forming Reminders](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/)
- [Deconstructor of Fun: Duolingo Streaks](https://duolingo.deconstructoroffun.com/mechanics/streaks)
- [apptitude.io: How Duolingo's Streak Mechanic Actually Works](https://apptitude.io/blog/how-duolingos-streak-mechanic-actually-works/)
- [Day One: Features](https://dayoneapp.com/features/)
- [Reflection.app: Day One review](https://www.reflection.app/journaling-apps/day-one)
- [Vaultaire: What Shows Up in iPhone Photo Memories](https://vaultaire.app/guides/what-shows-in-iphone-photo-memories/)
- [Gizmodo: How To Get the Most Out of Your Google or Apple Photos Memories](https://gizmodo.com/google-apple-photos-memories-curated-videos-settings-ho-1849607083)
- [iDropNews: iPhones will no longer make Memories from sensitive locations](https://www.idropnews.com/news/the-ios-155-photos-app-wont-automatically-create-memories-from-sensitive-locations/185591/)
- [screensdesign.com: Evergreen Relationship Growth showcase/teardown](https://screensdesign.com/showcase/evergreen-relationship-growth)
- [ChoosingTherapy: Lasting App Review 2026](https://www.choosingtherapy.com/lasting-app-review/)
- [5lovelanguages.com: Love Nudge Mobile App](https://5lovelanguages.com/resources/app)
- [Adoree: Gottman Card Deck App Review](https://adoree.ai/blog/gottman-card-deck-app)
- [MWM: Gottman Card Decks listing](https://mwm.ai/apps/gottman-card-decks/1292398843)
- [Unstar: Paired vs Lasting: 5 Couples Apps Ranked (2026)](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026) — used here only for the per-app "what it does" table and Evergreen-specific detail; the complaint-percentage statistics from this same source are already cited in `docs/research/couples-app-strategy.md` §2.2 and are not repeated here.

## Research: shortlist

### The shortlist — best ideas, ranked


The two-minute version. `couples-app-strategy.md` (729 lines, 41 sources) is the
research; this is the ranking, and the ranking is a judgement call rather than a
finding. Argue with it.

The ordering principle: **value per unit of build cost**, weighted toward things
that are cheap now and expensive later.

---

#### 1. The reciprocity gate — the single best idea here

Partner A answers today's question. **A's answer stays hidden until B answers.**

One mechanic, three problems:

- **Retention.** A now has a self-interested reason to nudge B, so the app never
  has to guilt anyone into opening it. The JMIR study observed this happening
  organically — partners reminding each other.
- **Dual adoption.** The structural killer of this category, attacked without
  coercion mechanics.
- **Content.** The value becomes the partner's answer rather than the question,
  so "content runs dry" — 22% of the category's bad reviews — stops applying in
  the way it applies to everyone else.

And it is *small*. A `prompt` variant on the message union already built:
`MessageBubble`, `Composer`, `chatStore`. Everything else below is bigger and
worth less.

**How you know it worked:** reciprocity completion — the share of prompts where
*both* partners answered. Not opens.

---

#### 2. The invite carries content, not an empty account

Instead of "Chandu invited you to LoveOS" → signup form, partner B receives:

> **Chandu answered today's question. Answer to see it.**

B arrives with a reason to exist in the first ten seconds instead of an
onboarding flow. This is a copy-and-routing change, not an engineering project —
the cheapest high-leverage item on the list, and it only works if (1) exists.

---

#### 3. Answered prompts write themselves into Memories

Memories opens **empty** for a real couple. The populated grid only looks good
because `src/sample/` fills it. This makes the couple's own answers the archive,
so it accretes without anyone curating it.

Cold start solved, and the archive compounds — which is the one asset the
competition does not have.

---

#### 4. Design the exit — nobody wants to build this, build it anyway

Export, pause, unpair. Verified absent from `src/` today.

Cheap now because it constrains the pairing schema; brutally expensive to
retrofit. When Couple shut down, its users had to fight to get their shared
history out, and that is the failure the category still remembers.

It is also the safety answer, which matters more than it sounds: shared intimate
data inside a controlling relationship becomes a weapon. A quiet exit — export
and unpair reachable without notifying the partner — is a safety feature, not a
settings screen.

---

#### 5. Long-distance positioning — costs nothing

Not a build. A store-listing change.

It is the only framing under which the 5,164 lines of chat and the two Moment
screens read as a strategic asset rather than a sunk cost, and long-distance
couples have the highest daily-contact motive of any segment.

The cheapest experiment available. *Speculative — worth an ASO test, not a
roadmap commitment.*

---

#### 6. One price per couple — also costs nothing

Paired charges roughly $75–80/year **per person** and gets named for it in
reviews repeatedly. Cupla prices per couple.

This is free differentiation on a decision not yet made. Do not set the price
until W4 dual-active retention is known — pricing an unproven product is
guessing — but decide the *shape* now.

---

#### Good idea, wrong quarter

**The photo widget / "mini Snap"** from the founder's backlog is genuinely good.
Locket proved the format. But it is a **distribution** play, not a retention
play, and a widget on an app nobody opens daily is a widget nobody installs.

Two preconditions: a real backend with background refresh, and a proven daily
habit. Right idea, later.

---

#### The one to cut outright, not defer

**Call and video statistics** — "you have called each other n times… 22 hours
totally."

A quarter of WebRTC work, and it is a surveillance artefact. In a controlling
relationship, cumulative call time becomes evidence to be held against someone.
This is not a scheduling problem; it should not be built.

---

#### The one-sentence version

Stop building a messenger. Build a **ritual** — one question a day, hidden until
you both answer, that quietly becomes your shared archive.

---

#### What this ranking assumes

Worth stating, because if any of these is wrong the order changes:

1. **That the daily-prompt evidence transfers.** The JMIR study is
   cross-sectional and self-selected; reverse causation is not ruled out. It is
   the best evidence in the category, which is not the same as strong evidence.
2. **That the archive is the defensible asset.** If couples do not value
   retrospection as much as the sample content assumes, (3) and the whole
   Memories investment weaken together.
3. **That chat is not the product.** Well-supported by the graveyard, but note
   the tension: the top recommendation lives *inside* the chat surface. The
   argument is against messenger *features*, not against the surface itself.

## Research: codebase-ideas

### Feature ideas from inside the codebase


These come from having read the code rather than from market research, and that
is the point of keeping them separate from `shortlist.md` and
`couples-app-strategy.md`. Those two argue from evidence about the category.
This one argues from what is already sitting in this repository, half-built or
unused.

Ranked by value per unit of work. Every claim about the current state was
verified against the code, and the verification is quoted so you can check it.

---

#### 1. Draw the Timeline from the story onboarding already collects

**The cheapest real feature available.**

Onboarding runs eight screens that capture a narrative: `when-we-met`,
`first-date`, `became-us`, `first-memory`, `days-that-matter`, plus
`story-begins` / `story-cover` / `story-recap`. `services/story/types.ts` models
it properly — `met`, `firstDate`, `becameUs`, `firstMemory`, `keyDates`, each
with date precision, location, note and photo.

That data is not wasted: `HomeDashboardScreen`, `CalendarScreen` and
`OccasionScreen` all read it. But `module-04-timeline` contains **no `.tsx`
files at all**, and `src/copy/appNav.ts:13` still reads:

```ts
{ key: 'timeline', label: 'Timeline', icon: 'clock', live: false, href: '' }
```

So the app collects a timeline during signup and never draws one.

**Why it is worth doing first.** The store, the types, the mock service, the copy
and the nav slot all exist. This is mostly composition. And it is the only screen
in the app that would feel *earned* on day one for a real couple, because the
content is theirs rather than `src/sample/`.

**Watch out for:** it is a third retrospective surface alongside Memories and
Home. If the Daily Question lands first, Timeline becomes the place answered
prompts accumulate chronologically, which is a better reason to build it than
"the tab is empty."

---

#### 2. Make the "Drafted note" card real

`src/copy/chat.ts` defines a card on Chat Home:

```ts
draftedNote: {
  eyebrow: 'Drafted note',
  body: 'A little something is being written for you.',
}
```

The file's own header records that neither this card nor "LOVEOS AI" has a
service or store behind it, and that no task in the 16-task plan built one. They
are non-interactive by design, matching the frame.

**The idea:** build it. A place for the thing you are not ready to send yet — the
half-written apology, the thing you will say tonight, the note you want them to
find later.

**Why I rate it.** For couples the unsent thought is frequently the important
one, and nothing in the category has this. It is also the rare feature that is
valuable *asymmetrically* — it works even when only one partner uses it, which
matters given the dual-adoption problem.

The design already named it. Somebody had this instinct and it was never wired
up.

**Open question worth deciding first:** is a draft private until sent, or does
the partner see that *something* is being written? The copy implies the latter
("is being written for you"), which is more interesting and more dangerous —
anticipation for a happy couple, pressure for an unhappy one.

---

#### 3. Apply the reciprocity gate to memories, not only to prompts

Each partner writes a private note on a shared memory. **Neither note is revealed
until both have written one.**

`Memory` in `services/memories/types.ts` already carries an optional `note`
field, described in the type as "Private to the couple — the design calls it
'Our Note'." Today it is one shared field.

**Why it is interesting.** It makes the archive active rather than retrospective,
and gives an old photo a reason to be reopened months later. It is the same
mechanic as the Daily Question — the one thing in the category with published
evidence — applied to the asset this product already has and competitors do not.

I have not seen this anywhere in the category. That is either an opportunity or a
sign it does not work; it is cheap enough to find out.

---

#### 4. Repurpose the Moment screens as asynchronous presence

`VoiceMomentScreen` and `VideoMomentScreen` are built, tested, and — as live
calls — strategically pointless. WhatsApp and FaceTime exist, are already
installed, and already work. Real WebRTC is also weeks of work the repo has not
started.

**The reframe:** not a call. A five-second "thinking of you" that lands in the
thread and ages into the archive. Marco Polo proved the format; Locket proved the
appetite for the lightweight version.

**Why it is cheap.** Both screens exist with working controls and timers. This is
a change of purpose more than a build — though it does need
`expo-camera`/`expo-av`, which are not installed.

**Caveat:** this is the strongest idea *only* under the long-distance
positioning. For a cohabiting couple it is much weaker, and the recommended
wedge is cohabiting couples. Do not build it before that positioning question is
settled.

---

#### 5. A repair signal — for after the fight, not during it

Every app in this category helps a couple connect when things are already fine.
None help at the moment that actually decides relationships: the hour after an
argument when neither person knows how to start.

**The idea:** one non-verbal signal. "I'm ready when you are." Sent without having
to find words, because finding words is precisely what is hard right then.

**Why it is defensible.** Repair attempts are the part of Gottman's work that
holds up — unlike the divorce-prediction figures, which were fitted post hoc and
did not cross-validate (see `couples-app-strategy.md` §3.3). This builds on the
sound part.

**Highest emotional value on this list, and the highest execution risk.** Done
well it is the feature people tell their friends about. Done badly it is a
novelty button trivialising a real moment. It also needs care in exactly the
situation §4.5 of the strategy doc worries about: in a controlling relationship,
a "why haven't you sent the signal yet" is a new pressure surface.

---

#### Two I would talk you out of

**A "days since we last…" counter.** I nearly proposed this as drift made
visible — days since a date night, since a real conversation. It is a guilt
mechanic wearing a metric. The research contains a user describing precisely this
harm with streaks: *"I'm on a streak of 27 days and he's on 2, it gets to me."*

**Making "LOVEOS AI" real.** It is currently a static card. The moment it becomes
an assistant, "do you train on our messages?" is the first question anyone asks —
and right now there is no encryption story to answer it with. The strategy doc
makes the same call independently.

---

#### If only one

**Number 1.** It is nearly free, it uses data already collected, and it fixes the
oddity that the app's most personal content currently has nowhere to live.

But note the honest tension: the strategy document's top recommendation is the
Daily Question, and it argues the product has too many retrospective surfaces
already. Timeline is a third one. The reconciliation is to build Timeline *as the
place answered prompts accumulate* rather than as another static archive — which
means the Daily Question comes first and Timeline follows it.

