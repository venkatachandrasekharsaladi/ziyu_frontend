# Research: couples-app-strategy

[← Product docs index](../PRODUCT.md)

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

### 1. What exists

#### 1.1 Modules

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

#### 1.2 What is *not* there, and matters more than the modules

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

#### 1.3 What the copy and sample content say the product is

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

#### 1.4 The honest summary of the inventory

LoveOS today is **a shared archive with a chat tab attached**, built to a very
high standard as an unpersisted prototype. Both halves are retrospective. There
is no prospective mechanic anywhere in the product — nothing that gives a couple
a reason to open it *today* that did not exist yesterday. The two candidates the
Home dashboard gestures at ("Leave a little note", "Add an Important Date") are
empty-state cards, not a ritual.

---

### 2. The market

#### 2.1 The graveyard, and what killed each one

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

#### 2.2 What survives, and what its users complain about

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

#### 2.3 Monetisation and retention reality

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

### 3. What the evidence actually supports

#### 3.1 The strongest single study in this space

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

#### 3.2 The two qualitative findings that should change the product

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

#### 3.3 Gottman, honestly

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

#### 3.4 Segments

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

### 4. Do next

Ordered. Each item states what it is in this codebase's terms, why, rough cost,
how it fits what exists, and the metric that says it worked.

#### 4.1 Pick a backend and persist one narrow slice — do not wait for the v3 contract

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

#### 4.2 The Daily Question, delivered as a message in the existing chat

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

#### 4.3 Answered prompts become memories automatically

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

#### 4.4 Design the exit before launch, not after

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

#### 4.5 A safety pass on what already exists

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

### 5. The three questions that decide whether this works

#### 5.1 Why would a couple open this daily?

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

#### 5.2 The dual-adoption problem

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

#### 5.3 Privacy and trust

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

### 6. Do later

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

### 7. Do not build

Including the founder's own backlog, assessed straight.

#### 7.1 Chat as a messaging replacement — stop investing

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

#### 7.2 Call and video statistics ("you have called each other n times… 22 hours totally")

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

#### 7.3 Note-taking in calls

Depends entirely on 7.2 existing, so it inherits the same verdict. Setting that
aside: people do not take minutes of a phone call with their partner. *This
second point is speculative — I found no research either way — but the
dependency alone settles it.*

Note-taking **in chat**, separated from calls, is a different and much better
idea: it is close to the "Leave a little note" empty-state card the Home
dashboard already draws, and it is cheap. Fold it into the prompt work (4.2)
rather than treating it as its own feature.

#### 7.4 Calendar *booking*

The founder's backlog says "calendar booking," which implies reserving
restaurants or activities. That is a supply-side marketplace wearing a calendar's
clothes; see 7.5. A shared calendar without booking is already partly built and
is in §6.

#### 7.5 A marketplace, and ads

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

#### 7.6 Streaks, scores, and compatibility percentages

Streaks: the JMIR study documents them turning into a commitment scoreboard
between partners, and Evergreen's reviewers name streaks-plus-thin-content as
the exact churn moment (§2.2, §3.2). Relationship health scores and
compatibility percentages: no evidence base, reductive by construction (Lupton's
critique, discussed in the JMIR paper), and a ready-made instrument for a
controlling partner. A gentle "you've answered together 14 times" retrospective
in the archive is fine; a live, comparable, partner-visible counter is not.

#### 7.7 `module-06-memories`

Empty scaffolding duplicating `module-03-memories`, already flagged for deletion
in the chat spec §14. Delete it. Not a strategy item — just noise in every
future search of the tree.

---

### 8. The metrics that matter

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

### 9. Sources

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
