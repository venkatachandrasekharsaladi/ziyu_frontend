# Competitor UI and Interaction Patterns

Research scope: the interface and interaction layer of couples apps and adjacent products, for comparison against LoveOS's frontend. Market landscape, the shutdown graveyard, monetisation, retention arithmetic, and relationship science are covered in `docs/research/couples-app-strategy.md` and are deliberately not repeated here — this document stays on the UI/interaction surface: onboarding sequencing, the partner-invite handoff, the daily surface, the daily ritual, the archive, empty states, notifications, and account controls.

Evidence standard: every claim below is either sourced (a URL is given) or explicitly flagged `(inference — not verified)` where it is a plausible read of a screenshot-less description rather than something a cited source states directly. A few sources describe the flow without describing exact screens the invited person sees; that gap is called out rather than guessed at.

## Products covered

Paired, Lasting, Evergreen, Cupla, Love Nudge (5 Love Languages), Gottman Card Decks, Locket, Marco Polo, BeReal, Duolingo, Day One, Apple Photos Memories.

## LoveOS baseline (for comparison only — from the completed audit, not re-researched here)

- Onboarding: 21 screens (24 Welcome-to-Home)
- Partner-invite handoff: broken — partner A never learns partner B redeemed the code
- No shared empty/loading/error state components — every screen improvises
- Chat module (2,778 lines), memory archive with albums/search/on-this-day, home dashboard
- `module-04-timeline` empty, profile barely started
- No backend

---

## 1. Onboarding: step counts and sequencing

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

## 2. The partner-invite handoff

This is the section the brief calls the single most valuable part of this research, so it gets the most detail and the most direct sourcing.

### Paired — code/link surfaced at four separate touchpoints, not just onboarding

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

### Cupla — the clearest documented pattern for exactly LoveOS's failure mode

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

### Locket — link-first, contact-second, and asymmetric friend-request semantics

Locket's onboarding asks for phone number, first/last name, then immediately prompts "invite friends with a text message" ([nerdschalk guide](https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/)). To add someone: search contacts or username, or share/receive a link, or accept from a suggestions list; but critically, **"your new friend will be added once they accept your friend request"** — a mutual-acceptance gate, not an automatic connection on link-tap ([Locket Help Center: "How do I add friends on Locket?"](https://help.locket.com/en/articles/7914880-how-do-i-add-friends-on-locket)). The invite-link flow specifically: tap your link → the recipient can "send you a friend request," which you (the original sender) then still have to approve ([Locket Help Center: "How do I share my invite link?"](https://help.locket.com/en/articles/7914923-how-do-i-share-my-invite-link)).
- Why the two-step (link → request → accept) exists: Locket is a many-to-many friend graph (widget shows photos from *multiple* friends, capped at 20), so it needs a request/accept model the way any social graph does — a link alone can't establish trust in both directions.
- Applies to LoveOS? Only partially — LoveOS is explicitly a 1:1 pairing, not a friend graph, so the extra request/accept round-trip Locket needs for its many-to-many model is arguably unnecessary overhead for a couple. But the underlying principle — the inviter should get an explicit, visible confirmation event distinct from the general "someone joined" ambient update — is exactly the missing piece in LoveOS.
- Adopt/adapt/ignore: **Adapt.** Don't copy the two-step accept flow (wrong topology for 1:1), but do copy the idea that redemption should produce a discrete, named event ("X accepted your invite") the *original device* actually receives, not merely a changed pairing-status flag the UI happens to read on next load.

### BeReal — link-or-username, contacts-first-class, one-way "may know" suggestion surface

BeReal's invite surface: a friend icon opens contacts-with-BeReal-accounts (first-class, at the top of suggestions), a "People You May Know" list (friends-of-friends), a username search with an "Add" button, and a shareable profile link users can post to other social networks or copy/paste directly ([BeReal Help Center: "Invite & Add Friends"](https://help.bereal.com/hc/en-us/articles/7537949847069-Invite-Add-Friends); corroborated by [Alphr](https://www.alphr.com/add-friends-bereal/)). Like Locket, this is a friend-request model (send request → other party approves), not a paired-device handoff — again the wrong topology for a couples app, included here mainly because BeReal's *daily ritual* mechanics (below) are the more relevant transferable pattern from this product.

