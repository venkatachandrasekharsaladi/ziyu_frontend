import { z } from 'zod'

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address')

/**
 * The password rules, as data.
 *
 * M00-S03 renders these as a live checklist and M00-S06 as a strength meter.
 * Deriving the checklist, the meter and the schema from one list is what stops
 * them disagreeing — a user being told every rule passes while the form refuses
 * to submit.
 *
 * These ARE the contract's policy, verbatim from `schemas/VALIDATION.md`:
 * 8–128 characters, at least one letter and one number. The client must be
 * neither stricter nor looser. It was previously stricter — it demanded a
 * special character the contract does not ask for, so it rejected passwords the
 * server accepts — and simultaneously looser, since it checked neither a letter
 * nor the maximum, so two classes of password reached the server only to come
 * back `422 WEAK_PASSWORD`.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: '8–128 characters',
    test: (v: string) => v.length >= 8 && v.length <= 128,
  },
  { id: 'letter', label: 'One letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
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

/**
 * M00-S06 Reset Password.
 *
 * `confirmPassword` is a client-side guard only — `POST /auth/password/reset`
 * takes `{token, newPassword}` and knows nothing about it. It exists because a
 * mistyped password the user cannot see is a lockout they have to run the whole
 * reset flow again to escape.
 *
 * The match check is a `superRefine` guarded on the password being valid, so a
 * weak-but-matching pair reports only the real problem. Reporting a mismatch
 * that is not there sends someone hunting for a typo they never made.
 */
export const resetPasswordSchema = z
  .object({
    newPassword: strongPassword,
    confirmPassword: z.string(),
  })
  .superRefine((values, context) => {
    const passwordIsValid = strongPassword.safeParse(values.newPassword).success

    if (!passwordIsValid) return

    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        // On the confirm field, not the form: the user must know which box to fix.
        path: ['confirmPassword'],
        message: 'Both passwords need to match.',
      })
    }
  })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
