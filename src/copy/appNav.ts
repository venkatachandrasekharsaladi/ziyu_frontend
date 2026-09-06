/**
 * The app's bottom navigation, shared by every screen inside `(app)`.
 *
 * Four destinations, all of them built. `BottomNav` still honours `live: false`
 * and renders such a tab disabled rather than hidden — see its own test — but
 * no tab needs that today, so the bar no longer carries a dead stop.
 */
export const APP_NAV = {
  tabs: [
    { key: 'home', label: 'Home', icon: 'home', live: true, href: '/(app)/home' },
    { key: 'memories', label: 'Memories', icon: 'book-open', live: true, href: '/(app)/memories' },
    { key: 'chat', label: 'Chat', icon: 'message-circle', live: true, href: '/(app)/chat' },
    { key: 'profile', label: 'Profile', icon: 'user', live: true, href: '/(app)/profile' },
  ],
} as const

export type AppTabKey = (typeof APP_NAV.tabs)[number]['key']
