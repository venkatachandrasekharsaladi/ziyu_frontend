import { useEffect } from 'react'
import { AccessibilityInfo, Modal, Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type Props = {
  visible: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  /**
   * Styles the confirm control with `theme.colors.feedback.error` instead of
   * the brand fill. Both callers this exists for today — sign-out, cancel-
   * invitation — are destructive, so this defaults to `true`; it stays an
   * explicit prop rather than a baked-in look so a future non-destructive
   * confirmation (there is none yet) does not inherit the wrong colour by
   * default.
   */
  destructive?: boolean
}

/**
 * A confirm/cancel dialog that actually reaches the user on every platform.
 *
 * `Alert.alert` is the obvious tool for "are you sure?", and it is what both
 * call sites here (`OurSpaceScreen`'s sign-out, `InvitationSentScreen`'s
 * cancel-invitation) used to reach for — but `Alert` has NO implementation in
 * `react-native-web`. On web the call silently did nothing: no dialog, no
 * buttons, and therefore no way to ever reach the destructive action it was
 * gating. That was the entire root cause of "Sign Out doesn't work" on web.
 * `Modal`, unlike `Alert`, IS implemented by `react-native-web` — a real DOM
 * node with `role="dialog"`, a real focus trap, and Escape-to-close — which is
 * why this is built on it instead of reaching for a new dependency.
 *
 * Built once, here, rather than inlined at each call site: both current
 * callers need the exact same shape (a title, a body, a "keep" and a
 * "confirm", one of them destructive), and a second hand-rolled copy of this
 * is how the two quietly drift out of sync with each other's accessibility
 * fixes.
 *
 * `visible` gates whether this even mounts (`if (!visible) return null`)
 * rather than being handed straight through to `Modal`'s own `visible` prop.
 * `Modal` keeps its children in the tree on some platforms/test setups even
 * while hidden — this way the dialog's buttons are provably absent, not just
 * invisible, until it is actually open, which is also what keeps a screen
 * reader (and a test's own queries) from ever finding a "Sign out" button
 * that is not really there yet.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = true,
}: Props) {
  styles.useVariants({ destructive })

  // `Modal`'s own `role="dialog"` and focus trap (react-native-web) get a
  // sighted mouse/keyboard user there for free, but neither that nor iOS
  // VoiceOver reliably reads a just-appeared dialog's text on its own — the
  // same gap `FeedbackBanner` closes for its own transient message, and for
  // the same reason: this is the one call that reliably reaches a screen
  // reader on both platforms the moment the dialog opens.
  useEffect(() => {
    if (!visible) return
    AccessibilityInfo.announceForAccessibility(`${title}. ${body}`)
  }, [visible, title, body])

  if (!visible) return null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={styles.scrim}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      >
        {/* Swallows the tap so pressing the card itself does not bubble to
            the scrim behind it and dismiss the dialog as if the backdrop
            had been hit. */}
        <Pressable
          style={styles.card}
          onPress={() => {}}
          // `alert`, same role `FeedbackBanner` carries for its own message —
          // RN's `AccessibilityRole` union has no `dialog`/`alertdialog`
          // value (that is a web ARIA role, not a native accessibility trait);
          // `react-native-web`'s own `Modal` already puts a real `role=
          // "dialog"` on the surrounding node regardless of what is set here,
          // so this is the closest native-side signal that this card is a
          // message demanding attention, not ordinary page content.
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <Text variant="h3" tone="heading">
            {title}
          </Text>
          <Text variant="body" tone="body">
            {body}
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={styles.keep}
            >
              <Text variant="labelStrong" tone="heading" align="center">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={styles.confirm}
            >
              <Text variant="labelStrong" tone="onPrimary" align="center">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create((theme) => ({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    gap: theme.spacing.md,
    borderRadius: theme.radii.panel,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface.card,
    boxShadow: theme.elevation.card,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  keep: {
    flex: 1,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.card,
  },
  confirm: {
    flex: 1,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.pill,
    variants: {
      // Both branches reach for `theme.colors.*` tokens — never a raw hex —
      // so this stays correct across `lavenderTheme` and `midnightTheme`
      // without this component knowing either palette, same rule
      // `FeedbackBanner` follows for its own tone variant.
      destructive: {
        true: { backgroundColor: theme.colors.feedback.error },
        false: { backgroundColor: theme.colors.brand.primary },
      },
    },
  },
}))
