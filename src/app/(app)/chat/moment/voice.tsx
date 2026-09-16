/**
 * ROUTE  /chat/moment/voice   —   Voice Moment — the in-call screen (visual shell, no audio)
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-03-chat/screens/VoiceMomentScreen.tsx
 *   Every word on screen  src/copy/chat.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 *
 * New here? Read CODEBASE.md at the repo root — it explains this layout,
 * what an ID like M05-S10 means, and how to find any screen in seconds.
 */
export { VoiceMomentScreen as default } from '@/modules/module-03-chat/screens/VoiceMomentScreen'
