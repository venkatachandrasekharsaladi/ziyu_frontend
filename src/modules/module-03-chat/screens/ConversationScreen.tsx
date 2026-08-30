import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { ThemedStatusBar } from '@/design-system/patterns/ThemedStatusBar'
import { AttachmentSheet } from '@/modules/module-03-chat/components/AttachmentSheet'
import { ChatHeader } from '@/modules/module-03-chat/components/ChatHeader'
import { Composer } from '@/modules/module-03-chat/components/Composer'
import { DayDivider } from '@/modules/module-03-chat/components/DayDivider'
import { MessageBubble } from '@/modules/module-03-chat/components/MessageBubble'
import { MessageContextMenu } from '@/modules/module-03-chat/components/MessageContextMenu'
import { PhotoSharePreview } from '@/modules/module-03-chat/components/PhotoSharePreview'
import { PinnedBanner } from '@/modules/module-03-chat/components/PinnedBanner'
import { ReactionBar } from '@/modules/module-03-chat/components/ReactionBar'
import { TypingIndicator } from '@/modules/module-03-chat/components/TypingIndicator'
import { VoiceNoteRecorder } from '@/modules/module-03-chat/components/VoiceNoteRecorder'
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

  // The banner shows exactly one pinned message even when several are
  // pinned — the FIRST one in thread order, i.e. the oldest pin still
  // sitting in `messages`. The rest of the pins are one tap away, on the
  // screen this banner itself opens.
  const firstPinned = s.messages.find((m) => m.pinned)

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
          onVideoCall={() => router.push('/(app)/chat/moment/video')}
          onVoiceCall={() => router.push('/(app)/chat/moment/voice')}
        />
      </View>

      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.thread}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
      >
        {/* Only ever the top-of-thread banner from Task 11's brief — rendered
            inside the `ScrollView` (not floating above it) so it scrolls
            away with the rest of the thread rather than pinning itself over
            the header, which nothing in the frame draws. */}
        {firstPinned && (
          <PinnedBanner
            message={firstPinned}
            onPress={() => router.push('/(app)/chat/search')}
          />
        )}
        <DayDivider label="TODAY, 5:42 PM" />
        {s.messages.map((m) => (
          <MessageBubble key={m.id} message={m} onLongPress={s.selectMessage} />
        ))}
        {s.isPartnerTyping && <TypingIndicator />}
      </ScrollView>

      {/* One or the other, never both: `VoiceNoteRecorder` replaces the
          composer bar entirely while recording, same as the frame draws it
          (Figma 3390:164), rather than floating over it. The placeholder uri
          is staged here, not inside the recorder — components never import a
          service, and `sendVoice` (not this screen) is what already handles
          the optimistic bubble and its failure path; this screen only turns
          "recording stopped with N ms elapsed" into that one call. */}
      {s.isRecording ? (
        <VoiceNoteRecorder
          onCancel={s.stopRecording}
          onSend={(durationMs) => { void s.sendVoice('file://voice-note.m4a', durationMs) }}
        />
      ) : (
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
      )}

      {/* The long-press overlay: a full-screen scrim (dismiss-on-tap-outside)
          with the reaction bar and context menu floating above it. Rendered
          last so it draws over the composer too — the same stacking order
          the frame gives it. */}
      {s.selectedMessageId && (
        <Pressable
          style={styles.scrim}
          onPress={s.clearSelection}
          accessibilityRole="button"
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

      {/* The attachment sheet's own scrim — mutually exclusive with the
          selection overlay above (`openAttachments`/`selectMessage` already
          close one another in the store), so only ever one of the two is on
          screen. `justifyContent: 'flex-end'` is what pins the sheet to the
          bottom rather than the overlay's own centred layout. */}
      {s.attachmentSheetOpen && (
        <Pressable
          style={styles.scrim}
          onPress={s.closeAttachments}
          accessibilityRole="button"
          accessibilityLabel="Dismiss attachments"
        >
          <View style={styles.attachmentLayer}>
            <AttachmentSheet
              // Real photo picking (`expo-image-picker`) is out of scope for
              // this mock, same as `PhotoPicker.tsx` elsewhere in the app —
              // this stages a placeholder uri so the rest of the send flow
              // (preview → send → optimistic bubble) is real and testable
              // today. Swap this for the real picker when it lands.
              onPickPhoto={() => s.stagePhoto('file://sample.jpg')}
              onClose={s.closeAttachments}
            />
          </View>
        </Pressable>
      )}

      {/* Full-screen in its own right (`PhotoSharePreview` covers the screen
          itself), so it renders as a plain sibling rather than inside a
          styled wrapper here. */}
      {s.pendingPhotoUri && (
        <PhotoSharePreview
          uri={s.pendingPhotoUri}
          onSend={(uri, caption) => { void s.sendPhoto(uri, caption) }}
          onCancel={s.clearPhoto}
        />
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
  attachmentLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
}))
