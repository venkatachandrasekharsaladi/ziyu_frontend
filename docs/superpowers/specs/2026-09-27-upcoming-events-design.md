# Upcoming events — design

**Date:** 2026-09-27
**Status:** Draft, awaiting review
**Module:** `src/modules/module-02-home/` (new: `src/services/upcomingEvents/`, `src/sample/upcomingEvents.ts`)
**Routes:** `src/app/(app)/calendar.tsx` (extended) + new `src/app/(app)/upcoming/`

---

## 1. Purpose

Home's "Upcoming" section (`OccasionCard` rows — "Movie Night", "Dinner at
Luigi's") is display-only sample strings today: no `onPress`, no record
behind either row, nothing to open. Home's `MiniCalendar` is decorative too —
it marks days that already have a key date, but tapping a day does nothing.

This build turns "Upcoming" into a real feature: ad-hoc plans (not the
recurring key dates "Coming up" already covers) with a date, a time, a place,
a note, an optional photo, and a checklist — created by tapping any day on a
calendar, and genuinely openable, editable and removable afterwards.

Frontend-only, same as every other module in this repo: no service is real,
nothing persists, and the sample fallback pattern (`memoriesService`'s own)
is followed exactly.

## 2. Decisions taken

| Decision | Choice | Consequence |
|---|---|---|
| New entity vs. reusing key dates | **New entity**, `UpcomingEvent` | A key date (birthday, anniversary) recurs annually and has no time/place/checklist. Forcing "Movie Night" into that model would be dishonest — it needs its own shape. |
| New page vs. extending the existing calendar | **Extend** `CalendarScreen` (`/(app)/calendar`) | It already does month navigation and a marked-day grid. A second, parallel calendar page would duplicate that UI for no reason. |
| Where events live in that screen | A new **"Upcoming"** section, alongside the existing key-dates **"Agenda"** section | They are different concepts (recurring vs. one-off) and read better as two lists than one merged, re-labelled one. |
| Day-tap behaviour | Empty day → create form pre-filled with that date. Day with exactly one event → opens it. Day with more than one → a short list to choose from. | Matches "when we click on any date then we can add a note & image, date, time, place" without hiding events a day already has. |
| Checklist | A simple `{ id, text, done }[]` on the event, editable in the form (add/remove rows) and checkable off in the detail view | This is what "needed things" meant, per the earlier answer. |
| Home | Keeps a 2-item preview of the soonest upcoming events, each row now real and tappable, plus a **"View all"** link to `/(app)/calendar` (same pattern as "Your albums") | Per the earlier answer — Home stays useful without owning the full feature. |
| `MiniCalendar` | Deleted, along with its now-orphaned test coverage | It becomes redundant the moment `/(app)/calendar` is one tap away and does everything it did plus more. |
| Sample data | "Movie Night" / "Dinner at Luigi's" become real seeded `UpcomingEvent` records, at `+2` and `+4` days from today (computed at load, like `comingUp.ts`'s `dateInDays`, not a fixed date that would drift into the past) | Per the earlier answer — same titles and days the couple already sees, now backed by something real. |

## 3. Architecture

Layered exactly like `memories`:

```
services/upcomingEvents/         types.ts, mock.ts, http.ts (stub), index.ts
  ↓
sample/upcomingEvents.ts         SAMPLE_UPCOMING_EVENTS — UI-layer only,
                                 never imported by services/, deleted
                                 wholesale with the rest of src/sample/
  ↓
modules/module-02-home/
  components/EventForm.tsx        create + edit, shared
  components/ChecklistEditor.tsx  add/remove/edit rows (form)
  components/ChecklistView.tsx    check off rows (detail)
  screens/CalendarScreen.tsx      extended: pressable days, "Upcoming" section
  screens/UpcomingEventDetailScreen.tsx
  ↓
app/(app)/calendar.tsx           unchanged route, extended screen
app/(app)/upcoming/
  new.tsx                        ?date=YYYY-MM-DD, optional
  [id].tsx
  edit/[id].tsx
```

### 3.1 Data model

```ts
// src/services/upcomingEvents/types.ts
export type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

export type UpcomingEvent = {
  id: string
  title: string
  /** `YYYY-MM-DD`. */
  date: string
  /** `HH:mm`, 24-hour, optional — an event need not carry a time. */
  time?: string
  place?: string
  note?: string
  photoUri?: string
  checklist: ChecklistItem[]
}

export type NewUpcomingEvent = Omit<UpcomingEvent, 'id'>
export type UpcomingEventEdit = Partial<NewUpcomingEvent>
export type UpcomingEventErrorCode = 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN'
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: UpcomingEventErrorCode } }

export type UpcomingEventsService = {
  list: () => Promise<Result<UpcomingEvent[]>>
  get: (input: { id: string }) => Promise<Result<UpcomingEvent>>
  create: (input: NewUpcomingEvent) => Promise<Result<UpcomingEvent>>
  update: (input: { id: string } & UpcomingEventEdit) => Promise<Result<UpcomingEvent>>
  delete: (input: { id: string }) => Promise<Result<void>>
  toggleChecklistItem: (input: { id: string; itemId: string }) => Promise<Result<UpcomingEvent>>
}
```

`mock.ts` mirrors `services/memories/mock.ts` exactly: a `Map`, seeded empty
by default, `toggleChecklistItem` flips one item's `done` and returns the
whole event. Every screen follows the same NOT_FOUND-on-a-sample-id fallback
`MemoryDetailScreen` already establishes (apply the change to local state
directly, since a sample record has nothing to write to).

### 3.2 Reused, unmodified

- `DateField` — a typed `mm/dd/yyyy` input with **no** future-date rejection
  (`isValidBirthday`'s check is a separate, opt-in validator no caller here
  uses) — confirmed safe to reuse for a future event date as-is.
- `PhotoPicker` — same round photo well `MemoryForm` already uses for a
  memory's photo. Cosmetically circular for a scene photo either way; this
  keeps the new form visually consistent with the one right next to it in
  the tab bar rather than inventing a second photo-picker shape.
- `usePhotoPick` — identical wiring to `MemoryForm`'s.
- `Overlay` (`align="bottom"`) + `SettingsRow` (with `tint`) — the exact
  bottom-sheet kebab menu pattern just built for `MemoryDetailScreen`, reused
  for the event detail screen's Edit/Remove menu, so the two "detail" screens
  in this app read as one system.
- `theme.colors.accents[0..2]` for the day-tile / checklist accent colours —
  no new tokens.

### 3.3 New primitive: `TimeField`

Nothing in the repo reads or writes a time today. `DateField`'s own pattern
(typed segments, emits `''` while incomplete) is the template:

```
src/design-system/primitives/TimeField.tsx
```

Two 2-digit segments (`hh`, `mm`) plus an AM/PM pill, emitting `HH:mm` in
24-hour form once complete — same shape contract as `DateField`, so a form
composes both the same way.

## 4. Calendar screen changes

`CalendarScreen.tsx` (`/(app)/calendar`) keeps its header, month grid and
"Reminders" section unchanged. Three additions:

1. **Day cells become pressable, checked in this order:**
   - **Carries a key date** (already marked today) → unchanged: no tap
     action. Key dates are not part of this build.
   - **Else, carries one or more upcoming events** → exactly one opens it
     directly (`/(app)/upcoming/[id]`); more than one opens a short
     `Overlay`-based list (title + time each) to choose from.
   - **Else (empty day)** → `router.push({ pathname: '/(app)/upcoming/new',
     params: { date } })`.
2. **New "Upcoming" section**, between "Agenda" and "Reminders": every
   `UpcomingEvent` in the shown month, soonest first, each a row (accent tile
   showing the date, title, time · place) that opens
   `/(app)/upcoming/[id]`. Empty state offers "Add an event" →
   `/(app)/upcoming/new` with no `date` param (form's own date field starts
   blank).
3. Day cells that carry an upcoming event get a second, differently-coloured
   dot (reusing the existing `dot`/`dotOnToday` styles with a second colour
   from `theme.colors.accents`) so the grid visually distinguishes "a key
   date is here" from "an upcoming event is here" without a legend.

## 5. New screens

### 5.1 `EventForm.tsx` (create + edit, shared — mirrors `MemoryForm`)

Title (required) → Date (`DateField`, pre-filled from the tapped day or
today) → Time (`TimeField`, optional) → Place (`Input`, optional) → Note
(`Input multiline`, optional) → Photo (`PhotoPicker`, optional) → Checklist
(`ChecklistEditor`: a list of text rows with a trailing remove ✕, plus an
"Add item" row that appends a new blank one on submit-of-text) → Save /
Cancel.

### 5.2 `UpcomingEventDetailScreen.tsx` (`/(app)/upcoming/[id]`)

Header (title, date · time · place), photo if present, note if present,
`ChecklistView` (each row a checkbox + text; tapping calls
`toggleChecklistItem`), kebab menu → Edit, Remove. No favouriting — this
entity has no favourite concept.

## 6. Home changes

- `MiniCalendar` import, usage, and its own component file removed. Its
  existing test file removed with it.
- The "Upcoming" section's `OccasionCard` rows gain `onPress`, routing to
  `/(app)/upcoming/[id]`.
- A "View all" link (same `captionAction`/`link` treatment as "Your albums")
  routing to `/(app)/calendar`.
- `SAMPLE_HOME.upcomingEvents` (the `{key, icon, label, detail, days}` shape)
  is retired; the Home preview instead reads the soonest two records from
  `SAMPLE_UPCOMING_EVENTS` (via the same "list, fall back to sample when the
  real store is empty" pattern every other screen uses).

## 7. Error handling

Identical shape to `memories`: `NOT_FOUND` on a sample id is treated as
success against local state; `NETWORK`/`UNKNOWN` surface a form-level error
sentence, same copy pattern as `MEMORIES_COPY.add.errors`.

## 8. Testing

New: `upcomingEvents/mock.test.ts` (mirrors `memories/mock.ts`'s own),
`EventForm.test.tsx`, `CalendarScreen.test.tsx` additions for day-tap
routing, `UpcomingEventDetailScreen.test.tsx`. `HomeFlow.test.tsx` loses its
`MiniCalendar` assertions and gains a "presses an Upcoming row, navigates to
the event" one.

## 9. Open items

- No notification/reminder delivery exists anywhere in this app (per
  `docs/build-status.md`'s own "no unpair, export, or delete" section on
  what's out of scope) — this event has a date and a time but nothing rings
  at either. Out of scope here; flagged the same way Watch Together's
  frame-lock badge already is.
- `TimeField` has no Figma frame to read from, like `CalendarScreen` itself —
  built to the same rules the rest of the app's invented-but-tokenised UI
  follows.
