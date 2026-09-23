import type { Message } from '@/services/chat/types'
import { instantEpochMillis } from '@/utils/dateUtils'

/**
 * How far apart two messages from the same person can be and still read as one
 * breath rather than two remarks.
 *
 * Five minutes, not a smaller number: this is a two-person thread that runs all
 * day, so a reply typed a minute later and one typed four minutes later are the
 * same act of talking. Anything longer starts folding genuinely separate
 * moments — "goodnight" and "morning" — into one silent block.
 */
export const GROUP_WINDOW_MS = 5 * 60_000

/** Where one message sits in its run of messages from the same person. */
export type GroupPosition = {
  /** Draws the run's full outer corner on the author's side. */
  isFirst: boolean
  /** Carries the run's single timestamp, receipt and retry control. */
  isLast: boolean
}

/**
 * Splits a thread into runs — consecutive messages from one author, sent close
 * together — and reports each message's place in its own run.
 *
 * The thread reads as a conversation rather than a list because of this: a run
 * closes its gaps, tightens the corner on the author's side, and states the
 * time once at the end instead of under every bubble. `ConversationScreen`
 * computes this once per render and hands each `MessageBubble` its position;
 * a bubble cannot work this out alone, because the answer depends on its
 * neighbours.
 *
 * A `failed` send always stands alone. It has a status mark and a Retry
 * control to show, and only the last bubble of a run draws those — burying a
 * failure mid-run would hide the one control that resolves it.
 */
export function groupPositions(messages: Message[]): GroupPosition[] {
  const joinsPrevious = (index: number): boolean => {
    const message = messages[index]
    const previous = messages[index - 1]
    if (!previous) return false
    if (message.status === 'failed' || previous.status === 'failed') return false
    if (message.authorId !== previous.authorId) return false

    const sentAt = instantEpochMillis(message.sentAt)
    const previousSentAt = instantEpochMillis(previous.sentAt)
    if (sentAt === null || previousSentAt === null) return false
    const gap = sentAt - previousSentAt
    return gap <= GROUP_WINDOW_MS
  }

  return messages.map((_, index) => ({
    isFirst: !joinsPrevious(index),
    isLast: index === messages.length - 1 || !joinsPrevious(index + 1),
  }))
}
