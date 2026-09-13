import { create } from 'zustand'

export type ThemeChoice = 'light' | 'dark' | 'auto'

type ThemeChoiceState = {
  choice: ThemeChoice
  setChoice: (choice: ThemeChoice) => void
  reset: () => void
}

const DEFAULTS = { choice: 'light' as ThemeChoice }

/**
 * The user's theme CHOICE — `light`, `dark`, or `auto` — kept apart from
 * `state/preferencesStore`.
 *
 * The theme layer owns the theme, choice included, so nothing in
 * `design-system` has to reach into app state: nothing under here imports
 * from `@/state`, and this store is why that stays true once Auto needs
 * somewhere to keep what the user asked for. `useThemeMode` is still the only
 * thing that turns a choice into an active theme — see its header for why
 * that has to be a manual `Appearance` listener rather than
 * `settings.adaptiveThemes` (`themes/unistyles.ts` has the same reasoning).
 *
 * A hook cannot hold state shared between the Appearance screen and the hub
 * row that displays the current choice, which is why this exists as a store
 * rather than a `useState` inside `useThemeMode`.
 */
export const useThemeChoiceStore = create<ThemeChoiceState>((set) => ({
  ...DEFAULTS,

  setChoice: (choice) => set({ choice }),

  reset: () => set({ ...DEFAULTS }),
}))
