# M01 Pairing Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build M01-S01…S09 and S11 — the flow that turns two authenticated individuals into one relationship — against `docs/superpowers/specs/2026-08-14-pairing-cluster-design.md`.

**Architecture:** Unchanged from Cluster 1. `design-system/` holds primitives and patterns with no application dependency; `components/forms/` bridges `react-hook-form`; `modules/module-01-onboarding/` holds screens and schemas; `src/app/(onboarding)/` route files are thin re-exports. A mock `PairingService` sits behind a typed boundary beside `AuthService`, and relationship state lives in a Zustand store.

**Tech Stack:** Expo SDK 57 · React Native 0.86 · React 19.2 · expo-router · react-native-unistyles 3.3 · react-hook-form + zod · zustand · @expo/vector-icons · jest-expo + @testing-library/react-native

**Staging:** Stage A is Tasks 1–6 (components, service, state) and ends with everything the screens need. Stage B is Tasks 7–11 (the ten screens).

---

## Global Constraints

Everything from the Cluster 1 plan still applies. Repeated here because they bind every task:

- **Never type "LoveOS" literally** — read `BRAND.name` from `@/config/brand`.
- **`Text` has no `style` prop** and must not gain one.
- **Nothing outside `themes/` imports `tokens/`.**
- **One control height: 56pt** (`theme.control.height`) — buttons, social buttons, inputs, and now code boxes.
- **Field borders are `border.field`; dividers and outlines are `border.subtle`.**
- **Error state never relies on colour alone** — a message is always rendered.
- **Contrast floor is AA (4.5:1).** The contrast suite is the guard.
- **This cluster adds NO new colour tokens** (spec §5). Every drawn value folds into the existing set. If you find yourself adding a hex, stop — it is a normalisation you have not applied.
- **Commit after every task**, staging explicit paths. Never `git add -A` — the working tree contains the user's own `README.md` and `TECH.md` changes that must not be swept into these commits.

### Testing conventions — carried from Cluster 1

1. **`render` is async** in RNTL v14. Every call awaited, every test callback `async`. Without the await, `screen` is a stub and queries throw "`render` function has not been called".
2. **The Unistyles Jest mock strips `variants`**, so variant-driven style values are not assertable. Test behaviour, structure and accessibility; verify visuals on device or in the browser.
3. **For variant-only changes the red gate is `npx tsc --noEmit`, not `npm test`** — Jest passes before the implementation exists.
4. **Screens need `renderScreen`** from `@/test/renderScreen`, which supplies `SafeAreaProvider` metrics. Plain `render` throws "No safe area value available".
5. **Icon glyph names must be verified** against the glyph map — an unknown name renders nothing and only warns, so tests pass regardless. `apple1` was caught this way.
6. **Text queries that match twice fail.** The brand name appears in the header *and* body copy; rule labels appear in a checklist *and* a field error. Assert on the specific element.

---

## File Structure

**Created**

| File | Responsibility |
|---|---|
| `src/design-system/primitives/Avatar.tsx` | Photo or initials, circular |
| `src/design-system/primitives/CodeDisplay.tsx` | Renders a pairing code, `L8V · 7QK` |
| `src/design-system/primitives/CodeInput.tsx` | Six segmented boxes, one backing input |
| `src/design-system/primitives/DateField.tsx` | `mm / dd / yyyy`, validated |
| `src/design-system/patterns/PhotoPicker.tsx` | Circular photo well |
| `src/design-system/patterns/StatusScreen.tsx` | Centred illustration + copy + actions |
| `src/services/pairing/{types,mock,index}.ts` | The pairing boundary |
| `src/state/relationshipStore.ts` | Zustand relationship state |
| `src/modules/module-01-onboarding/state/profileSchema.ts` | zod schema for M01-S02 |
| `src/modules/module-01-onboarding/screens/*.tsx` | Ten screens |
| `src/copy/*.ts` | One copy module per screen |
| `src/app/(onboarding)/*.tsx` | Ten routes + `_layout.tsx` |

**Modified**

