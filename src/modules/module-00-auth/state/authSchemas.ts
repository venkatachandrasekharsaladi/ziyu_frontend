import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address')

/**
 * The password rules, as data.
 *
 * M00-S03 renders these as a live checklist. Deriving both the checklist and the
 * schema from one list is what stops the two disagreeing — a user being told
 * every rule passes while the form refuses to submit.
 */
export const PASSWORD_RULES = [
  { id: 'length', label: '8+ characters long', test: (v: string) => v.length >= 8 },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

const strongPassword = PASSWORD_RULES.reduce<z.ZodType<string>>(
  (schema, rule) => schema.refine(rule.test, { message: rule.label }),
  z.string(),
)

export const signInSchema = z.object({
  email,
  // No strength rules here: rejecting a weak password a user already has is a
  // dead end.
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z.object({
  email,
  password: strongPassword,
})

export const emailOnlySchema = z.object({ email })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>