### Marco Polo — the most instructive "graceful non-blocking invite" of the set

Marco Polo's add-people flow checks a phone number against the platform: existing users show a **Chat** button; non-users show an **Invite** button that sends a text with a download link ([Marco Polo Support: "How do I add someone to Marco Polo?"](https://support.marcopolo.me/article/47-add-people)). The detail that matters most for LoveOS: **"A person doesn't have to be on the app for you to record and send them a Polo. They'll be able to view and respond to Polos you've sent once they create an account"** ([same source](https://support.marcopolo.me/article/47-add-people)). In other words, Marco Polo does not block the inviting user's core action (recording a video message) on the invitee's acceptance at all — you can create content addressed to someone who hasn't joined yet, and it simply waits for them.
- Why it exists: video messaging's core loop (record → send) has no reason to be gated behind a completed handshake; Marco Polo decouples "can I use the product" from "has the other person joined."
- Applies to LoveOS? Very directly, and this is the single most exportable idea in this whole section. LoveOS's invite handoff is currently a hard gate — pairing has to complete before the shared surfaces (chat, memories) mean anything. Marco Polo's model suggests a different framing: let partner A start using chat/memories/daily-question immediately, addressed to a not-yet-joined partner B, with content queued and delivered the moment B joins — rather than treating "pairing complete" as a blocking precondition for any product value.
- Adopt/adapt/ignore: **Adopt the framing, adapt the mechanics.** A full "message a phone number that has no account yet" implementation is a bigger backend lift than LoveOS's current no-backend state supports, but the *design principle* — don't gate core product value behind invite completion, let A start "writing to us" before B has joined, and surface it to B the moment they do — directly addresses the audit's finding that A never learns B redeemed the code, by reframing the redemption event as "unlocking A's already-created content" rather than a silent status flip A has no way to observe.

### Summary judgment on the invite handoff

The best real-world precedent for LoveOS's specific bug is **Cupla's documented "wrong-account problem"** framing — not because Cupla necessarily solves it well, but because it is the only source that explicitly names and normalizes the exact symptom (one side connected, one not) and ties it to a diagnosable cause rather than treating it as a black box. The single best *design idea* to steal, though, is **Marco Polo's non-blocking invite** — treating an unaccepted invite as a queued/pending state that doesn't block product use, rather than a gate.

---

## 3. The daily surface (what a user sees first each day)

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

## 4. The daily ritual: prompt delivery and one-sided answers

