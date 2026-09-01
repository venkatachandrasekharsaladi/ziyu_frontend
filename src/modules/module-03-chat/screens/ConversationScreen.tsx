import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'

import { FeedbackBanner, type FeedbackTone } from '@/components/feedback/FeedbackBanner'
import { CHAT_COPY } from '@/copy/chat'
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

  /**
   * Save Memory's pass/fail report. Screen-local state, not the store's —
   * `chatStore` resolves `saveAsMemory` with a plain boolean and moves on;
   * turning that into a message the user actually sees is exactly the kind
   * of wiring a screen owns, not the store. `key` is bumped on every attempt
   * (not left at a fixed value) so pressing "Save Memory" again while a
   * banner from the last attempt is still showing remounts `FeedbackBanner`
   * with a fresh identity — its self-dismiss timer restarts and the new
   * message gets its own screen-reader announcement, instead of the second
   * result being silently absorbed by a component that already fired both.
   */
  const [feedback, setFeedback] = useState<{ key: number; tone: FeedbackTone; message: string } | null>(null)

  const handleSaveMemory = () => {
    const id = s.selectedMessageId
    if (!id) return
    void (async () => {
      const ok = await s.saveAsMemory(id)
      setFeedback({
        key: Date.now(),
        tone: ok ? 'success' : 'error',
        message: ok ? CHAT_COPY.feedback.saveMemorySuccess : CHAT_COPY.feedback.saveMemoryError,
      })
    })()
  }

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
          isPartnerTyping={s.isPartnerTyping}
        />
      </View>

      {/* Rendered in normal flow, not floating, so a shown/dismissed message
          nudges the thread below it rather than needing its own absolute
          layer — the simplest option for something this transient, and this
          screen already gives every OTHER overlay (scrim, attachment sheet)
          its own dedicated layer only because those genuinely must cover the
          thread; this one does not. */}
      {feedback && (
        <FeedbackBanner
          key={feedback.key}
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

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
          <MessageBubble
            key={m.id}
            message={m}
            onLongPress={s.selectMessage}
            onRetry={s.retry}
            // The quoted message's own body, looked up here (not inside
            // `MessageBubble` — components never import a service, and this
            // screen already holds `messages`) so a reply bubble can render
            // what it quotes alongside what it says.
            quotedBody={
              m.replyToId ? s.messages.find((x) => x.id === m.replyToId)?.body : undefined
            }
          />
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
              // keyboard / full picker). Left unset rather than guessing at
              // one — `ReactionBar` renders its own control `disabled` when
              // `onMore` is omitted, same call `ChatHeader` makes for its
              // reserved "More options", instead of a control that looks
              // pressable and quietly does nothing.
            />
            <MessageContextMenu
              onReply={() => s.startReply(s.selectedMessageId!)}
              // There is no clipboard package in this project (checked:
              // nothing matching "clipboard" in package.json) and adding one
              // is outside this task's scope. `onCopy` left unset rather than
              // aliased to `clearSelection` — `MessageContextMenu` renders
              // "Copy" `disabled` when it has no handler, so the row honestly
              // reads as unavailable instead of pretending a tap dismissed it
              // on purpose.
              onSaveMemory={handleSaveMemory}
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
              // The recorder and the store action behind it (`startRecording`)
              // already exist — `Composer`'s own mic button already reaches
              // for the exact same one. The sheet's tile had just never been
              // wired to it.
              onVoiceNote={() => { s.closeAttachments(); s.startRecording() }}
              // No dedicated picker screen for "attach an existing memory" —
              // the bridge the other direction (`saveAsMemory`, this screen's
              // own `handleSaveMemory`) exists, but nothing turns a memory
              // back into a message yet. Opening the Memories module itself
              // is the honest middle ground: it goes somewhere real instead
              // of just closing the sheet.
              onMemory={() => { s.closeAttachments(); router.push('/(app)/memories') }}
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
