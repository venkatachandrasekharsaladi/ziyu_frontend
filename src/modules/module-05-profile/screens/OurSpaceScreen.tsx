import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { APPEARANCE_COPY } from '@/copy/appearance'
import { OUR_SPACE_COPY as COPY } from '@/copy/ourSpace'
import { AppScreenLayout } from '@/design-system/patterns/AppScreenLayout'
import { ThemeToggle } from '@/design-system/patterns/ThemeToggle'
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
 * accident, so it is `outline` rather than `primary` and it asks first — via
 * `ConfirmDialog`, not `Alert.alert`. `Alert` has no implementation in
 * react-native-web, so on web the confirmation never appeared and this whole
 * control was unreachable: the sign-out logic below was always correct, it
 * just had no way to ever run. See `ConfirmDialog`'s own header comment.
 */
export function OurSpaceScreen() {
  const router = useRouter()
  const reset = useRelationshipStore((state) => state.reset)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false)

  const signOut = useCallback(async () => {
    setIsSigningOut(true)

    try {
      await authService.signOut()
    } catch {
      // Swallowed on purpose. There is nothing to tell someone whose logout
      // call failed, because they are signed out locally either way, and a
      // message here would imply they are not. The transport logs it with its
      // requestId.
    } finally {
      // Cleared unconditionally, whether the call resolved or rejected.
      // `router.replace` below unmounts this screen in the common case, but
      // if navigation is ever interrupted — a guard blocks it, the call
      // hangs — the button must not be left stuck mid-spin with no way back.
      setIsSigningOut(false)
    }

    // Cleared whichever way the call went, and cleared BEFORE navigating: the
    // welcome screen must not be able to read a previous couple's partner.
    reset()
    router.replace('/(auth)/welcome')
  }, [reset, router])

  const askToSignOut = useCallback(() => setIsConfirmingSignOut(true), [])
  const keepSignedIn = useCallback(() => setIsConfirmingSignOut(false), [])
  const confirmSignOut = useCallback(() => {
    setIsConfirmingSignOut(false)
    void signOut()
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

      {/*
        Appearance lands here because this is the settings hub and the toggle had
        nowhere else to live — the same reason sign-out is on this stub. Both are
        one line to move once the rest of the hub exists.
      */}
      <View style={styles.section}>
        <Text variant="h3" tone="heading">
          {APPEARANCE_COPY.label}
        </Text>

        <ThemeToggle />
      </View>

      <Button
        label={COPY.signOut}
        onPress={askToSignOut}
        variant="outline"
        loading={isSigningOut}
      />

      <ConfirmDialog
        visible={isConfirmingSignOut}
        title={COPY.confirmTitle}
        body={COPY.confirmBody}
        cancelLabel={COPY.confirmKeep}
        confirmLabel={COPY.confirmSignOut}
        onCancel={keepSignedIn}
        onConfirm={confirmSignOut}
      />
    </AppScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.md,
  },
}))