| File | Change |
|---|---|
| `src/modules/module-00-auth/screens/VerifyEmailScreen.tsx` | Continue now routes to `(onboarding)/setup` |
| `src/design-system/themes/__tests__/theme.contrast.test.ts` | Extend with the §5 pairs |

---

# STAGE A — Components, service, state

## Task 1: Avatar

**Files:** Create `src/design-system/primitives/Avatar.tsx`; Test `src/design-system/primitives/__tests__/Avatar.test.tsx`

**Interfaces:** Produces `Avatar` with props `{ size?: number, uri?: string | null, name: string, ring?: boolean }`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react-native'

import { Avatar } from '@/design-system/primitives/Avatar'

describe('Avatar', () => {
  it('shows initials when there is no photo', async () => {
    await render(<Avatar name="Chandu Reddy" />)

    expect(screen.getByText('CR')).toBeTruthy()
  })

  it('takes a single initial from a single name', async () => {
    await render(<Avatar name="Chandu" />)

    expect(screen.getByText('C')).toBeTruthy()
  })

  it('shows the photo when given one, and no initials', async () => {
    await render(<Avatar name="Chandu" uri="https://example.com/a.jpg" />)

    expect(screen.getByTestId('avatar-image')).toBeTruthy()
    expect(screen.queryByText('C')).toBeNull()
  })

  it('names the person for a screen reader', async () => {
    await render(<Avatar name="Sarah" />)

    expect(screen.getByLabelText('Sarah')).toBeTruthy()
  })

  it('ignores empty and whitespace names without crashing', async () => {
    await render(<Avatar name="   " />)

    expect(screen.getByLabelText('Avatar')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it** — `npx jest --ci Avatar` → FAIL, module missing.

- [ ] **Step 3: Implement**

```tsx
import { Image } from 'expo-image'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type AvatarProps = {
  /** Diameter in points. Defaults to the shared control height. */
  size?: number
  uri?: string | null
  /** Used for initials and as the accessible label. */
  name: string
  /** Draws a lavender ring — the "revealed partner" treatment on M01-S06. */
  ring?: boolean
}

/** "Chandu Reddy" -> "CR", "Chandu" -> "C", "" -> "". */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ size, uri, name, ring = false }: AvatarProps) {
  const initials = initialsOf(name)
  const label = name.trim() || 'Avatar'

  styles.useVariants({ ring })

  return (
    <View
      style={[styles.avatar, size ? { width: size, height: size } : null]}
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" testID="avatar-image" />
      ) : (
        <Text variant="h2" tone="brand">
          {initials}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  avatar: {
    width: theme.control.height,
    height: theme.control.height,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface.soft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    variants: {
      ring: {
        true: { borderWidth: 3, borderColor: theme.colors.surface.soft },
        false: {},
      },
    },
  },
  image: {
    width: '100%',
    height: '100%',
  },
}))
```

- [ ] **Step 4: Run** — PASS, 5 tests. Then `npx tsc --noEmit` → 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/Avatar.tsx src/design-system/primitives/__tests__/Avatar.test.tsx
git commit -m "Add the Avatar primitive

Photo when there is one, initials otherwise, on a lavender circle. Falls
back safely on an empty or whitespace name rather than rendering an empty
badge. Consumed by M01-S02, S06 and S09, and by every later cluster."
```

---

## Task 2: CodeDisplay

**Files:** Create `src/design-system/primitives/CodeDisplay.tsx`; Test `__tests__/CodeDisplay.test.tsx`

**Interfaces:** Produces `CodeDisplay` with props `{ code: string }`, and `formatCode(code: string): string`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react-native'

import { CodeDisplay, formatCode } from '@/design-system/primitives/CodeDisplay'

describe('formatCode', () => {
  it('splits six characters into two groups', () => {
    expect(formatCode('L8V7QK')).toBe('L8V · 7QK')
  })

  it('leaves a short code alone rather than inventing a separator', () => {
    expect(formatCode('L8V')).toBe('L8V')
  })

  it('uppercases', () => {
    expect(formatCode('l8v7qk')).toBe('L8V · 7QK')
  })
})

describe('CodeDisplay', () => {
  it('renders the formatted code', async () => {
    await render(<CodeDisplay code="L8V7QK" />)

    expect(screen.getByText('L8V · 7QK')).toBeTruthy()
  })

  it('spells the code out for a screen reader, without the separator', async () => {
    // "el eight vee dot seven queue kay" as one word is useless to someone
    // transcribing a code. SCREENS.md section 7 calls this out for M01-S03.
    await render(<CodeDisplay code="L8V7QK" />)

    expect(screen.getByLabelText('L 8 V 7 Q K')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it** — FAIL, module missing.

- [ ] **Step 3: Implement**

```tsx
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

/** `L8V7QK` -> `L8V · 7QK`. The separator is presentation only. */
export function formatCode(code: string): string {
  const clean = code.trim().toUpperCase()

  if (clean.length !== 6) return clean

  return `${clean.slice(0, 3)} · ${clean.slice(3)}`
}

type CodeDisplayProps = {
  code: string
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  const clean = code.trim().toUpperCase()

  return (
    <View style={styles.container} accessibilityLabel={clean.split('').join(' ')}>
      <Text variant="h2" tone="heading" align="center">
        {formatCode(code)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.field,
    backgroundColor: theme.colors.surface.field,
    borderWidth: 1,
    borderColor: theme.colors.border.field,
  },
}))
```

- [ ] **Step 4: Run** — PASS. `npx tsc --noEmit` → 0.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/CodeDisplay.tsx src/design-system/primitives/__tests__/CodeDisplay.test.tsx
git commit -m "Add CodeDisplay

Formats a pairing code as L8V · 7QK. The separator is presentation only
and never part of the value, and the accessible label spells the code out
character by character - a screen reader reading it as one word is useless
to someone transcribing it."
```

---

## Task 3: CodeInput

**Files:** Create `src/design-system/primitives/CodeInput.tsx`; Test `__tests__/CodeInput.test.tsx`

**Interfaces:** Produces `CodeInput` with props `{ value, onChangeText, length?, error?, label }`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { CodeInput } from '@/design-system/primitives/CodeInput'

describe('CodeInput', () => {
  it('renders one box per character slot', async () => {
    await render(<CodeInput label="Partner code" value="" onChangeText={() => {}} />)

    expect(screen.getAllByTestId('code-box')).toHaveLength(6)
  })

  it('shows the entered characters in order', async () => {
    await render(<CodeInput label="Partner code" value="L8V" onChangeText={() => {}} />)

    expect(screen.getByText('L')).toBeTruthy()
    expect(screen.getByText('8')).toBeTruthy()
    expect(screen.getByText('V')).toBeTruthy()
  })

  it('reports typed characters uppercased', async () => {
    const onChangeText = jest.fn()
    await render(<CodeInput label="Partner code" value="" onChangeText={onChangeText} />)

    await userEvent.type(screen.getByLabelText('Partner code'), 'l')

    expect(onChangeText).toHaveBeenCalledWith('L')
  })

  it('never emits more than the code length', async () => {
    const onChangeText = jest.fn()
    await render(
      <CodeInput label="Partner code" value="L8V7QK" onChangeText={onChangeText} />,
    )

    await userEvent.type(screen.getByLabelText('Partner code'), 'Z')

    for (const call of onChangeText.mock.calls) {
      expect(call[0].length).toBeLessThanOrEqual(6)
    }
  })

  it('strips the separator and spaces from a pasted code', async () => {
    const onChangeText = jest.fn()
    await render(<CodeInput label="Partner code" value="" onChangeText={onChangeText} />)

    await userEvent.paste(screen.getByLabelText('Partner code'), 'L8V · 7QK')

    expect(onChangeText).toHaveBeenCalledWith('L8V7QK')
  })

  it('renders an error message when given one', async () => {
    await render(
      <CodeInput
        label="Partner code"
        value="BADCOD"
        onChangeText={() => {}}
        error="That code does not exist."
      />,
    )

    expect(screen.getByText('That code does not exist.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it** — FAIL, module missing.

- [ ] **Step 3: Implement**

```tsx
import { useCallback, useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

import { Text } from '@/design-system/primitives/Text'

type CodeInputProps = {
  label: string
  value: string
  onChangeText: (next: string) => void
  length?: number
  error?: string
}

/**
 * Segmented code entry.
 *
 * ONE hidden TextInput backs every box, so the keyboard, autofill and paste all
 * behave normally; the boxes are presentation. Six independent inputs look the
 * same and break all three.
 */
export function CodeInput({ label, value, onChangeText, length = 6, error }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = useCallback(
    (next: string) => {
      // Accepts a pasted "L8V · 7QK" as readily as typed characters.
      const clean = next.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, length)
      onChangeText(clean)
    },
    [onChangeText, length],
  )

  const chars = value.padEnd(length).split('').slice(0, length)
  const focusedIndex = Math.min(value.length, length - 1)

  return (
    <View style={styles.container}>
      <Text variant="caption" tone="body">
        {label}
      </Text>

      <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
        {chars.map((char, index) => {
          const active = isFocused && index === focusedIndex

          styles.useVariants({ state: error ? 'error' : active ? 'active' : 'rest' })

          return (
            <View key={index} style={styles.box} testID="code-box">
              <Text variant="h2" tone="heading">
                {char.trim()}
              </Text>
            </View>
          )
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={label}
        accessibilityHint={error}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={length}
        style={styles.hidden}
      />

      {error ? (
        <View testID="code-error" aria-live="polite">
          <Text variant="footnote" tone="error">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  box: {
    width: 44,
    height: theme.control.height,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.field,
    borderWidth: 1,
    backgroundColor: theme.colors.surface.field,
    variants: {
      state: {
        rest: { borderColor: theme.colors.border.field },
        active: {
          borderColor: theme.colors.brand.primary,
          boxShadow: '0px 0px 0px 3px rgba(56, 19, 132, 0.12)',
        },
        error: { borderColor: theme.colors.feedback.error },
      },
    },
  },
  // Off-screen rather than display:none — a hidden input cannot take focus.
  hidden: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
}))
```

- [ ] **Step 4: Run** — PASS, 6 tests. `npx tsc --noEmit` → 0.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/CodeInput.tsx src/design-system/primitives/__tests__/CodeInput.test.tsx
git commit -m "Add CodeInput

One hidden TextInput backs all six boxes so the keyboard, autofill and
paste behave normally - six independent inputs look identical and break
all three. Pasting the displayed form, L8V . 7QK, strips the separator
rather than rejecting it, because that is exactly what a user will paste."
```

---

## Task 4: DateField

**Files:** Create `src/design-system/primitives/DateField.tsx`; Test `__tests__/DateField.test.tsx`

**Interfaces:** Produces `DateField` with props `{ label, value: string, onChangeText, error?, optional? }`, value as `YYYY-MM-DD` or `''`, and `isValidBirthday(y, m, d): boolean`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react-native'

import { DateField, isValidBirthday } from '@/design-system/primitives/DateField'

describe('isValidBirthday', () => {
  it('accepts a real date', () => {
    expect(isValidBirthday(1994, 7, 21)).toBe(true)
  })

  it('rejects a day the month does not have', () => {
    expect(isValidBirthday(1994, 2, 31)).toBe(false)
  })

  it('rejects a future date', () => {
    expect(isValidBirthday(3000, 1, 1)).toBe(false)
  })

  it('rejects an out-of-range month', () => {
    expect(isValidBirthday(1994, 13, 1)).toBe(false)
  })
})

describe('DateField', () => {
  it('renders three segments with mm/dd/yyyy placeholders', async () => {
    await render(<DateField label="Birthday" value="" onChangeText={() => {}} />)

    expect(screen.getByPlaceholderText('mm')).toBeTruthy()
    expect(screen.getByPlaceholderText('dd')).toBeTruthy()
    expect(screen.getByPlaceholderText('yyyy')).toBeTruthy()
  })

  it('renders its label', async () => {
    await render(<DateField label="Birthday" value="" onChangeText={() => {}} />)

    expect(screen.getByText('Birthday')).toBeTruthy()
  })

  it('splits an existing value across the segments', async () => {
    await render(<DateField label="Birthday" value="1994-07-21" onChangeText={() => {}} />)

    expect(screen.getByDisplayValue('07')).toBeTruthy()
    expect(screen.getByDisplayValue('21')).toBeTruthy()
    expect(screen.getByDisplayValue('1994')).toBeTruthy()
  })

  it('renders an error message', async () => {
    await render(
      <DateField label="Birthday" value="" onChangeText={() => {}} error="Enter a real date" />,
    )

    expect(screen.getByText('Enter a real date')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it** — FAIL, module missing.

- [ ] **Step 3: Implement.** Three `TextInput` segments sharing the `Input` field styling, each `keyboardType="number-pad"` with `maxLength` 2/2/4. On any segment change, recompose to `YYYY-MM-DD` when all three are complete and valid, otherwise emit `''`. `isValidBirthday` constructs a `Date` and checks the round-trip so 31 February fails, plus rejects anything after today. The label uses `caption`, the error `footnote`/`error`, matching `Input`.

- [ ] **Step 4: Run** — PASS. `npx tsc --noEmit` → 0.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/primitives/DateField.tsx src/design-system/primitives/__tests__/DateField.test.tsx
git commit -m "Add DateField

Three typed segments rather than a calendar: a birthday is typed faster
than it is scrolled to, and a calendar for a date decades back is a poor
control. Validates by round-tripping through Date, so 31 February fails
rather than silently becoming 3 March."
```

---

## Task 5: PhotoPicker and StatusScreen

**Files:** Create `src/design-system/patterns/PhotoPicker.tsx`, `StatusScreen.tsx`; Tests for both.

- [ ] **Step 1: Write the failing tests**

```tsx
// PhotoPicker.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native'

import { PhotoPicker } from '@/design-system/patterns/PhotoPicker'

describe('PhotoPicker', () => {
  it('shows the add affordance when there is no photo', async () => {
    await render(<PhotoPicker label="Add Photo" name="Chandu" onPick={() => {}} />)

    expect(screen.getByRole('button', { name: 'Add Photo' })).toBeTruthy()
  })

  it('calls onPick when pressed', async () => {
    const onPick = jest.fn()
    await render(<PhotoPicker label="Add Photo" name="Chandu" onPick={onPick} />)

    await userEvent.press(screen.getByRole('button', { name: 'Add Photo' }))

    expect(onPick).toHaveBeenCalledTimes(1)
  })

  it('shows the chosen photo', async () => {
    await render(
      <PhotoPicker label="Add Photo" name="Chandu" uri="https://example.com/a.jpg" onPick={() => {}} />,
    )

    expect(screen.getByTestId('avatar-image')).toBeTruthy()
  })
})
```

```tsx
// StatusScreen.test.tsx
import { render, screen } from '@testing-library/react-native'

import { StatusScreen } from '@/design-system/patterns/StatusScreen'
import { Text } from '@/design-system/primitives/Text'

describe('StatusScreen', () => {
  it('renders heading, lede and actions', async () => {
    await render(
      <StatusScreen
        heading="Creating your shared space..."
        lede="just a moment"
        actions={<Text>Continue</Text>}
      />,
    )

    expect(screen.getByText('Creating your shared space...')).toBeTruthy()
    expect(screen.getByText('just a moment')).toBeTruthy()
    expect(screen.getByText('Continue')).toBeTruthy()
  })

  it('works with no actions', async () => {
    await render(<StatusScreen heading="Connecting" lede="just a moment" />)

    expect(screen.getByText('Connecting')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run** — FAIL, modules missing.

- [ ] **Step 3: Implement.** `PhotoPicker` wraps `Avatar` at 96pt in a `Pressable` with `accessibilityRole="button"` and the label as its accessible name; when `uri` is absent it overlays a camera glyph (`Feather` `camera` — **verify the glyph name**). `onPick` is a callback; `expo-image-picker` is not installed (spec §7). `StatusScreen` renders `{ illustration?, heading, lede, actions? }` centred inside `AuthScreenLayout`-style spacing, heading `h2`/`heading`, lede `body`/`body`, both centred.

- [ ] **Step 4: Run** — PASS. `npx tsc --noEmit` → 0.

- [ ] **Step 5: Commit**

```bash
git add src/design-system/patterns/PhotoPicker.tsx src/design-system/patterns/StatusScreen.tsx src/design-system/patterns/__tests__/PhotoPicker.test.tsx src/design-system/patterns/__tests__/StatusScreen.test.tsx
git commit -m "Add PhotoPicker and StatusScreen patterns

PhotoPicker takes an onPick callback rather than owning the picker:
expo-image-picker is scheduled for Phase 6, so the layout is real now and
the wiring lands with the library. StatusScreen is the shape M01-S07 and
S08 share."
```

---

## Task 6: The pairing boundary and relationship state

**Files:** Create `src/services/pairing/{types,mock,index}.ts`, `src/state/relationshipStore.ts`, `src/modules/module-01-onboarding/state/profileSchema.ts`; Tests for the mock and the schema.

**Interfaces:** Produces
- `PairingErrorCode = 'CODE_INVALID' | 'CODE_EXPIRED' | 'CANNOT_PAIR_WITH_SELF' | 'NETWORK' | 'UNKNOWN'`
- `Profile = { name, nickname?, birthday?, pronouns?, photoUri? }`
- `Partner = { id, name, photoUri? }`
- `PairingService = { createProfile, createInvite, redeemCode, confirmPartner, cancelInvite }`
- `useRelationshipStore` with `{ status, code, partner, profile, setProfile, setInvite, setPartner, connect, reset }`

- [ ] **Step 1: Write the failing tests**

```ts
import { createMockPairingService } from '@/services/pairing/mock'

describe('mock pairing service', () => {
  const pairing = createMockPairingService({ latencyMs: 0 })

  it('creates an invite with a six-character code', async () => {
    const result = await pairing.createInvite()

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.code).toHaveLength(6)
  })

  it('redeems the reserved valid code and names the partner', async () => {
    const result = await pairing.redeemCode({ code: 'L8V7QK' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('Chandu')
  })

  it('rejects an unknown code', async () => {
    const result = await pairing.redeemCode({ code: 'BADCODE'.slice(0, 6) })

    expect(result).toEqual({ ok: false, error: { code: 'CODE_INVALID' } })
  })

  it('reports an expired code distinctly from an invalid one', async () => {
    const result = await pairing.redeemCode({ code: 'EXPIRE' })

    expect(result).toEqual({ ok: false, error: { code: 'CODE_EXPIRED' } })
  })

  it('refuses to pair someone with themselves', async () => {
    // The obvious first thing a developer tests, and the least obvious to handle.
    const result = await pairing.redeemCode({ code: 'SELF12' })

    expect(result).toEqual({ ok: false, error: { code: 'CANNOT_PAIR_WITH_SELF' } })
  })

  it('is case-insensitive about codes', async () => {
    const result = await pairing.redeemCode({ code: 'l8v7qk' })

    expect(result.ok).toBe(true)
  })
})
```

```ts
import { profileSchema } from '@/modules/module-01-onboarding/state/profileSchema'

describe('profileSchema', () => {
  it('requires a name', () => {
    expect(profileSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts a name alone — everything else is optional', () => {
    expect(profileSchema.safeParse({ name: 'Chandu' }).success).toBe(true)
  })

  it('accepts the full profile including pronouns and nickname', () => {
    const result = profileSchema.safeParse({
      name: 'Chandu',
      nickname: 'Chan',
      pronouns: 'they/them',
      birthday: '1994-07-21',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an impossible birthday', () => {
    expect(
      profileSchema.safeParse({ name: 'Chandu', birthday: '1994-02-31' }).success,
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run** — FAIL, modules missing.

- [ ] **Step 3: Implement**, mirroring `src/services/auth/` exactly: a `Result<T>` union, error **codes** never raw strings, a `latencyMs` option defaulting to 600 so loading states are real, and reserved codes for every path. `index.ts` is the swap point. The Zustand store holds only relationship state — the profile form stays in `react-hook-form` (spec D36).

- [ ] **Step 4: Run** — PASS. `npx tsc --noEmit` → 0.

- [ ] **Step 5: Commit**

```bash
git add src/services/pairing src/state/relationshipStore.ts src/modules/module-01-onboarding/state
git commit -m "Add the pairing boundary, relationship store and profile schema

Mirrors the auth service exactly: a typed interface, error codes never
raw strings, and a mock with reserved codes so every path is reachable by
hand and deterministically in tests.

CANNOT_PAIR_WITH_SELF exists because redeeming your own invite is the
first thing anyone tries and the last thing anyone handles.

Only relationship state goes in Zustand. The profile form stays in
react-hook-form, per ARCHITECTURE.md's rule against lifting forms into a
global store."
```

---

# STAGE B — The ten screens

Each screen follows the pattern established in Cluster 1: a copy module, a screen component
composed from primitives inside `AuthScreenLayout`, a thin route re-export, and a test
covering render, actions and navigation. Values come from the spec's normalisation, **not**
from the frames as drawn.

## Task 7: M01-S01 Relationship Setup and the route group

**Files:** `src/app/(onboarding)/_layout.tsx`, `setup.tsx`; `src/copy/relationshipSetup.ts`; `src/modules/module-01-onboarding/screens/RelationshipSetupScreen.tsx`; test.

Copy: heading "Now let's create your space together." (`h1`, folded from 44/55), lede
"LoveOS becomes something special when you share it with your person." — **interpolate
`BRAND.name`** — primary "Invite My Partner" → `/profile`, outline "I Have a Partner Code" →
`/enter-code`, link "Do this later" → `/story-begins`. The drawn "DO THIS LATER" is
`#7A7583`; it becomes `text.body` (spec §5).

- [ ] Write the failing test (renders all three actions; each navigates to the right route)
- [ ] Run it — FAIL
- [ ] Implement copy, screen, `_layout.tsx` (Stack, `headerShown: false`), route
- [ ] Run — PASS; `npx tsc --noEmit` → 0
- [ ] Commit: `"Implement M01-S01 Relationship Setup"`

## Task 8: M01-S02 Create Your Profile

**Files:** `src/copy/createProfile.ts`; `CreateProfileScreen.tsx`; `src/app/(onboarding)/profile.tsx`; test.

Fields in order: `PhotoPicker` (optional), `FormField` name (required), `FormField` nickname
— label "How should your partner see you?", placeholder "Nickname, pet name…" — `DateField`
birthday (optional), `FormField` pronouns placeholder "E.g. they/them". Nickname and pronouns
are **carried from `522:349`** per D31. Continue → `/invite`.

- [ ] Failing test: renders all five fields; submits with name only; rejects an empty name; rejects 31 February; navigates on success
- [ ] Run — FAIL
- [ ] Implement
- [ ] Run — PASS; typecheck
- [ ] Commit: `"Implement M01-S02 Create Your Profile"` — note in the body that pronouns and nickname are carried from the earlier frame per D31.

## Task 9: M01-S03 Invite Your Partner and M01-S05 Invitation Sent

Both render `CodeDisplay` plus actions, so they share a task.

- S03: heading "Invite your person ❤️", `CodeDisplay`, primary "Share Invite", outline "Copy Code" → `/invitation-sent`. The decorative "Our safe space ✨" note is dropped with the Bricolage stray (D34).
- S05: heading "Your invitation is on its way ❤️", lede, `CodeDisplay`, "Share Again", "Copy Code", link "Cancel Invitation" which **confirms before destroying**, since the partner may already hold the code (spec §10).

- [ ] Failing tests for both
- [ ] Run — FAIL
- [ ] Implement, using `expo-clipboard`? **No** — not installed. Copy uses `Share` from React Native for share, and the copy action calls a `onCopy` stub logged as an open item.
- [ ] Run — PASS; typecheck
- [ ] Commit: `"Implement M01-S03 Invite Your Partner and M01-S05 Invitation Sent"`

## Task 10: M01-S04 Enter Partner Code, S06 Partner Found, S09 Is This Your Person

The redeem path, sharing `CodeInput` and `Avatar`.

- S04: `CodeInput`, primary "Connect" → redeems; on error shows the mapped message and **keeps the entry**; link "I need an invitation" → `/setup`.
- S06: `Avatar` at 192pt with `ring`, heading "We found your person. ❤️", lede naming the partner, "Continue" → `/confirm-partner`, link "That's not them" → `/enter-code`. Built as a screen, not a sheet (D37).
- S09: two `Avatar`s side by side, heading "Is this your person?", "Yes, Connect Us ❤️" → `/connecting`, link "Cancel" → `/enter-code`.

- [ ] Failing tests for all three, including each error code mapping on S04
- [ ] Run — FAIL
- [ ] Implement
- [ ] Run — PASS; typecheck
- [ ] Commit: `"Implement the redeem path: M01-S04, S06 and S09"`

## Task 11: M01-S07 Connecting, S08 Relationship Connected, S11 Our Story Begins

The completion path, all three built on `StatusScreen`.

- S07: no actions; runs `confirmPartner` on mount and replaces to `/connected` on success. Uses `router.replace` so back does not return to a spinner.
- S08: heading "You're officially a LoveOS couple ❤️" — **interpolate `BRAND.name`** — lede, "Continue" → `/story-begins`.
- S11: heading "Now, let's begin your story. ❤️", lede, "Let's Begin" and "Skip for now", both to a **placeholder** until Cluster 3 exists (spec §8).

- [ ] Failing tests for all three
- [ ] Run — FAIL
- [ ] Implement; wire M00-S04's Continue to `/(onboarding)/setup`, replacing its dead end
- [ ] Run full suite — PASS; `npx tsc --noEmit` → 0
- [ ] Export the web bundle to confirm every route registers
- [ ] Drive the flow in Chromium with the Cluster 1 driver script, extended to the pairing routes, and **look at the screenshots**
- [ ] Update `SCREENS.md`: M01-S01…S09 and S11 to `[~]`, S10 marked `SUPERSEDED BY M01-S08`, §1.2 and §1.4 recorded as resolved, and a change-log row
- [ ] Commit: `"Implement the completion path and close the pairing cluster"`

---

## Self-review

**Spec coverage:** §3 canonical IDs → Tasks 7–11 · §4 D29–D37 → all tasks · §5 regressions →
every screen task, guarded by the contrast suite · §6 folding → every screen task · §7 new
components → Tasks 1–5 · §8 routing → Tasks 7–11 · §9 boundary → Task 6 · §10 error handling
→ Tasks 9–10 · §11 testing → every task.

**Gaps found while reviewing, and closed:**

1. **Clipboard is not a dependency.** S03 and S05 both have "Copy Code". `expo-clipboard`
   is not installed and is not in `INSTALL-PLAN.md`'s list. Task 9 uses a stub and logs it,
   rather than quietly adding a dependency mid-cluster.
2. **`Share` needs no install** — React Native ships it — so "Share Invite" is real.
3. **S07 must `replace`, not `push`.** Pushing a progress screen leaves it in the back stack,
   so a user who presses back lands on a spinner for an already-finished operation.

**Placeholder scan:** clean. No TBDs, no "similar to Task N", no unwritten test bodies.

**Type consistency:** `Result`, `PairingErrorCode`, `Profile`, `Partner`, `PairingService`,
`formatCode`, `isValidBirthday`, `Avatar`, `CodeDisplay`, `CodeInput`, `DateField`,
`PhotoPicker`, `StatusScreen` are each defined once and referenced identically throughout.
