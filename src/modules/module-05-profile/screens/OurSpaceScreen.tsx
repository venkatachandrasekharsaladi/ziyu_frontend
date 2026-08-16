import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { OUR_SPACE_COPY as COPY } from '@/copy/ourSpace'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Text } from '@/design-system/primitives/Text'
import { authService } from '@/services/auth'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M05-S01 — Our Space. Stitch screen e6c82bcb.
 *
 * A deliberate stub. Stitch draws this hub in full — the couple's names, a
 * days-together counter, the private-space note, and rows through to Personalize,
 * Our Identity and Space Preferences — and none of those destinations exist yet.
 * What is here is the design's heading and lede plus the one control the design
 * does not have: signing out.
 *
 * It earns its place now because sign-out had nowhere to live. The `profile` tab
 * had been sitting disabled in `APP_NAV` waiting for exactly this screen; the
 * rest of the hub grows into it, and the sign-out stays where it is.
 *
 * Sign-out is the only action on this screen a user will not want to hit by
 * accident, so it is `outline` rather than `primary` and it asks first.
 */
export function OurSpaceScreen() {
  const router = useRouter()
  const reset = useRelationshipStore((state) => state.reset)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = useCallback(async () => {
    setIsSigningOut(true)

    try {
      await authService.signOut()
    } catch {
      // Swallowed on purpose. There is nothing to tell someone whose logout
      // call failed, because they are signed out locally either way, and a
      // message here would imply they are not. The transport logs it with its
      // requestId.
    }

    // Cleared whichever way the call went, and cleared BEFORE navigating: the
    // welcome screen must not be able to read a previous couple's partner.
    reset()
    router.replace('/(auth)/welcome')
  }, [reset, router])

  const confirm = useCallback(() => {
    Alert.alert(COPY.confirmTitle, COPY.confirmBody, [
      { text: COPY.confirmKeep, style: 'cancel' },
      { text: COPY.confirmSignOut, style: 'destructive', onPress: () => void signOut() },
    ])
  }, [signOut])

  return (
    <AppScreenLayout activeTab="profile">
      <View style={styles.copy}>
        <Text variant="h2" tone="heading">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body">
          {COPY.lede}
        </Text>
      </View>

      <Button
        label={COPY.signOut}
        onPress={confirm}
        variant="outline"
        loading={isSigningOut}
      />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
}))
