# Audit: Home, Memories, Profile

Scope: `src/modules/module-02-home/`, `src/modules/module-03-memories/`, `src/modules/module-05-profile/`, their routes in `src/app/(app)/`, their copy in `src/copy/`. Read-only audit, no code changed.

Backend is entirely absent — every data source is either a real Zustand store filled only by onboarding (`storyStore`, `spaceStore`, `relationshipStore`) or a mock service (`memoriesService`) backed by an in-memory `Map` that starts empty and forgets everything on restart. `src/sample/` is a UI-only fallback gated by `USE_SAMPLE_CONTENT` (`src/sample/index.ts:21`), currently `true`.

---

## Screens

### Home Dashboard — `/(app)/home` (`src/modules/module-02-home/screens/HomeDashboardScreen.tsx`)

**Purpose.** The app's landing tab: greeting, days-together, a featured memory, stat tiles, a birthday spotlight, "Coming up" countdowns, an "Upcoming" list, and a "Little things" reminder row.

**What the user sees/does.** Greeting only renders if `spaceName` (or sample) is set (`:152`). Days-together is real (`daysSince(story.met?.value)`, `:80`) with an honest unknown state (`:158-166`, `daysUnknown`/`daysUnknownHint`). "A memory worth keeping" is a swipeable pager over up to 4 photo memories (`:88-94, 174-206`), but the pool is **sample-only** (`:91-93`) — with the flag off, this section never renders, real or otherwise, because nothing computes a "featured" pick from the live memories service. Stat tiles ("Your little world"), the birthday spotlight card, and the "Relationship pulse" card are 100% sample-gated (`:98-117, 208-234, 236-266, 268-285`) and vanish entirely with the flag off — they have no real-data equivalent at all, not even an empty state. "Coming up" is real: built from `story.keyDates` via `buildComingUp` (`src/modules/module-02-home/comingUp.ts:27-46`), with sample rows only as fallback when the couple has entered nothing, and a proper empty-state card otherwise (`:288-297`). "Upcoming" is pure sample, no real equivalent, no empty state — it simply disappears with the flag off (`:313-325`). "Little things" has a real empty-state card (`:348-357`) but no real content path — the only source is `SAMPLE_HOME.littleThings`, so it always shows the empty prompt to a real couple, forever, since there is no capture flow for a "note."

**Flow.** In: bottom nav "Home" tab (always live). Out: featured pager → memory detail; "Coming up" row → Occasion screen; empty-calendar/note CTAs → Calendar / Add Memory.

**Strengths.** Real math (days-together, countdowns) is genuinely computed and never faked once the couple has entered dates — verified by a dedicated no-sample test (`src/modules/module-02-home/screens/__tests__/HomeDashboardNoSample.test.tsx`). The screen degrades gracefully section-by-section rather than crashing when data is missing.

**Problems.** Roughly half the dashboard (stat tiles, spotlight, pulse, "Upcoming") is sample-only with zero real-data path — not "empty state pending backend," just permanently absent for a real couple. That is a materially different, much thinner screen than what a demo of this build shows. "Little things" is the same: it look like a working reminders feature but nothing in the app can ever populate it.

**Functional/UI-only.** Days-together, Coming-up, calendar/note CTAs: functional against real state. Stat tiles/spotlight/pulse/Upcoming/Little-things content: UI exists only for sample content, no backing feature.

### Calendar — `/(app)/calendar` (`src/modules/module-02-home/screens/CalendarScreen.tsx`)

**Purpose.** Month grid + agenda for the couple's key dates; no Figma frame — built from the dashboard's own feature note ("Calendar", "Notes", "pinned events").

**What the user sees/does.** Month grid with prev/next arrows (state only, not persisted), dots on days with an event (`:153-158`), an agenda list built from real `keyDates` (`buildComingUp`, same source as Home) placed onto calendar dates by countdown rather than a stored date (`:56-59` comment, `:73-76`). Reminders section is sample-only (`:79`), same "Little things" gap as Home — no real capture path, so a real couple sees the reminders empty-state forever.

**Flow.** In: Home's empty-calendar CTA, header back. Out: event row → Occasion screen; add-date/write-note CTAs → Add Memory (not a real date-adding flow — both point at the memory form, which cannot save a key date at all, only a memory).

**Strengths.** Correctly derives calendar placement from the same countdown logic as Home (no duplicated logic, confirmed by shared `comingUp.ts`). Proper empty states for both agenda and reminders.

**Problems.** "Add an Important Date" and "Write a Note" both route to Add Memory (`:82`), which has no fields for a recurring date or a sticky note — the CTA promises something the destination screen cannot do. The offset-based month navigation is pure UI state; nothing persists which month you were viewing.

