import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Avatar } from '@/design-system/primitives/Avatar'
import { CountUp } from '@/design-system/primitives/CountUp'
import { Text } from '@/design-system/primitives/Text'

type CoupleHeaderProps = {
  name: string
  partnerName?: string
  photoUri?: string | null
  partnerPhotoUri?: string | null
  spaceName?: string | null
  /** Omitted when the pair has not recorded a start date. */
  daysTogether?: number
  daysLabel: string
}

/**
 * The couple, at the top of the settings list.
 *
 * This is the one part of the settings screen that is not administrative, and
 * it is first on purpose: opening the Profile tab should show you the two of
 * you before it shows you a list of switches.
 *
 * The two avatars OVERLAP. Side by side they read as two users of an app;
 * overlapping they read as a pair, which is what this product is.
 */
export function CoupleHeader({
  name,
  partnerName,
  photoUri,
  partnerPhotoUri,
  spaceName,
  daysTogether,
  daysLabel,
}: CoupleHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.avatars}>
        <Avatar name={name} uri={photoUri} size={64} />

        {partnerName ? (
          <View style={styles.trailing}>
            <Avatar name={partnerName} uri={partnerPhotoUri} size={64} ring />
          </View>
        ) : null}
      </View>

      <Text variant="h2" tone="heading" align="center">
        {partnerName ? `${name} & ${partnerName}` : name}
      </Text>

      {spaceName ? (
        <Text variant="footnote" tone="body" align="center">
          {spaceName}
        </Text>
      ) : null}

      {typeof daysTogether === 'number' ? (
        <CountUp
          value={daysTogether}
          variant="countdown"
          tone="brand"
          align="center"
          format={(n) => `${n.toLocaleString()} ${daysLabel}`}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  header: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  /** Pulls the second avatar over the first, so the pair reads as one unit. */
  trailing: {
    marginLeft: -theme.spacing.lg,
  },
}))
