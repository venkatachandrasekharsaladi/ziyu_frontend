import { useEffect } from 'react'
import { AccessibilityInfo, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

export type FeedbackTone = 'success' | 'error'

type Props = {
  tone: FeedbackTone
  message: string
  /** Called once, whether the timer elapsed or the caller tore this down early. */
  onDismiss: () => void
  /** How long the message stays up before it dismisses itself. */
  durationMs?: number
}

/** How long a message stays up before `onDismiss` fires on its own. */
const DEFAULT_DURATION_MS = 3000

/**
 * The one transient-message primitive in this app. Built for Chat's Save
 * Memory action (a failed save used to leave the context menu open with no
 * sign anything went wrong — a successful one was just as silent), but it
 * takes no chat-specific prop: any screen with a pass/fail moment to report
 * can reuse it.
 *
 * Self-dismissing by design — the caller hands over a message and gets
 * `onDismiss` back exactly once, `durationMs` later, with no queue and no
 * provider to mount. A second message while one is already showing is the
 * caller's problem to sequence (e.g. remounting this with a fresh `key` so
 * the timer and the announcement both restart) — this component only ever
 * knows about the one message it was given.
 *
 * Announced, not merely drawn: `accessibilityLiveRegion` only speaks on
 * Android (it is listed under RN's `AccessibilityPropsAndroid`, and iOS
 * VoiceOver ignores it), so `AccessibilityInfo.announceForAccessibility` is
 * the one call here that reliably reaches both platforms' screen readers the
 * moment this mounts. `accessibilityRole="alert"` is kept alongside it as the
 * semantic hint iOS itself looks for on a role-queried element, not as a
 * substitute for the announcement.
 */
export function FeedbackBanner({ tone, message, onDismiss, durationMs = DEFAULT_DURATION_MS }: Props) {
  styles.useVariants({ tone })

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message)

    const timer = setTimeout(onDismiss, durationMs)
    // Cleared on unmount, same reasoning as `VoiceNoteRecorder`'s own ticking
    // interval: `onDismiss` belongs to the caller, and this component cannot
    // assume it is still mounted by the time a stale timer fires — the
    // caller may have already torn it down some other way (navigating away
    // mid-message, say).
    return () => clearTimeout(timer)
    // Runs once per mount. `message`/`onDismiss`/`durationMs` are the props
    // that define THIS message; if any changed mid-life the caller would
    // have remounted with a new `key` (see the file header), not rerendered
    // this instance in place — restarting the clock (or re-announcing) on
    // every parent render would be wrong either way.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View
      style={styles.banner}
      // `accessible` is set explicitly, not left to RN's own default: a
      // plain `View` (unlike `Pressable`, which sets this for you) is NOT
      // implicitly an accessibility element just because it carries
      // `accessibilityRole`/`accessibilityLiveRegion` — without this, this
      // node would be invisible to a role- or live-region-based query, on
      // both a real screen reader and RNTL's own `getByRole`.
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
    >
      <Text variant="labelStrong" tone={tone}>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    alignSelf: 'center',
    maxWidth: '90%',
    marginTop: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.field,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
    variants: {
      tone: {
        // Both branches reach for `theme.colors.feedback.*` — never a raw
        // hex — so the border stays correct across `lavenderTheme` and
        // `midnightTheme` without this component knowing either palette.
        success: { borderColor: theme.colors.feedback.success },
        error: { borderColor: theme.colors.feedback.error },
      },
    },
  },
}))