**The turn-state problem is universal wherever a prompt exists (Paired, Evergreen implicitly, Lasting's paired-reflection exercises).** All three prompt-based apps in this set have the same structural fact: a two-person prompt is not "answered" as a single event, it's answered in two independent events that may be minutes or days apart. Paired's Discuss-tab turn states (above) are the most concretely documented handling of this. Evergreen's daily-question/streak mechanic is described only at the marketing level in available sources ("streaks and gamified prompts... 'genuinely fun first experience'" per the [Unstar comparison](https://unstar.app/blog/paired-lasting-love-nudge-evergreen-cupla-couples-apps-ranked-2026)) — I could not find a sourced description of what Evergreen shows a user whose partner hasn't answered yet, and flag that as unverified rather than guess at it.

**Marco Polo's asynchronous framing again applies here.** "Send and respond when convenient... watch it whenever they'd like, as many times as they'd like, and reply when it's convenient" ([CitizenSide](https://citizenside.com/technology/how-to-use-the-marco-polo-app/)) — the entire product is built around there being no penalty, visible or implied, for delayed response. There is no streak, no "they haven't replied" indicator visible to the sender described in any source reviewed.
- Why it exists: video messages take longer to consume than text, so Marco Polo had to design out any pressure around response latency or the format would feel like an obligation instead of a convenience.
- Applies to LoveOS? Yes, specifically to how a "your partner hasn't answered yet" state should read. Paired's honest "it's their turn" status and Marco Polo's total absence of response-pressure signaling represent two different design choices for the same underlying fact (asymmetric response time). A couples app plausibly wants closer to Paired's explicit-but-neutral framing (so the waiting partner has information) without drifting into something that reads as pressure or guilt on the slower partner.
- Adopt/adapt/ignore: **Adopt** an explicit but neutral turn-state indicator (à la Paired), and **adopt** Marco Polo's discipline of never signaling delay as a failure — no "they still haven't answered" red flag, just a calm "waiting" state.

**Duolingo's streak/loss-aversion model is the wrong pattern to import here, and the reason is structural, not aesthetic.** Duolingo's streak is built on daily solo practice where the only actor whose behavior needs reinforcing is the single user; loss aversion over a personal streak works because the user fully controls whether it continues ([Digia teardown](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/); [Deconstructor of Fun](https://duolingo.deconstructoroffun.com/mechanics/streaks)). A couples-app streak is jointly controlled — one partner can break it regardless of the other's effort, which turns a motivational mechanic into a source of blame between two people, which is a fundamentally different (and worse) social dynamic than a solo streak breaking. The existing strategy doc already flags "streaks, scores, and compatibility percentages" under "do not build" — this section corroborates that from the notification-design angle specifically: Duolingo's own notification restraint (capped at two pushes/day, "save notifs" reserved only for imminent loss) is evidence the mechanic requires careful tuning even in the single-user case it was designed for; grafting it onto a two-user case removes the one lever (individual control) that makes the tuning work at all.
- Adopt/adapt/ignore: **Ignore** the streak mechanic. **Adopt** only the notification-restraint discipline underneath it (cap frequency, reserve urgency for genuinely time-limited moments) as a general notification principle, decoupled from streaks entirely.

---

## 5. The archive: history, resurfacing, search

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

## 6. Empty states

This is the area with the thinnest sourced material — none of the products researched publish a screenshot-level description of their empty states in support docs, and this is explicitly flagged as a gap rather than papered over.

**What is sourced:** Locket's day-one state is described only inferentially — a new user is asked for phone number and name, then immediately prompted to invite friends by text, and "the widget would naturally appear blank... [until] friends accept your invitations and start sending photos" ([nerdschalk](https://nerdschalk.com/how-to-use-locket-widget-step-by-step-guide/) — the "widget would naturally appear blank" characterization is the search summary's inference from Locket's documented mechanics, not a directly quoted support statement, so treat it as `(inference — not verified)` at the pixel level, though the underlying mechanic — no friends, no photos, blank widget — is confirmed).

Evergreen's marketing copy claims "no overwhelming onboarding tour or forced tutorial; you can start your first exercise immediately" ([App Showcase teardown](https://screensdesign.com/showcase/evergreen-relationship-growth)), which implies there is no dedicated empty state screen at all — the user is dropped straight into a real exercise rather than shown a placeholder.

**What is not sourced, and should not be guessed at:** exact copy or visuals for a first-open chat thread, an empty memory archive, or an empty timeline, for any product in this set. This is a genuine limitation of the research — app-store screenshots for these products are optimized to show populated states (this is universal marketing practice), and no teardown or UX case study in the search results documented an empty-state screenshot specifically.
- Why this matters for LoveOS anyway: the one thing that *is* clearly established across sources is that the two products with the most deliberate anti-empty-state design (Duolingo: first lesson before paywall; Evergreen: exercise immediately, no forced tour) both solve emptiness by giving the user something to *do* immediately rather than something to *look at* (a designed placeholder). That's a real, transferable principle even without pixel-level examples.
- Adopt/adapt/ignore: **Adopt the principle** — LoveOS's audit already flags "no empty/loading/error state components exist." The fix implied by this research is not primarily "design a beautiful empty-archive illustration," it's "give the user an action that produces content" (e.g., an empty memory archive's empty state should default to "add your first memory" as an inline action, not a static message) wherever the surface allows it. Where an empty state genuinely cannot offer an action (e.g., chat waiting on an unaccepted invite), that's exactly where Marco Polo's non-blocking-invite framing (§2) becomes relevant — let the empty state be about content already created and pending delivery, not a dead end.

---

## 7. Notifications

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

## 8. Settings, privacy, account controls

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

## 9. Patterns worth adopting, adapting, or ignoring — summary table

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

## 10. Sources

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
