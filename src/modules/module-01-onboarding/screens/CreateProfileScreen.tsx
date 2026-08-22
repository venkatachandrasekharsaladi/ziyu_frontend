import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { FormField } from '@/components/forms/FormField'
import { CREATE_PROFILE_COPY as COPY } from '@/copy/createProfile'
import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'
import { Button } from '@/design-system/primitives/Button'
import { DateField } from '@/design-system/primitives/DateField'
import { Text } from '@/design-system/primitives/Text'
import { AuthScreenLayout } from '@/modules/module-00-auth/components/AuthScreenLayout'
import {
  profileSchema,
  type ProfileValues,
} from '@/modules/module-01-onboarding/state/profileSchema'
import { pairingService } from '@/services/pairing'
import { useRelationshipStore } from '@/state/relationshipStore'

/**
 * M01-S02 — Create Your Profile. Figma 522:598.
 *
 * Only the name is required. The photo well is real but unwired:
 * `expo-image-picker` is scheduled for Phase 6, so `onPick` is a stub and the
 * avatar falls back to initials — which is why the name field feeds it.
 */
export function CreateProfileScreen() {
  const router = useRouter()
  const setProfile = useRelationshipStore((state) => state.setProfile)
  const [formError, setFormError] = useState<string | null>(null)

  const { control, handleSubmit, watch, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', nickname: '', pronouns: '', birthday: '' },
    mode: 'onBlur',
  })

  // Feeds the photo well's initials fallback as the name is typed.
  const name = watch('name')

  const submit = handleSubmit(async (values) => {
    setFormError(null)

    const result = await pairingService.createProfile(values)

    if (!result.ok) {
      setFormError(COPY.errors[result.error.code])
      return
    }

    setProfile(result.value)
    router.push('/(onboarding)/invite')
  })

  // The picker lands with expo-image-picker in Phase 6. Until then the well is
  // pressable and does nothing, rather than pretending to be wired.
  const onPickPhoto = useCallback(() => {}, [])

  return (
    <AuthScreenLayout onBack={router.back}>
      <View style={styles.copy}>
        <Text variant="h1" tone="heading" align="center">
          {COPY.heading}
        </Text>
        <Text variant="body" tone="body" align="center">
          {COPY.lede}
        </Text>
      </View>

      <View style={styles.photo}>
        <PhotoPicker label={COPY.photoLabel} name={name} onPick={onPickPhoto} />
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="name"
          label={COPY.nameLabel}
          placeholder={COPY.namePlaceholder}
          autoComplete="name"
        />

        <FormField
          control={control}
          name="nickname"
          label={COPY.nicknameLabel}
          placeholder={COPY.nicknamePlaceholder}
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

        <FormField
          control={control}
          name="pronouns"
          label={COPY.pronounsLabel}
          placeholder={COPY.pronounsPlaceholder}
        />

        {formError ? (
          <Text variant="footnote" tone="error" align="center">
            {formError}
          </Text>
        ) : null}

        <Button label={COPY.submit} onPress={submit} loading={formState.isSubmitting} />
      </View>
    </AuthScreenLayout>
  )
}

const styles = StyleSheet.create((theme) => ({
  copy: {
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  photo: {
    paddingBottom: theme.spacing.xxxl,
  },
  form: {
    gap: theme.spacing.md,
  },
}))
