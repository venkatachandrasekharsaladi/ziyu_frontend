import type { ReactNode } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import type { TextInputProps } from 'react-native'

import { Input } from '@/design-system/primitives/Input'

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  secure?: boolean
  labelTrailing?: ReactNode
  keyboardType?: TextInputProps['keyboardType']
  autoComplete?: TextInputProps['autoComplete']
}

/**
 * The ONLY file that imports both `react-hook-form` and a design-system
 * primitive.
 *
 * `Input` takes plain props so it stays usable anywhere and the form library can
 * be replaced without touching a primitive (spec D22).
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secure,
  labelTrailing,
  keyboardType,
  autoComplete,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={field.value ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          error={fieldState.error?.message}
          secure={secure}
          labelTrailing={labelTrailing}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
        />
      )}
    />
  )
}
