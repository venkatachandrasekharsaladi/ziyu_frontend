import { z } from 'zod'

import { isValidBirthday } from '@/design-system/primitives/DateField'

/**
 * M01-S02 Create Your Profile.
 *
 * Only the name is required. Photo, nickname, birthday and pronouns are all
 * optional — the canonical Figma frame marks photo and birthday as such, and
 * nickname and pronouns are carried across from the earlier frame per D31.
 *
 * Birthday validation reuses `isValidBirthday` so the schema and the field
 * cannot disagree about what a real date is.
 */
export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  nickname: z.string().trim().optional(),
  pronouns: z.string().trim().optional(),
  birthday: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
        if (!match) return false

        return isValidBirthday(Number(match[1]), Number(match[2]), Number(match[3]))
      },
      { message: 'Enter a real date' },
    ),
  photoUri: z.string().optional(),
})

export type ProfileValues = z.infer<typeof profileSchema>
