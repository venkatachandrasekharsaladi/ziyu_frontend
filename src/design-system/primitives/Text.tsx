import type { ReactNode } from 'react'
import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export type TextVariant = 'h1' | 'wordmark' | 'body' | 'label' | 'caption'
export type TextTone = 'heading' | 'body' | 'brand' | 'link' | 'onPrimary'

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
        wordmark: theme.typography.wordmark,
        body: theme.typography.body,
        label: theme.typography.label,
        caption: theme.typography.caption,
      },
      tone: {
        heading: { color: theme.colors.text.heading },
        body: { color: theme.colors.text.body },
        brand: { color: theme.colors.brand.primary },
        link: { color: theme.colors.brand.link },
        onPrimary: { color: theme.colors.text.onPrimary },
      },
      align: {
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
      },
    },
  },
}))
