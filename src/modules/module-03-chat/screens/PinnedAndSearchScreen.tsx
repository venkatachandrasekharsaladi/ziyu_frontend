import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

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
 * `chatService.search` is called directly here, not through a store action.
 * `chatStore` never grew a `search` action (see its own file) and the task
 * brief calling for this screen explicitly allows a screen to reach the
 * service straight — unlike a component, which never may.
 */
export function PinnedAndSearchScreen() {
  const router = useRouter()
  const messages = useChatStore((state) => state.messages)
  const load = useChatStore((state) => state.load)
  const loaded = useRef(false)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Message[] | null>(null)

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
    let cancelled = false

    // An empty query has nothing to show — not even "No messages found",
    // which is reserved for a query that came back with zero hits. Landing
    // on this screen with the field untouched should read as "search
    // something", not "we searched and found nothing."
    if (!query.trim()) {
      setResults(null)
      return
    }

    async function run() {
      const found = await chatService.search(query)
      if (!cancelled) setResults(found)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [query])

  const pinned = messages.filter((m) => m.pinned)

  return (
    <AppScreenLayout activeTab="chat" onBack={router.back}>
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

      {results !== null && (
        <View style={styles.section}>
          {results.length === 0 ? (
            <Text variant="footnote" tone="body" align="center">
              {COPY.search.empty}
            </Text>
          ) : (
            <>
              <Text variant="caption" tone="muted">
                {COPY.search.resultsLabel}
              </Text>
              <View style={styles.list}>
                {results.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </View>
            </>
          )}
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
