import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { z } from 'zod'

import { SETTINGS_PERSONAL_DETAILS_COPY as COPY } from '@/copy/settingsPersonalDetails'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { SectionPanel } from '@/design-system/patterns/SectionPanel'
import { SettingsRow } from '@/design-system/patterns/SettingsRow'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * E.164-ish: a leading `+`, then 8 to 15 digits, spaces allowed for readability.
 *
 * Deliberately loose. Strict per-country validation needs a library this app
 * does not have, and a settings screen is the wrong place to start rejecting
 * real numbers from countries nobody on the team thought about. What this
 * catches is the actual mistake: a number typed with no country code, which
 * cannot be sent to at all.
 */
const PHONE = /^\+[\d\s]{8,18}$/

const schema = z.object({
  name: z.string().trim().min(1, COPY.nameRequired),
  nickname: z.string().trim().optional(),
  birthday: z.string().trim().optional(),
  pronouns: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || PHONE.test(value), COPY.phoneInvalid),
})

type FormValues = z.infer<typeof schema>

/**
 * M05-S02 — Settings → Personal Details.
 *
 * The same fields `CreateProfileScreen` collects, in a settings frame — this is
 * where you change what you told the app during onboarding. The form stays in
 * `react-hook-form`; only the submitted result reaches `relationshipStore`,
 * which is the rule `ARCHITECTURE.md` sets and `CreateProfileScreen` follows.
 *
 * EMAIL IS READ-ONLY. It is the sign-in credential, and changing it is a
 * security operation with its own confirmation — it belongs on Security &
 * Sessions, not in a form that saves five other things at once.
 *
 * EDITING THE PHONE CLEARS `phoneVerified`. A number that has changed has not
 * been proven, and leaving the badge behind would let someone type any number
 * and keep a verified mark that was earned by a different one.
 */
export function PersonalDetailsScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const setProfile = useRelationshipStore((state) => state.setProfile)
  const [isSaved, setIsSaved] = useState(false)

  const { control, handleSubmit, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      nickname: profile?.nickname ?? '',
      birthday: profile?.birthday ?? '',
      pronouns: profile?.pronouns ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const phone = watch('phone')
  const isVerified = Boolean(profile?.phoneVerified) && phone === profile?.phone

  const goBack = useCallback(() => router.back(), [router])
  const goToVerify = useCallback(() => router.push('/(app)/settings/verify-phone'), [router])

  const onSubmit = useCallback(
    (values: FormValues) => {
      const phoneChanged = values.phone !== profile?.phone

      setProfile({
        ...profile,
        name: values.name,
        nickname: values.nickname || undefined,
        birthday: values.birthday || undefined,
        pronouns: values.pronouns || undefined,
        phone: values.phone || undefined,
        // A changed number has not been proven. See the header comment.
        phoneVerified: phoneChanged ? false : profile?.phoneVerified,
      })

      setIsSaved(true)
    },
    [profile, setProfile],
  )

  return (
    <SettingsScreenLayout title={COPY.title} lede={COPY.lede} onBack={goBack}>
      <View style={styles.photo}>
        <PhotoPicker
          label={COPY.photoLabel}
          name={profile?.name ?? ''}
          uri={profile?.photoUri}
          onPick={() => {
            // Picking is Module 03's `PhotoPicker` behaviour; nothing to add here.
          }}
        />
      </View>

      <SectionPanel title={COPY.aboutGroup}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              label={COPY.nameLabel}
              placeholder={COPY.namePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={control}
          name="nickname"
          render={({ field }) => (
            <Input
              label={COPY.nicknameLabel}
              placeholder={COPY.nicknamePlaceholder}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          control={control}
          name="birthday"
          render={({ field, fieldState }) => (
            <DateField
              label={COPY.birthdayLabel}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="pronouns"
          render={({ field }) => (
            <Input
              label={COPY.pronounsLabel}
              placeholder={COPY.pronounsPlaceholder}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
            />
          )}
        />
      </SectionPanel>

      <SectionPanel title={COPY.contactGroup}>
        <Input
          label={COPY.emailLabel}
          value="ana@example.com"
          onChangeText={() => {}}
          editable={false}
        />
        <Text variant="footnote" tone="body">
          {COPY.emailLocked}
        </Text>

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Input
              label={COPY.phoneLabel}
              placeholder={COPY.phonePlaceholder}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          )}
        />

        <Text variant="footnote" tone="body">
          {COPY.phoneHelp}
        </Text>

        <SettingsRow
          icon={isVerified ? 'check-circle' : 'alert-circle'}
          label={COPY.verifyAction}
          detail={isVerified ? COPY.phoneVerified : COPY.phoneUnverified}
          onPress={goToVerify}
        />
      </SectionPanel>

      <Button label={COPY.save} onPress={handleSubmit(onSubmit)} />

      {isSaved ? (
        <Text variant="footnote" tone="success">
          {COPY.saved}
        </Text>
      ) : null}
    </SettingsScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  photo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
}))
