import { useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { CONFIRM_PARTNER_COPY as COPY } from '@/copy/confirmPartner'
import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Avatar } from '@/design-system/primitives/Avatar'
import { Button } from '@/design-system/primitives/Button'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import { useRelationshipStore } from '@/state/relationshipStore'

const AVATAR_SIZE = 96

/**
 * M01-S09 — Is This Your Person. Figma 522:764.
 *
 * The last stop before the relationship is committed, so it shows both people
 * side by side rather than asking the user to confirm a name they read on the
 * previous screen.
 */
export function ConfirmPartnerScreen() {
  const router = useRouter()
  const partner = useRelationshipStore((state) => state.partner)
  const profile = useRelationshipStore((state) => state.profile)

  const goToEnterCode = useCallback(() => router.replace('/(onboarding)/enter-code'), [router])

  useEffect(() => {
    if (!partner) goToEnterCode()
  }, [partner, goToEnterCode])

  const goToConnecting = useCallback(() => router.push('/(onboarding)/connecting'), [router])

  if (!partner) return null

  return (
    <AuthScreenLayout onBack={router.back} centred>
      <StatusScreen
        illustration={
          <View style={styles.pair}>
            {/*
              The redeem branch never passes through profile creation, so this
              side often has no name. `youLabel` keeps the circle labelled
              rather than rendering an anonymous one that reads as loading.
            */}
            <Avatar
              size={AVATAR_SIZE}
              name={profile?.name || COPY.youLabel}
              uri={profile?.photoUri}
            />
            <Avatar size={AVATAR_SIZE} name={partner.name} uri={partner.photoUri} />
          </View>
        }
        heading={COPY.heading}
        lede={COPY.lede}
        actions={
          <>
            <Button label={COPY.confirm} onPress={goToConnecting} />
            <Button label={COPY.cancel} onPress={goToEnterCode} variant="link" />
          </>
        }
      />
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  pair: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
}))
