# Deferred and rejected ideas

[← Product docs index](../PRODUCT.md)

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
