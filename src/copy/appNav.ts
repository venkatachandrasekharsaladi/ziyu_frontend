/**
 * The app's bottom navigation, shared by every screen inside `(app)`.
 *
 * FOUR destinations: Home, Memories, Chat, Space.
 *
 * SPACE TOOK PROFILE'S SEAT. The bar is for the four places you go to DO
 * something; Profile is the administrative stop, and it moved to the top-right
 * of `AppHeader` — reachable from every screen, never competing for a seat in
 * a bar that only has four.
 *
 * `BottomNav` still honours `live: false` and renders such a tab disabled
 * rather than hidden — see its own test — but no tab needs that today, so the
 * bar carries no dead stop.
 */
export const APP_NAV = {
  tabs: [
    { key: 'home', label: 'Home', icon: 'home', live: true, href: '/(app)/home' },
    { key: 'memories', label: 'Memories', icon: 'book-open', live: true, href: '/(app)/memories' },
    { key: 'chat', label: 'Chat', icon: 'message-circle', live: true, href: '/(app)/chat' },
    { key: 'space', label: 'Space', icon: 'heart', live: true, href: '/(app)/space' },
  ],
} as const

export type AppTabKey = (typeof APP_NAV.tabs)[number]['key']
