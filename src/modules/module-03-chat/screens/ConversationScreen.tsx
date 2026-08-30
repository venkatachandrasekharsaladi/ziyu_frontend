import { useRouter, type Href } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { ChatHeader } from '@/modules/module-03-chat/components/ChatHeader'
import { Composer } from '@/modules/module-03-chat/components/Composer'
import { DayDivider } from '@/modules/module-03-chat/components/DayDivider'
import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import { MessageContextMenu } from '@/modules/module-03-chat/components/MessageContextMenu'
import { ReactionBar } from '@/modules/module-03-chat/components/ReactionBar'
import { TypingIndicator } from '@/modules/module-03-chat/components/TypingIndicator'
import { useChatStore } from '@/modules/module-03-chat/state/chatStore'

/** Chat — Conversation. Figma `Ziyu` 3390:665 / 3390:521 / 3390:585. */
export function ConversationScreen() {
  const s = useChatStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scroll = useRef<ScrollView>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    void s.load()
  }, [s])

  const replyBody = s.replyTarget
    ? s.messages.find((m) => m.id === s.replyTarget)?.body
    : undefined

  return (
    <View style={styles.page}>
      <ThemedStatusBar />

      {/* No `AppScreenLayout` here — that chrome is the generic wordmark
          header + bottom tab bar, and this screen draws its own header
          (avatar, name, presence, calls) instead. It still needs the top
          inset for itself, since nothing above it is providing one. */}
      <View style={{ paddingTop: insets.top }}>
        <ChatHeader
          onBack={router.back}
          // Cast: `typedRoutes` builds its `Href` union from files that exist
          // under `src/app/`, and Task 12 is what creates
          // `chat/moment/{video,voice}.tsx` — until it lands, this is the one
          // spot in the codebase pointing at a route the router doesn't know
          // about yet. Drop the cast once Task 12 merges.
          onVideoCall={() => router.push('/(app)/chat/moment/video' as Href)}
          onVoiceCall={() => router.push('/(app)/chat/moment/voice' as Href)}
        />
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        <DayDivider label="TODAY, 5:42 PM" />
        {s.messages.map((m) => (
          <MessageBubble key={m.id} message={m} onLongPress={s.selectMessage} />
        ))}
        {s.isPartnerTyping && <TypingIndicator />}
      </ScrollView>

      <Composer
        value={s.draft}
        onChangeText={s.setDraft}
        // Trimmed here, not in the store: `Composer` hands over the raw
        // field value and `send()` does not trim, so a message typed with
        // leading/trailing space would otherwise ship padded.
        onSend={(v) => { void s.send(v.trim()) }}
        onAttach={s.openAttachments}
        onRecord={s.startRecording}
        replyTo={replyBody}
        onCancelReply={s.cancelReply}
      />

      {/* The long-press overlay: a full-screen scrim (dismiss-on-tap-outside)
          with the reaction bar and context menu floating above it. Rendered
          last so it draws over the composer too — the same stacking order
          the frame gives it. */}
      {s.selectedMessageId && (
        <Pressable
          style={styles.scrim}
          onPress={s.clearSelection}
          accessibilityLabel="Dismiss message actions"
        >
          <View style={styles.overlay}>
            <ReactionBar
              onReact={(emoji) => { void s.react(s.selectedMessageId!, emoji) }}
              // No design for what "more reactions" opens yet (an emoji
              // keyboard / full picker) — left a no-op rather than guessing,
              // same call `ChatHeader`'s reserved `onMore` makes.
              onMore={() => {}}
            />
            <MessageContextMenu
              onReply={() => s.startReply(s.selectedMessageId!)}
              // There is no clipboard package in this project (checked:
              // nothing matching "clipboard" in package.json) and adding one
              // is outside this task's scope. Real "Copy" needs that
              // dependency; until then this only dismisses the overlay, same
              // as tapping the scrim, so it does not silently pretend to
              // have copied anything.
              onCopy={s.clearSelection}
              onSaveMemory={() => { void s.saveAsMemory(s.selectedMessageId!) }}
            />
          </View>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  page: { flex: 1, backgroundColor: theme.colors.surface.page },
  thread: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.surface.scrim },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
}))
