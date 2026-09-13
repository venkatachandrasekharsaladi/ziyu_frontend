import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'

import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { SETTINGS_DELETE_COPY as COPY } from '@/copy/settingsDeleteAccount'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Text } from '@/design-system/primitives/Text'
import { CodeGate } from '@/modules/module-05-profile/components/CodeGate'
import { DeleteProgress } from '@/modules/module-05-profile/components/DeleteProgress'
import { DeleteReason } from '@/modules/module-05-profile/components/DeleteReason'
import { DeleteWarning } from '@/modules/module-05-profile/components/DeleteWarning'
import { PasswordGate } from '@/modules/module-05-profile/components/PasswordGate'
import { authService } from '@/services/auth'
import { usePreferencesStore } from '@/state/preferencesStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useSpaceStore } from '@/state/spaceStore'

type Step = 'warning' | 'reason' | 'password' | 'phone' | 'email' | 'done'

const STEP_NUMBER: Record<Exclude<Step, 'done'>, number> = {
  warning: 1,
  reason: 2,
  password: 3,
  phone: 4,
  email: 5,
}

const TOTAL_STEPS = 5

/**
 * M05-S24 — Settings → Delete Account.
 *
 * ONE ROUTE, FIVE STEPS IN COMPONENT STATE. Pushing each gate as its own route
 * would put the back gesture in charge of the flow — swiping back from the
 * email gate would land on the phone gate with a code already spent, and
 * swiping back twice would land on a password gate that had already passed.
 * Holding the step here means BACK ALWAYS MEANS ONE THING: leave, delete
 * nothing.
 *
 * THE CODES ARE SESSION-BOUND. They live in this component, so unmounting —
 * backing out, being interrupted — drops them, and starting again starts from
 * the warning. That is the behaviour a real server-side flow would have and it
 * costs nothing to honour here.
 *
 * WHY IT DOES NOT CALL A DELETE SERVICE: there is no backend and no
 * `authService.deleteAccount`. Inventing one would be the only place in this
 * cluster where the UI reports something that did not happen. What it does
 * instead is exactly what a real deletion leaves behind on the device — every
 * store cleared, signed out, back at Welcome — so the day a real call exists it
 * goes in `destroy` and nothing else moves.
 */
export function DeleteAccountScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const resetRelationship = useRelationshipStore((state) => state.reset)
  const resetSpace = useSpaceStore((state) => state.reset)
  const resetPreferences = usePreferencesStore((state) => state.reset)

  const [step, setStep] = useState<Step>('warning')
  const [isAsking, setIsAsking] = useState(false)

  const leave = useCallback(() => router.back(), [router])
  const goToExport = useCallback(() => router.push('/(app)/settings/data'), [router])
  const goToPhoneSetup = useCallback(
    () => router.push('/(app)/settings/personal-details'),
    [router],
  )

  const destroy = useCallback(async () => {
    setIsAsking(false)

    try {
      await authService.signOut()
    } catch {
      // Swallowed on purpose, exactly as on the hub's sign-out: there is
      // nothing to tell someone whose call failed, because everything on this
      // device is being cleared either way, and a message here would imply it
      // was not.
    }

    // Cleared unconditionally and BEFORE navigating — the welcome screen must
    // never be able to read a deleted account's partner, space or preferences.
    resetRelationship()
    resetSpace()
    resetPreferences()
    router.replace('/(auth)/welcome')
  }, [resetPreferences, resetRelationship, resetSpace, router])

  const confirmDestroy = useCallback(() => {
    void destroy()
  }, [destroy])

  return (
    <SettingsScreenLayout title={COPY.title} onBack={leave}>
      {step !== 'done' ? <DeleteProgress step={STEP_NUMBER[step]} total={TOTAL_STEPS} /> : null}

      {step === 'warning' ? (
        <DeleteWarning onContinue={() => setStep('reason')} onExport={goToExport} />
      ) : null}

      {step === 'reason' ? (
        <DeleteReason
          onChoose={() => setStep('password')}
          onSkip={() => setStep('password')}
        />
      ) : null}

      {step === 'password' ? <PasswordGate onPassed={() => setStep('phone')} /> : null}

      {step === 'phone' ? (
        profile?.phone ? (
          <>
            <Text variant="h2" tone="heading">
              {COPY.phoneHeading}
            </Text>
            <Text variant="body" tone="body">
              {COPY.phoneLede}
            </Text>

            <CodeGate
              label={COPY.phoneCodeLabel}
              sentTo={`${COPY.sentToPrefix} ${profile.phone}`}
              submitLabel={COPY.verify}
              resendLabel={COPY.resend}
              resendPendingLabel={(seconds) => `${COPY.resendIn} ${seconds}s`}
              errorMessage={COPY.phoneWrong}
              onVerified={() => setStep('email')}
            />
          </>
        ) : (
          <SectionPanel title={COPY.phoneHeading}>
            <Text variant="body" tone="body">
              {COPY.phoneNoNumber}
            </Text>

            <SettingsRow icon="phone" label={COPY.phoneAddAction} onPress={goToPhoneSetup} />
          </SectionPanel>
        )
      ) : null}

      {step === 'email' ? (
        <>
          <Text variant="h2" tone="heading">
            {COPY.emailHeading}
          </Text>
          <Text variant="body" tone="body">
            {COPY.emailLede}
          </Text>

          <CodeGate
            label={COPY.emailCodeLabel}
            sentTo={COPY.emailLede}
            submitLabel={COPY.verify}
            resendLabel={COPY.resend}
            resendPendingLabel={(seconds) => `${COPY.resendIn} ${seconds}s`}
            errorMessage={COPY.emailWrong}
            onVerified={() => setIsAsking(true)}
          />
        </>
      ) : null}

      <ConfirmDialog
        visible={isAsking}
        title={COPY.finalTitle}
        body={COPY.finalBody}
        cancelLabel={COPY.finalCancel}
        confirmLabel={COPY.finalConfirm}
        onCancel={() => setIsAsking(false)}
        onConfirm={confirmDestroy}
      />
    </SettingsScreenLayout>
  )
}
