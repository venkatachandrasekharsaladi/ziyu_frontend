import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { Button } from '@/design-system/primitives/Button'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { formatPrice, type Plan } from '@/modules/module-05-profile/data/mock'

type PlanCardProps = {
  plan: Plan
  /** Shown instead of a price when this is the plan you are on. */
  currentLabel: string
  freeLabel: string
  periodLabel: string
  upgradeLabel: string
}

/**
 * One plan, with what it includes.
 *
 * The action is a `Button` with NO `onPress` handler behind it when the plan is
 * unavailable — rendered `disabled`, which is what puts `accessibilityState`
 * in the tree and what the test asserts on. A pressable upgrade button with an
 * empty handler is the single worst thing this screen could ship: it would
 * read, to a user and to a screen reader, as a live purchase.
 */
export function PlanCard({
  plan,
  currentLabel,
  freeLabel,
  periodLabel,
  upgradeLabel,
}: PlanCardProps) {
  const { theme } = useUnistyles()

  return (
    <Card>
      <View style={styles.card}>
        <Text variant="h3" tone="heading">
          {plan.name}
        </Text>

        <Text variant="countdown" tone="brand">
          {plan.priceMinor === 0 ? freeLabel : formatPrice(plan.priceMinor, plan.currency)}
        </Text>

        {plan.priceMinor > 0 ? (
          <Text variant="footnote" tone="body">
            {periodLabel}
          </Text>
        ) : null}

        <View style={styles.features}>
          {plan.features.map((feature) => (
            <View key={feature} style={styles.feature}>
              <Feather name="check" size={16} color={theme.colors.brand.primary} />

              <Text variant="footnote" tone="body">
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {plan.isCurrent ? (
          <Text variant="footnote" tone="success">
            {currentLabel}
          </Text>
        ) : (
          <Button label={upgradeLabel} onPress={() => {}} disabled={!plan.isAvailable} />
        )}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.sm,
  },
  features: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
}))
