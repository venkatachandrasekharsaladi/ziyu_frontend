/**
 * ROUTE  /space/reminders   —   M05-S27 · Space → Gentle Reminders
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 *
 * REACHED FROM: Space -> Space Preferences.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-05-profile/screens/GentleRemindersScreen.tsx
 *   Every word on screen  src/copy/spaceReminders.ts
 *   What it remembers     src/state/storyStore.ts  (keyDates)
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { GentleRemindersScreen as default } from '@/modules/module-05-profile/screens/GentleRemindersScreen'
