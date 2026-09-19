/**
 * The app's bottom navigation, shared by every screen inside `(app)`.
 *
 * FIVE destinations, matching the bar drawn on the About Page board
 * (`BDMFuyYb2I2ZMmaEz5gBAZ`, frame 3430:2429): Home, Memories, Chat, Timeline,
 * Space.
 *
 * Two changes came from that board:
 *
 *   PROFILE BECAME SPACE. The last tab used to be "Profile" and opened the
 *   settings list. Every frame on the board draws it as "Space" and opens a
 *   hub about the two of you, so the key, the label and the destination all
 *   moved together. Settings is still reachable — the hub's header keeps the
 *   cog — but it is no longer what the tab IS.
 *
 *   TIMELINE ARRIVED UNBUILT. The board draws a fourth stop between Chat and
 *   Space. `module-04-timeline` has no screens yet, so it ships `live: false`
 *   and `BottomNav` renders it disabled rather than hidden — the rule that
 *   module's own doc comment already sets out. The bar keeps the shape the
 *   design asks for instead of growing a stop later.
 */
export const APP_NAV = {
  tabs: [
    { key: 'home', label: 'Home', icon: 'home', live: true, href: '/(app)/home' },
    { key: 'memories', label: 'Memories', icon: 'book-open', live: true, href: '/(app)/memories' },
    { key: 'chat', label: 'Chat', icon: 'message-circle', live: true, href: '/(app)/chat' },
    { key: 'timeline', label: 'Timeline', icon: 'clock', live: false, href: '/(app)/timeline' },
    { key: 'space', label: 'Space', icon: 'user', live: true, href: '/(app)/space' },
  ],
} as const

export type AppTabKey = (typeof APP_NAV.tabs)[number]['key']
