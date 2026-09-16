import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CHAT_COPY as COPY } from '@/copy/chat'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { PressableScale } from '@/design-system/patterns/PressableScale'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { clockTime } from '@/modules/module-03-chat/clockTime'
import { truncateWords } from '@/modules/module-03-chat/truncate'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'

/** How much of the newest message's body the row preview shows. */
const PREVIEW_MAX = 34

/**
 * M03-S?? — Chat Home. Figma `Ziyu` 3390:764.
 *
 * This is the tab's front door: until this screen exists the chat tab has
 * nowhere to point, which is why `appNav.ts`'s `chat` entry carried
 * `live: false`. One conversation row — this app has exactly one thread, the
 * same one `ChatHeader` and the mock service both assume — opens
 * `ConversationScreen`. Below it, the two cards the frame draws but nothing
 * in the 16-task plan wires up yet: "Drafted note" and the AI card render as
 * static copy, not buttons to nowhere.
 *
 * The preview is built from the newest message in the store, the same
 * `chatStore` the conversation screen reads — not a second, parallel source
 * of truth for "what did we last say to each other."
 */
export function ChatHomeScreen() {
  const router = useRouter()
  const messages = useChatStore((state) => state.messages)
  const load = useChatStore((state) => state.load)
  const loaded = useRef(false)

  useEffect(() => {
    // Guards the effect itself, not just the store: `load()` already dedupes
    // its own subscription (see `chatStore.ts`), but Strict Mode still runs
    // this effect twice on mount, and a second call would refetch and
    // re-`set` messages for no reason.
    if (loaded.current) return
    loaded.current = true
    void load()
  }, [load])

  const openConversation = useCallback(
    () => router.push('/(app)/chat/conversation'),
    [router],
  )

  // Newest is the last entry: both the seed and every store action
  // (`send`, `sendPhoto`, an incoming `message` event) append to the end of
  // `messages`, never the front.
  const newest = messages[messages.length - 1]

  return (
    <AppScreenLayout activeTab="chat">
      <View style={styles.head}>
        <Text variant="h2" tone="heading">
          {COPY.home.heading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.home.subtitle}
        </Text>
      </View>

      {/* Nothing to show until `load()` resolves — the row is skipped rather
          than rendered against an empty `newest`, same reasoning as
          `MemoriesHomeScreen`'s own loading branch: the chrome stays steady,
          nothing flashes an empty card. */}
      {newest ? (
        <PressableScale
          onPress={openConversation}
          accessibilityLabel={`Open conversation with ${COPY.home.coupleName}`}
        >
          <Card>
            <View style={styles.row}>
              {/* The two avatars overlap rather than sit apart: this row is
                  one couple, not two contacts, and the ring is what keeps the
                  second one legible where it crosses the first. */}
              <View style={styles.avatarPair}>
                <Avatar name="Chandu" size={40} />
                <View style={styles.avatarOverlap}>
                  <Avatar name="Sweatcha" size={40} />
                </View>
              </View>

              <View style={styles.body}>
                <View style={styles.identityRow}>
                  <Text variant="labelStrong" tone="heading">
                    {COPY.home.coupleName}
                  </Text>
                  <View style={styles.spacer} />
                  <Text variant="caption" tone="muted">
                    {clockTime(newest.sentAt)}
                  </Text>
                </View>

                {/* `numberOfLines` keeps a long, un-truncated fallback (a
                    message body longer than `PREVIEW_MAX` that still passed
                    `truncateWords` unchanged for some reason) from wrapping
                    the row onto a second line the design never draws. */}
                <Text
                  variant="footnote"
                  tone="body"
                  numberOfLines={1}
                  accessibilityLabel="Conversation preview"
                >
                  {truncateWords(newest.body ?? '', PREVIEW_MAX)}
                </Text>
              </View>
            </View>
          </Card>
        </PressableScale>
      ) : null}

      <Card>
        <Text variant="caption" tone="muted">
          {COPY.cards.draftedNote.eyebrow}
        </Text>
        <Text variant="body" tone="body">
          {COPY.cards.draftedNote.body}
        </Text>
      </Card>

      <Card>
        <Text variant="caption" tone="muted">
          {COPY.cards.assistant.eyebrow}
        </Text>
        <Text variant="body" tone="body">
          {COPY.cards.assistant.body}
        </Text>
      </Card>
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  head: {
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    marginLeft: -theme.spacing.md,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    borderColor: theme.colors.surface.card,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
}))