**Functional/UI-only.** Agenda from real key dates: functional. Reminders: sample-only, no real path. Add-date/write-note CTAs: UI exists, routes to a screen that cannot fulfill the specific promise (adding a *date*, or a *note*).

### Occasion — `/(app)/occasions/[key]` (`src/modules/module-02-home/screens/OccasionScreen.tsx`)

**Purpose.** Detail screen behind a "Coming up" row — no Figma frame; built because the dashboard previously drew these rows as flat, non-interactive text.

**What the user sees/does.** Countdown chip, occasion label/date; for birthdays, a spotlight photo (sample-only, `:65`) and a "past birthdays" rail filtered from sample memories only (`:66-69`) — a real couple's own past-birthday memories would never surface here since it only reads `SAMPLE_MEMORIES`. Non-birthday occasions get a generic "Add memory" action.

**Flow.** In: Home/Calendar row tap. Out: Add Memory, Calendar, memory detail (from past-birthdays rail).

**Strengths.** Handles a missing/unknown key gracefully with a "not found" state and a way back (`:49-58`).

**Problems.** "Past birthdays" never reflects the real memories library — it is wired to `SAMPLE_MEMORIES` directly, not `memoriesService`, so it can never show what the couple actually saved even once they have birthday-tagged memories.

**Functional/UI-only.** Countdown/label: functional (reads real `keyDates`). Photo + past-birthdays rail: UI-only, sample-fed, no real-data path.

### Memories Home — `/(app)/memories` (`src/modules/module-03-memories/screens/MemoriesHomeScreen.tsx`)

**Purpose.** Library entry point: count line, add/search, "On this day" teaser, "Your albums" rail, "Recently added" bento grid.

**What the user sees/does.** Loads via `memoriesService.list()`; falls back to `SAMPLE_MEMORIES` only if the real list is empty and the flag is on (`:56-58`) — this is a real, working empty/loading/sample-fallback chain, unlike Home. Empty state is a proper `StatusScreen` with a CTA (`:81-90`). "Your albums" rail is **unconditionally** `SAMPLE_ALBUMS` (`:14, 28, 165-167`) — not gated by `USE_SAMPLE_CONTENT` at all, so even with the flag off and a real, populated memory library, the album rail still shows the same six hardcoded sample albums with their fake Figma-drawn counts (86/32/24/12/18/9, `src/sample/albums.ts:29-64`). "Recently added" correctly reads real memories once they exist.

**Flow.** In: bottom nav "Memories". Out: add → Add Memory; search → Search; "On this day" header/hero → On This Day screen; album card → Album Detail; memory card → Memory Detail.

**Strengths.** This is the one screen in scope where loading/empty/populated/sample-fallback are all deliberately built and tested (`MemoriesHomeNoSample.test.tsx` covers empty state and a failed-load-treated-as-empty path, `:61-67`). "On this day" hero correctly routes its photo tap to the On-This-Day screen rather than the lightbox (`photoTap="press"`, a deliberate, sensible override documented in-line).

**Problems.** The albums rail is not just "sample content filling a gap" — it is architecturally disconnected from both the flag and the real memories, permanently. A real couple who tags 30 memories "Trips" will still see a static "32 memories" Trips cover that has nothing to do with their data, forever, because nothing in `AlbumsScreen`/`MemoriesHomeScreen` ever computes from live tags.

**Functional/UI-only.** Memories list, count, add/search entry: functional. Albums rail: UI-only, permanently disconnected from real data (not just gated by the flag).

### Memory Detail — `/(app)/memories/[id]` (`src/modules/module-03-memories/screens/MemoryDetailScreen.tsx`)

**Purpose.** Single memory view.

**What the user sees/does.** Title, date/location, caption, private "Our Note" card, "Added by", and a working favorite toggle (`memoriesService.toggleFavorite`, real optimistic update from the service response, `:54-60`). Proper loading (chrome-only, no flash, `:64`), not-found, and network-error states driven by real `Result` codes (`:37-45`).

**Flow.** In: any memory card/photo tap across Home, Memories Home, On This Day, Occasion, Album Detail. Out: favorite toggle; back replaces to Memories Home (`:62`).

**Strengths.** Best-built screen in scope for state handling — real loading/error/not-found paths, not just happy path. Deliberately dropped "Share to Chat" and an overflow "More" menu because neither has anything behind it (`:19-22` comment) — an unusually disciplined choice not to fake affordances.

