import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { SETTINGS_VERIFY_PHONE_COPY as COPY } from '@/copy/settingsVerifyPhone'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { CodeGate } from '@/modules/module-05-profile/components/CodeGate'
import { useRelationshipStore } from '@/state/relationshipStore'
import { isPhoneNumber } from '@/utils/phone'

const schema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, COPY.numberRequired)
    .refine(isPhoneNumber, COPY.numberInvalid),
})

type FormValues = z.infer<typeof schema>

/**
 * M05-S03 — Settings → Verify Phone.
 *
 * Reached from Personal Details, and reused by the delete flow's phone gate in
 * spirit — the shared part is `CodeGate`, not this screen.
 *
 * WITH NO NUMBER ON FILE, THIS SCREEN ASKS FOR ONE. Sending someone to
 * Personal Details to type a phone number, then back here to verify it, is two
 * screens and a six-field form for one field — and the delete flow's phone gate
 * needs exactly this ask-then-verify shape anyway. The route to Personal
 * Details stays offered underneath, because that is where a number already
 * saved gets corrected.
 *
 * The number is saved to the profile UNVERIFIED at the moment the code is
 * requested, and `phoneVerified` is written only after `CodeGate` accepts. The
 * order matters: a number that has been typed is not a number that has been
 * proven, and anything that reads the profile in between has to see that.
 *
 * The phone rule is `@/utils/phone` — the same one Personal Details validates
 * against, so the two screens cannot disagree about what a phone number is.
 */
export function VerifyPhoneScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const setProfile = useRelationshipStore((state) => state.setProfile)
  const [isVerified, setIsVerified] = useState(Boolean(profile?.phoneVerified))

  const goBack = useCallback(() => router.back(), [router])
  const goToDetails = useCallback(() => router.push('/(app)/settings/personal-details'), [router])

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  })

  const onVerified = useCallback(() => {
    if (!profile) return

    setProfile({ ...profile, phoneVerified: true })
    setIsVerified(true)
  }, [profile, setProfile])

  const onRequestCode = useCallback(
    ({ phone }: FormValues) => {
      setProfile({ ...(profile ?? { name: '' }), phone: phone.trim(), phoneVerified: false })
    },
    [profile, setProfile],
  )

  if (!profile?.phone) {
    return (
      <SettingsScreenLayout title={COPY.title} lede={COPY.numberLede} onBack={goBack}>
        <SectionPanel title={COPY.numberHeading}>
          <Text variant="footnote" tone="body">
            {COPY.noNumber}
          </Text>

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Input
                label={COPY.numberLabel}
                placeholder={COPY.numberPlaceholder}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            )}
          />

          <Button label={COPY.sendCode} onPress={handleSubmit(onRequestCode)} />

          <SettingsRow icon="user" label={COPY.goToDetails} onPress={goToDetails} />
        </SectionPanel>
      </SettingsScreenLayout>
    )
  }

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      {isVerified ? (
        <Text variant="body" tone="success">
          {COPY.verified}
        </Text>
      ) : (
        <CodeGate
          label={COPY.codeLabel}
          sentTo={`${COPY.sentToPrefix} ${profile.phone}`}
          submitLabel={COPY.submit}
          resendLabel={COPY.resend}
          resendPendingLabel={(seconds) => `${COPY.resendIn} ${seconds}s`}
          errorMessage={COPY.wrongCode}
          onVerified={onVerified}
        />
      )}
    </SettingsScreenLayout>
  )
}
