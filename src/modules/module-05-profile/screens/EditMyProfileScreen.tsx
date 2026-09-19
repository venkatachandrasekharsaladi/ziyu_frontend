import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { z } from 'zod'

import { SPACE_EDIT_PROFILE_COPY as COPY } from '@/copy/spaceEditProfile'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { SettingsScreenLayout } from '@/design-system/patterns/SettingsScreenLayout'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Input } from '@/design-system/primitives/Input'
import { Text } from '@/design-system/primitives/Text'
import { useRelationshipStore } from '@/state/relationshipStore'
import { useBackTo } from '@/hooks/useBackTo'

const schema = z.object({
  name: z.string().trim().min(1, COPY.nameRequired),
  nickname: z.string().trim().optional(),
  pronouns: z.string().trim().optional(),
  birthday: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

/**
 * M05-S29 — Space → Edit My Profile. Figma `3430:2146`.
 *
 * THE SAME PROFILE `PersonalDetailsScreen` EDITS. Both write
 * `relationshipStore.profile`, and this one carries the fields it does not show
 * — email, phone, the verified flag — straight through on save. Dropping them
 * would make opening this screen a way to silently unverify your own phone
 * number, which is exactly the kind of bug two screens over one record produce.
 *
 * Four fields rather than six, per the frame. The copy file says why.
 *
 * The form stays in `react-hook-form`; only the submitted result reaches the
 * store, which is the rule `ARCHITECTURE.md` sets and every other form here
 * follows.
 */
export function EditMyProfileScreen() {
  const router = useRouter()
  const profile = useRelationshipStore((state) => state.profile)
  const setProfile = useRelationshipStore((state) => state.setProfile)

  const [isSaved, setIsSaved] = useState(false)

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name ?? '',
      nickname: profile?.nickname ?? '',
      pronouns: profile?.pronouns ?? '',
      birthday: profile?.birthday ?? '',
    },
  })

  const back = useBackTo('/(app)/space/identity')

  const onSubmit = useCallback(
    (values: FormValues) => {
      setProfile({
        // Everything this screen does not show, preserved rather than dropped.
        ...profile,
        name: values.name,
        nickname: values.nickname || undefined,
        pronouns: values.pronouns || undefined,
        birthday: values.birthday || undefined,
      })
      setIsSaved(true)
    },
    [profile, setProfile],
  )

  return (
    <SettingsScreenLayout title={COPY.barTitle} onBack={back}>
      <View style={styles.header}>
        <Text variant="h1" tone="heading">
          {COPY.title}
        </Text>
        <Text variant="body" tone="body">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.photo}>
        <PhotoPicker
          label={COPY.photo}
          name={profile?.name ?? ''}
          uri={profile?.photoUri}
          onPick={() => {
            // The picker itself belongs to Settings → Personal Details, which
            // owns `expo-image-picker`. Until this screen has its own, tapping
            // here sends you to the screen that can actually change the photo
            // rather than doing nothing.
            router.push('/(app)/settings/personal-details')
          }}
        />
      </View>

      <View style={styles.form}>
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
          name="pronouns"
          render={({ field }) => (
            <Input
              label={COPY.pronounsLabel}
              placeholder={COPY.pronounsPlaceholder}
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
      </View>

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
  header: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxl,
  },
  photo: {
    alignItems: 'center',
    paddingBottom: theme.spacing.huge,
  },
  form: {
    gap: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
}))