**Problems — the serious one.** There is **no edit and no delete**. `memoriesService` (`src/services/memories/types.ts:34-39`) exposes only `list`, `get`, `create`, `toggleFavorite`, `search` — no `update`, no `remove`/`delete`. Nothing in the UI offers it either: no edit button, no swipe action, no long-press menu. For an app explicitly pitched as a permanent shared archive, a couple cannot fix a typo'd caption, correct a wrong date, remove a duplicate, or delete a memory they no longer want — ever, at any layer, mock or real. This is the single biggest functional gap in the memories module.

**Functional/UI-only.** Favorite toggle: functional. Everything else on the screen: functional display of real data, no edit/delete capability exists.

### Add Memory — `/(app)/memories/new` (`src/modules/module-03-memories/screens/AddMemoryScreen.tsx`)

**Purpose.** Create-memory form.

**What the user sees/does.** Photo well, title (required), date, caption, location, private note, save/cancel. Validates only the title (`:37-40`), which is a reasonable minimum-friction choice given everything else is genuinely optional in the design. Save calls `memoriesService.create` and replaces to the library on success (`:64`, correctly not `push`, so back doesn't return to a blank form). Handles a network-style failure via a magic `location: "offline"` sentinel in the mock (`src/services/memories/mock.ts:16, 56`) with a real error message.

**Problems.** `onPickPhoto = useCallback(() => {}, [])` (`:67`) — the photo picker is a complete no-op. Tapping "Tap to add photo" does nothing at all; no picker opens, no placeholder photo is set, nothing. Every memory a real user adds through this form is permanently textual — there is no way, anywhere in this build, for a couple to attach their own photo to a memory. Given Memories Home's "Recently added" bento and "On this day" hero both actively prefer photo memories, a real couple's self-added memories will visibly look worse than the sample content they're being shown, with no path to close that gap. This is flagged in code as deliberate (`expo-image-picker` not yet installed, per `PhotoPicker.tsx:20-22`), but the screen gives no signal to the user that the photo affordance is currently non-functional — tapping it just silently does nothing.

**Functional/UI-only.** Text fields + save: functional, hits the real mock service. Photo picker: UI exists, zero effect — worth calling out explicitly as required by the brief.

### Search Memories — `/(app)/memories/search` (`src/modules/module-03-memories/screens/SearchMemoriesScreen.tsx`)

**Purpose.** Free-text search over the couple's memories.

**What the user sees/does.** A single input; real debounced-by-effect search against `memoriesService.search` (title/caption/location/note/tags substring match, `mock.ts:83-87`). Three distinct textual states: empty library, no query yet, no results — all wired correctly (`:77-88`). Suggestion chips shown in the Stitch design ("Rome", "coffee", "Sarah") were deliberately dropped rather than faked (`:17-19` comment) — a good, honest call: chips built from sample data would search for content a real couple never saved.

**Strengths.** This is a fully real, fully functional feature — search genuinely works against whatever is in the mock store. Nothing here is sample-dependent.

**Problems.** Minor: it's a plain substring match with no ranking, and there's no way to filter to a specific field (date range, tag, album) — but for a scoped v1 this is a reasonable, honestly-scoped feature rather than a token one, unlike some other screens in this module.

**Functional/UI-only.** Fully functional against the mock service.

### On This Day — `/(app)/memories/on-this-day` (`src/modules/module-03-memories/screens/OnThisDayScreen.tsx`)

**Purpose.** Memories that fall on today's calendar date across years.

**What the user sees/does.** Groups real memories by month/day (`groupByYear`, tested pure function, `:47-62`), newest year first. With real data and nothing today, or with the flag off, shows a proper empty state with an add-memory CTA (`:126-135`). With the flag on and nothing today, silently re-anchors to October 14 — the date the design was drawn against (`:109-113`) — so the sample content always has something to show; this is documented and deliberate, but worth naming as a “the demo always looks good, 364/365 real days won't” effect once the flag flips off in production.

**Strengths.** Correct grouping logic, proper "years ago" labeling, genuine empty state.

**Functional/UI-only.** Fully functional against real data once populated; the October-14 fallback is sample-only scaffolding, clearly commented as such.

### Albums — `/(app)/memories/albums` (`src/modules/module-03-memories/screens/AlbumsScreen.tsx`)

**Purpose.** Grid of all albums ("Your albums fill up as you tag memories").

**What the user sees/does.** Renders `SAMPLE_ALBUMS` directly (`:10, 38-48`) — there is no import of `USE_SAMPLE_CONTENT` in this file at all. The `SAMPLE_ALBUMS.length === 0` empty-state check (`:38`) is dead code: that array is a hardcoded literal of 6 entries (`src/sample/albums.ts:28-65`) and can never be empty. The listed "eyebrow" (`Chandu & Sarah`) is likewise hardcoded sample copy, not the real couple's space name.

**Problems — serious, and distinct from "sample fills the empty state."** This screen does not read `USE_SAMPLE_CONTENT`, does not read the real memories service, and cannot ever be empty. A real couple with zero memories, or a real couple with 200 memories none of which are tagged "Trips," sees an identical "Trips — 32 memories" cover either way. This isn't a graceful sample-content fallback like Home or Memories Home; it's a screen that was never actually connected to the app's own data model, unlike its sibling `MemoryCard`/`memoriesInAlbum` logic, which *is* capable of deriving real counts (`memoriesInAlbum` in `src/sample/albums.ts:68-71` works against any `Memory[]`, real or sample — it's just never called with the real list here).

