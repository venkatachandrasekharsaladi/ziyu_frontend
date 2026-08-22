import { Feather } from '@expo/vector-icons'
import { View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

import { CREATE_ACCOUNT_COPY } from '@/copy/createAccount'
import { Card } from '@/design-system/primitives/Card'
import { Text } from '@/design-system/primitives/Text'
import { PASSWORD_RULES } from '@/modules/module-00-auth/state/authSchemas'

type PasswordRequirementsProps = {
  value: string
}

/**
 * M00-S03's live rule checklist. Figma 522:183.
 *
 * Rules come from `PASSWORD_RULES`, the same list the submit schema is built
 * from, so the checklist cannot tell a user every rule passes while the form
 * refuses to submit.
 *
 * Figma renders every row in #CAC4D4, which scores 1.70:1 on the card — the
 * fourth WCAG failure in the design set, and on the rows a user most needs to
 * read. Unmet rows use `placeholder` ink (5.01:1) and met rows `success`
 * (5.29:1). The icon also changes SHAPE, so state is never carried by colour
 * alone. See spec D20.3.
 *
 * Rows update on change rather than on blur — the point is live feedback.
 */
export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const { theme } = useUnistyles()

  return (
    <Card>
      <Text variant="caption" tone="body">
        {CREATE_ACCOUNT_COPY.requirementsTitle}
      </Text>

      <View style={styles.list}>
        {PASSWORD_RULES.map((rule) => {
          const isMet = rule.test(value)

          return (
            <View
              key={rule.id}
              style={styles.row}
              accessibilityLabel={`${rule.label}: ${isMet ? 'met' : 'not met'}`}
              testID={isMet ? 'rule-met' : 'rule-unmet'}
            >
              <Feather
                name={isMet ? 'check-circle' : 'circle'}
                size={14}
                color={isMet ? theme.colors.feedback.success : theme.colors.text.placeholder}
              />
              <Text variant="footnote" tone={isMet ? 'success' : 'placeholder'}>
                {rule.label}
              </Text>
            </View>
          )
        })}
      </View>
    </Card>
  )
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}))
