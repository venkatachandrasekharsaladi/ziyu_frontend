import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { useBackTo } from '@/hooks/useBackTo'
import { CHAT_COPY as COPY } from '@/copy/chat'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'
import { chatService } from '@/services/chat'
import type { Message } from '@/services/chat/types'

/**
 * Pinned & Search. Figma `Ziyu` 3390:60.
 *
 * Two independent lists share one screen, not one filtered list: "Pinned"
 * always reflects the thread's own `pinned` flags (read straight off
 * `chatStore`, the same source `PinnedBanner` and every bubble's long-press
 * menu already write through), while search is a query against the FULL
 * history, pinned or not — pinning a message doesn't make it the only thing
 * findable, and searching doesn't touch what's pinned.
 *
 * The one place they are NOT independent: rendering. A message that is both
 * pinned and a search hit is still ONE message, and it already has a home in
 * the Pinned section above — the Results list below excludes anything
 * `pinned` so nothing on screen ever renders the same bubble twice. This
 * does not change what "found" means: `results` (and whether the raw search
 * came back empty) is computed from the UNFILTERED search response, so
 * "No messages found" only ever appears when the search itself found
 * nothing — never when every hit happened to already be pinned. Get that
 * backwards and a query matching only a pinned message shows "No messages
 * found" directly under the very message it means.
 *
 * `chatService.search` is called directly here, not through a store action.
 * `chatStore` never grew a `search` action (see its own file) and the task
 * brief calling for this screen explicitly allows a screen to reach the
 * service straight — unlike a component, which never may.
 */
export function PinnedAndSearchScreen() {
  // Opened directly there is no stack to pop, so Back falls back to the
  // thread these pins and results come from.
  const onBack = useBackTo('/(app)/chat/conversation')
  const messages = useChatStore((state) => state.messages)
  const load = useChatStore((state) => state.load)
  const loaded = useRef(false)

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Message[] | null>(null)

  useEffect(() => {
    // Same guard as `ChatHomeScreen`/`ConversationScreen`: Strict Mode runs
    // this effect twice, and `load()` itself already dedupes its
    // subscription, but there is still no reason to issue `listMessages()`
    // twice for one mount.
    if (loaded.current) return
    loaded.current = true
    void load()
  }, [load])

  useEffect(() => {
    // An empty query has nothing to search — that case is handled below, at
    // render, not here (see `results`). This effect's only job is the actual
    // async search, so there is no synchronous `setState` left for React to
    // warn about on the empty-query path.
    if (!query.trim()) return

    let cancelled = false

    async function run() {
      const found = await chatService.search(query)
      if (!cancelled) setSearchResults(found)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [query])

  // An empty/whitespace query has nothing to show — not even "No messages
  // found", which is reserved for a query that came back with zero hits.
  // Landing on this screen with the field untouched should read as "search
  // something", not "we searched and found nothing." Derived here, at
  // render, rather than synced into state by the effect above: whether
  // there is anything to show is entirely a function of `query` and
  // `searchResults` already in hand, so there is nothing to synchronise.
  const results = query.trim() ? searchResults : null

  const pinned = messages.filter((m) => m.pinned)
  const pinnedIds = new Set(pinned.map((m) => m.id))
  // What the Results LIST shows — excludes anything already sitting in the
  // Pinned section above, so no message ever renders twice on this screen.
  // Deliberately NOT what decides whether "No messages found" appears: that
  // reads `results` itself (see the doc comment above).
  const visibleResults = results?.filter((m) => !pinnedIds.has(m.id)) ?? null

  return (
    <AppScreenLayout activeTab="chat" onBack={onBack}>
      <Input
        label={COPY.search.label}
        value={query}
        onChangeText={setQuery}
        placeholder={COPY.search.placeholder}
      />

      {pinned.length > 0 && (
        <View style={styles.section}>
          <Text variant="caption" tone="muted">
            {COPY.search.pinnedLabel}
          </Text>
          <View style={styles.list}>
            {pinned.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </View>
        </View>
      )}

      {results !== null && results.length === 0 && (
        <View style={styles.section}>
          <Text variant="footnote" tone="body" align="center">
            {COPY.search.empty}
          </Text>
        </View>
      )}

      {/* Nothing rendered at all when the search found hits but every one
          of them is already pinned above — not the empty state (the search
          did not come back empty) and not an empty results list either. */}
      {visibleResults !== null && visibleResults.length > 0 && (
        <View style={styles.section}>
          <Text variant="caption" tone="muted">
            {COPY.search.resultsLabel}
          </Text>
          <View style={styles.list}>
            {visibleResults.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </View>
        </View>
      )}
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.md,
  },
}))
