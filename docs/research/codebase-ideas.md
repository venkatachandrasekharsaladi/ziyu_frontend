# Research: codebase-ideas

[← Product docs index](../PRODUCT.md)

## Feature ideas from inside the codebase


These come from having read the code rather than from market research, and that
is the point of keeping them separate from `shortlist.md` and
`couples-app-strategy.md`. Those two argue from evidence about the category.
This one argues from what is already sitting in this repository, half-built or
unused.

Ranked by value per unit of work. Every claim about the current state was
verified against the code, and the verification is quoted so you can check it.

---

### 1. Draw the Timeline from the story onboarding already collects

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

### 2. Make the "Drafted note" card real

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

### 3. Apply the reciprocity gate to memories, not only to prompts

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

### 4. Repurpose the Moment screens as asynchronous presence

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

### 5. A repair signal — for after the fight, not during it

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

### Two I would talk you out of

**A "days since we last…" counter.** I nearly proposed this as drift made
visible — days since a date night, since a real conversation. It is a guilt
mechanic wearing a metric. The research contains a user describing precisely this
harm with streaks: *"I'm on a streak of 27 days and he's on 2, it gets to me."*

**Making "LOVEOS AI" real.** It is currently a static card. The moment it becomes
an assistant, "do you train on our messages?" is the first question anyone asks —
and right now there is no encryption story to answer it with. The strategy doc
makes the same call independently.

---

### If only one

**Number 1.** It is nearly free, it uses data already collected, and it fixes the
oddity that the app's most personal content currently has nowhere to live.

But note the honest tension: the strategy document's top recommendation is the
Daily Question, and it argues the product has too many retrospective surfaces
already. Timeline is a third one. The reconciliation is to build Timeline *as the
place answered prompts accumulate* rather than as another static archive — which
means the Daily Question comes first and Timeline follows it.
