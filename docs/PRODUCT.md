# LoveOS — Product Intelligence and Roadmap

**The single source of truth for product ideas, research, priorities and status.**

Last updated: 2026-09-01

## How to use this file

Every idea has a **stable ID** (`LOV-nnn`). Update an entry's status rather than
creating a new one. Rejected and deferred ideas stay documented **with the
reason**, so the same idea is not relitigated from scratch every quarter.

Status values: `Proposed` · `Approved` · `In progress` · `Implemented` ·
`Deferred` · `Rejected`

Evidence lives in subordinate reference documents, cited inline:

- `docs/research/couples-app-strategy.md` — market, competitors, monetisation, evidence (41 sources)
- `docs/audit/auth-onboarding.md` — 27 screens audited
- `docs/audit/home-memories-profile.md` — 11 screens audited
- `docs/audit/design-system.md` — components, states, navigation
- `docs/STATUS.md` — build state · `docs/DECISIONS.md` — approval history

---

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

- **Status:** Proposed · **Priority:** P2 · **Category:** Differentiation · **Dep:** FS
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

1. **Competitor UI patterns** — onboarding lengths, invite handoffs, empty
   states, daily-prompt interaction design. *Attempted; agent failed. Not done.*
2. **The real problems couples face** — the existing research is strong on market
   and silent on couples (0 mentions of mental load, resentment, or financial
   conflict). *Attempted; agent failed mid-write. Not done.*
3. **Validate the wedge** — cohabiting 1–5 years is reasoned, not tested.
4. **Whether the JMIR daily-prompt finding transfers.** It is the best evidence
   in the category, which is not the same as strong evidence.

---

## 18. Change log

| Date | Change |
|---|---|
| 2026-09-01 | File created. Consolidates `research/shortlist.md`, `research/codebase-ideas.md`, and three audit documents into one source of truth. IDs `LOV-001`–`LOV-020` assigned. |
| 2026-09-01 | Audits completed: 27 auth/onboarding screens, 11 home/memories/profile screens, design system. |
| 2026-08-31 | Market research completed (`research/couples-app-strategy.md`, 41 sources). |
