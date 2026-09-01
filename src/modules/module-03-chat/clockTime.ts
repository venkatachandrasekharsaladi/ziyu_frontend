/**
 * Formats an ISO timestamp as a clock reading — `2026-08-30T12:45:00.000Z`
 * -> `12:45 PM` — via `toLocaleTimeString`, the device's own locale and
 * timezone, same as a phone's system clock.
 *
 * One home for what used to be duplicated verbatim in `MessageBubble.tsx`
 * and `ChatHomeScreen.tsx` — this module already shares `clock()`
 * (`VoiceNotePlayer.tsx`, the m:ss duration formatter) across three other
 * files the same way, so a second clock-shaped formatter living twice was
 * never actually justified.
 */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