**Functional/UI-only.** Entirely UI-only; not gated, not wired to any real state.

### Album Detail — `/(app)/memories/albums/[key]` (`src/modules/module-03-memories/screens/AlbumDetailScreen.tsx`)

**Purpose.** One album's cover + feed.

**What the user sees/does.** Cover hero with reversed-out title, subtitle uses the fake Figma `sampleCount` (not `memories.length`, `:70`, `copy/albums.ts:17-19`) alongside `SAMPLE_HOME.coupleName` — again, not the real space name. Feed is `memoriesInAlbum(album)`, called with its default `memories = SAMPLE_MEMORIES` (`:44`, `sample/albums.ts:68`) — so, same as the Albums list, this never reads the real memories service. Proper "album not found" state with a back CTA.

**Problems.** Video tiles are drawn in the design but there is no video field in the data model and no player installed; a video memory silently renders as a still photo (`:20-22` comment) — an honest, documented limitation rather than a broken feature, but worth flagging as a design/data-model gap if video is actually planned.

**Functional/UI-only.** Entirely UI-only, same as Albums list — never reads live memories or the real couple's name.

---

### Our Space (Profile) — `/(app)/profile` (`src/modules/module-05-profile/screens/OurSpaceScreen.tsx`, 124 lines total for the whole module)

**Purpose.** Per its own header comment, "a deliberate stub" — the design (Stitch e6c82bcb) draws a full hub with couple names, a days-together counter, a private-space note, and rows to Personalize/Our Identity/Space Preferences; none of those destinations exist in code yet.

**What is actually there.** A heading + lede (from the design), an appearance section with a working light/dark `ThemeToggle`, and a sign-out control — the one thing the *design itself never drew* (`copy/ourSpace.ts:18-23`). Sign-out is real: calls `authService.signOut()`, resets `relationshipStore`, and routes to welcome, gated behind a `ConfirmDialog` (not `Alert.alert`, because `Alert` has no react-native-web implementation and the button would otherwise be silently unreachable on web — a real bug caught and documented in-line, `:31-34`).

**What a user would obviously expect and is absent.** Everything the design promises and more: the couple's own names/photos, a days-together counter (redundant with Home, but expected here too), any privacy or notification settings, any partner-management (repairing, viewing partner's info, disconnecting), any account settings (email/password change, delete account), any data export/backup messaging (important given nothing persists across a restart — a couple would reasonably want to know that), and any "About/Help" or app info. As it stands this is a settings screen with exactly one setting (appearance) and one destructive action (sign out); there is no "profile" content at all — no representation of "me" or "partner" anywhere in this scope. Given LoveOS's own premise (paired identity, no accounts/roles beyond the couple), the complete absence of partner-facing info here (is my partner still connected? when did we pair? re-invite if disconnected?) is a bigger gap than it looks from the line count alone.

**Strengths.** Honest about being a stub in its own comments rather than pretending otherwise. The sign-out flow is the most carefully reasoned bit of code in this whole scope (web-Alert bug catch, unconditional state cleanup, order-of-operations comment on reset-before-navigate).

**Functional/UI-only.** Theme toggle and sign-out: fully functional. Everything else a "profile"/"our space" screen would be expected to hold: absent, not merely unwired.

---

## Cross-cutting findings

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

## Direct answer: can a memory be edited or deleted?

**No.** `memoriesService` (`src/services/memories/types.ts:34-39`) defines only `list`, `get`, `create`, `toggleFavorite`, `search`. There is no `update` or `delete` in the type, the mock implementation (`src/services/memories/mock.ts`), or anywhere in the UI (no edit button, no swipe-to-delete, no long-press menu, on Memory Detail or any list). Favoriting is the only mutation possible on an existing memory.
