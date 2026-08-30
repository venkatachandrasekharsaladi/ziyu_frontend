import type { ReactNode } from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'wordmark'
  | 'body'
  | 'label'
  | 'labelStrong'
  | 'footnote'
  | 'caption'
  | 'captionAction'
  | 'tabLabel'
  | 'countdown'

export type TextTone =
  | 'heading'
  | 'body'
  | 'placeholder'
  | 'muted'
  | 'brand'
  | 'link'
  | 'error'
  | 'success'
  | 'onPrimary'
  /**
   * Ink on top of a chat bubble or its accent pill — `theme.colors.chat.bubbleInk`.
   *
   * Not `heading` or `body`: those are only contrast-checked against
   * `surface.page`. Chat text sits on `bubbleOutgoing` / `bubbleIncoming` /
   * `accentSoft` instead, and `bubbleInk` is the one value `chatContrast.test.ts`
   * checks against all of them. Added for Module 03 Chat's message bubble.
   */
  | 'onChat'

type TextProps = Omit<RNTextProps, 'style'> & {
  variant?: TextVariant
  tone?: TextTone
  align?: 'left' | 'center'
  children: ReactNode
}

/**
 * The only way to render type in this app.
 *
 * There is deliberately NO `style` prop. That omission is the mechanism that
 * keeps raw visual values out of screens, per the rule in `src/app/index.tsx`.
 * If a screen needs a look this component cannot express, the fix is a new
 * variant here — not an inline override there.
 */
export function Text({
  variant = 'body',
  tone = 'body',
  align = 'left',
  children,
  ...rest
}: TextProps) {
  styles.useVariants({ variant, tone, align })

  return (
    <RNText style={styles.text} {...rest}>
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: {
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        h3: theme.typography.h3,
        wordmark: theme.typography.wordmark,
        body: theme.typography.body,
        label: theme.typography.label,
        labelStrong: theme.typography.labelStrong,
        footnote: theme.typography.footnote,
        caption: theme.typography.caption,
        captionAction: theme.typography.captionAction,
        tabLabel: theme.typography.tabLabel,
        countdown: theme.typography.countdown,
      },
      tone: {
        heading: { color: theme.colors.text.heading },
        body: { color: theme.colors.text.body },
        placeholder: { color: theme.colors.text.placeholder },
        muted: { color: theme.colors.text.muted },
        brand: { color: theme.colors.brand.primary },
        link: { color: theme.colors.brand.link },
        error: { color: theme.colors.feedback.error },
        success: { color: theme.colors.feedback.success },
        onPrimary: { color: theme.colors.text.onPrimary },
        onChat: { color: theme.colors.chat.bubbleInk },
      },
      align: {
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
      },
    },
  },
}))
