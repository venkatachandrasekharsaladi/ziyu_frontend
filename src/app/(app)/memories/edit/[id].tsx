/**
 * ROUTE  /memories/edit/[id]   —   Edit Memory
 *
 * WHAT THIS FILE IS: a route, not a screen. Its job is to say "this URL
 * shows that component" and nothing more — no layout, no colours, no text.
 * The file path under src/app/ IS the URL; the (brackets) are grouping
 * folders and do not appear in it. See `(auth)/welcome.tsx` for the rule.
 *
 * TO CHANGE WHAT YOU SEE, EDIT THESE — not this file:
 *
 *   Layout & components   src/modules/module-03-memories/screens/EditMemoryScreen.tsx
 *   Every word on screen  src/copy/memories.ts
 *   Colours, sizes, gaps  src/design-system/tokens/  (never a hex here)
 */
export { EditMemoryScreen as default } from '@/modules/module-03-memories/screens/EditMemoryScreen'
