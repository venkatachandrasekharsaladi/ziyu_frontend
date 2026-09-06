import { Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'
import { clockTime } from '@/modules/module-03-chat/clockTime'
import { PhotoMessage } from '@/modules/module-03-chat/components/PhotoMessage'
import { ReadReceipt } from '@/modules/module-03-chat/components/ReadReceipt'
import { VoiceNotePlayer } from '@/modules/module-03-chat/components/VoiceNotePlayer'
import type { GroupPosition } from '@/modules/module-03-chat/grouping'
import type { Message } from '@/services/chat/types'

type Props = {
  message: Message
  onLongPress?: (id: string) => void
  /**
   * Retries a `failed` send. Optional, not because a failed bubble can skip
   * offering it, but because most callers (every OTHER status) never render
   * the control this guards at all — see the `message.status === 'failed'`
   * check below.
   */
  onRetry?: (id: string) => void
  /**
   * The body of the message THIS one replies to (`message.replyToId`),
   * looked up by the screen — components never import a service, and
   * `ConversationScreen` already holds `messages` to look it up in.
   * Additive alongside the bubble's own body/media, same pattern as a photo
   * caption or a voice transcript below: a reply still shows what it quotes
   * AND what it says, never one instead of the other.
   */
  quotedBody?: string
  /**
   * Where this message sits in its run of messages from the same person, from
   * `grouping.ts`. A bubble cannot work this out alone — the answer depends on
   * its neighbours — so the screen computes it for the whole thread and hands
   * each bubble its own.
   *
   * Defaulted to a run of one, so a bubble rendered on its own (a unit test, a
   * future single-message surface) still draws both outer corners and states
   * its time rather than silently losing its footer.
   */
  group?: GroupPosition
}

const ALONE: GroupPosition = { isFirst: true, isLast: true }

/**
 * One message. Figma `Ziyu` 3390:665, restyled.
 *
 * Two departures from the frame, both deliberate: consecutive messages from one
 * person are drawn as a RUN — closed gaps, a tightened corner on the author's
 * side, one footer at the end — rather than identical rows each restating the
 * time; and reactions overlap the bubble's lower edge instead of occupying a
 * row of their own.
 *
 * The frame also draws a darker vertical strip on the leading edge of incoming
 * bubbles. It is a misaligned overlay, not a design element, and is not
 * reproduced — see the spec, §9.
 */
export function MessageBubble({
  message,
  onLongPress,
  onRetry,
  quotedBody,
  group = ALONE,
}: Props) {
  const mine = message.authorId === 'me'
  const time = clockTime(message.sentAt)

  // Only the last bubble of a run carries the footer, so the thread states a
  // time once per run instead of once per message.
  const showsFooter = group.isLast

  styles.useVariants({
    side: mine ? 'mine' : 'theirs',
    opensRun: group.isFirst,
    closesRun: group.isLast,
  })

  // The whole-bubble accessible name. A message WITH a body already reads
  // fine as its own body text (and stays stable — two different bodies
  // never collide). A bodyless message (a captionless photo/voice note, the
  // normal path for either) used to fall back to the bare literal
  // 'Message' — which is also `Composer`'s own `TextInput` label, so the two
  // collided the moment both were mounted, which `ConversationScreen`
  // always does. Naming the KIND and the time instead fixes both problems
  // at once: it no longer equals the composer's label, and two bodyless
  // bubbles of the same kind no longer equal EACH OTHER either.
  //
  // A grouped bubble folds its time in too. Its footer is not drawn, so
  // without this a screen-reader user would lose what a sighted one keeps:
  // where each message sits in a rapid exchange.
  const kindLabel = message.kind === 'photo' ? 'Photo' : message.kind === 'voice' ? 'Voice' : 'Message'
  const bubbleLabel = !message.body
    ? `${kindLabel} message, sent at ${time}`
    : showsFooter
      ? message.body
      : `${message.body}, sent at ${time}`

  return (
    <View style={styles.row}>
      <Pressable
        onLongPress={() => onLongPress?.(message.id)}
        accessibilityRole="button"
        accessibilityLabel={bubbleLabel}
        style={styles.bubble}
      >
        {/* The quoted message, when this one is a reply. Additive, same as
            the photo/voice branches below: a reply still renders its own
            body/media too, never the quote INSTEAD of it. */}
        {message.replyToId && quotedBody ? (
          <View style={styles.quote}>
            <View style={styles.quoteBar} />
            <Text variant="footnote" tone="onChat" numberOfLines={1}>
              {quotedBody}
            </Text>
          </View>
        ) : null}

        {/* A photo message renders `PhotoMessage` ADDITIVELY alongside its
            body, not instead of it — `PhotoSharePreview`'s caption (`body` on
            a `kind: 'photo'` message, same field `send()` uses for plain
            text) has to actually reach the screen, not just the store. The
            wrapping `View` carries the gap between image and caption:
            `Text` has no `style` prop by design, so that layout can't live
            on the `Text` itself. */}
        {message.kind === 'photo' && message.mediaUri ? (
          <View style={styles.media}>
            <PhotoMessage uri={message.mediaUri} time={time} />
            {message.body ? <Text variant="label" tone="onChat">{message.body}</Text> : null}
          </View>
        ) : message.kind === 'voice' ? (
          // Additive, same as the photo branch above: `body` on a voice
          // message is a transcript (`services/chat/types.ts`'s `Message`),
          // not a caption that replaces the player — a voice note WITH a
          // transcript renders both, not one instead of the other.
          <View style={styles.media}>
            <VoiceNotePlayer durationMs={message.durationMs ?? 0} time={time} />
            {message.body ? <Text variant="label" tone="onChat">{message.body}</Text> : null}
          </View>
        ) : message.body ? (
          // `onChat` — the one ink value contrast-checked against both bubble
          // fills (`Text.tsx`'s tone map). `Text` has no `style` prop by
          // design, so a bespoke bubble colour has to be a tone, not an
          // inline override.
          <Text variant="label" tone="onChat">{message.body}</Text>
        ) : null}
      </Pressable>

      {/* Reactions ride the bubble's lower edge rather than sitting in a row
          beneath it: a reaction belongs TO the message, and a pill that
          overlaps says so without needing a connecting line. The page-coloured
          fill and the hairline are what keep it reading as something resting
          ON the bubble rather than a word inside it. */}
      {message.reactions.length > 0 && (
        <View style={styles.reactions}>
          {message.reactions.map((r) => (
            <Text key={`${r.emoji}-${r.authorId}`} variant="footnote">
              {r.emoji}
            </Text>
          ))}
        </View>
      )}

      {showsFooter && (
        <View style={styles.meta}>
          {/* `countdown` (10/400), not `caption` (11/600): every bubble
              timestamp in the Conversation frame is 10pt regular (nodes
              3390:678, :686, :697, :706, :717). `caption` also uppercases,
              which a clock string has no business doing. */}
          <Text variant="countdown" tone="placeholder">
            {time}
          </Text>
          {mine && <ReadReceipt status={message.status} time={time} />}
          {/* The offer, not just the mark: a `failed` send stays in the thread
              (chatStore never drops it), but until this control existed
              nothing let the user actually act on that — `retry()` was tested
              at the store level and called by nothing. Only rendered for the
              couple's own failed sends: a partner's message never has a send
              to retry. `grouping.ts` stands a failed send alone precisely so
              this control is never buried mid-run. */}
          {mine && message.status === 'failed' && onRetry && (
            <Pressable
              onPress={() => onRetry(message.id)}
              accessibilityRole="button"
              accessibilityLabel="Retry sending"
              style={styles.retry}
            >
              <Text variant="caption" tone="error">Retry</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  row: {
    // 76%, not the frame's 82%: a line running nearly the full width reads as
    // a paragraph, and the shorter measure gives the thread back its two
    // distinct columns on a wide phone.
    maxWidth: '76%',
    variants: {
      side: {
        mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
        theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
      },
      // The gap BELOW this bubble: a hair inside a run, a full step between
      // runs. This is what makes a rapid exchange read as one utterance.
      closesRun: {
        true: { marginBottom: theme.spacing.lg },
        false: { marginBottom: 2 },
      },
    },
  },
  bubble: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.bubble,
    variants: {
      side: {
        mine: {
          backgroundColor: theme.colors.chat.bubbleOutgoing,
          // Only the outgoing bubble lifts. Depth, side and fill then all say
          // the same thing about who spoke, which is what lets the thread stay
          // readable at a glance rather than on inspection.
          boxShadow: theme.elevation.card,
        },
        theirs: { backgroundColor: theme.colors.chat.bubbleIncoming },
      },
      // Declared so the compound variants below have something to match on;
      // the corner work itself is all compound, since which corner tightens
      // depends on the side as well as the position.
      opensRun: { true: {}, false: {} },
      closesRun: { true: {}, false: {} },
    },
    compoundVariants: [
      // The two corners on the author's own side tighten wherever another
      // bubble in the run abuts them. Nothing is drawn: the run's silhouette
      // does the work a tail would, and it survives any bubble width.
      { side: 'mine', opensRun: false, styles: { borderTopRightRadius: theme.radii.bubbleTight } },
      { side: 'mine', closesRun: false, styles: { borderBottomRightRadius: theme.radii.bubbleTight } },
      { side: 'theirs', opensRun: false, styles: { borderTopLeftRadius: theme.radii.bubbleTight } },
      { side: 'theirs', closesRun: false, styles: { borderBottomLeftRadius: theme.radii.bubbleTight } },
    ],
  },
  media: { gap: theme.spacing.sm },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  quoteBar: { width: 2, height: 16, borderRadius: 2, backgroundColor: theme.colors.chat.accent },
  reactions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    // The negative margin is the overlap onto the bubble; the fill and
    // hairline are what stop it reading as part of the bubble.
    marginTop: -theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.page,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  retry: { marginLeft: theme.spacing.xs },
}))
