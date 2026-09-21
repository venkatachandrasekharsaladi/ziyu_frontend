import { screen, userEvent } from '@testing-library/react-native'

import { TRIP_SETUP_COPY as COPY } from '@/copy/trips'
import { TripSetupScreen } from '@/modules/module-06-plans/screens/TripSetupScreen'
import { plannerService } from '@/services/planner'
import { usePlansStore } from '@/state/plansStore'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

const mockPush = jest.fn()
const mockBack = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: mockPush, back: mockBack, replace: jest.fn() }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockBack.mockClear()
  // `plansStore` is seeded from `@/sample/plans` rather than starting empty, and
  // `createTrip` mutates that seed in place for the rest of the process. Without
  // a reset the second test in this file would be asserting against the trip the
  // first one created.
  usePlansStore.getState().reset()
  useRelationshipStore.getState().reset()
})

/**
 * M06-S02 · Plan Something Together. Figma 3482:374.
 *
 * The screen's own comment is explicit that its form state is LOCAL and that
 * only `createTrip` crosses into `plansStore` on submit. These tests hold that
 * line from the outside: every control is exercised through the accessibility
 * tree, and the only thing asserted about the store is what it holds AFTER the
 * button is pressed.
 */
describe('M06-S02 Plan Something Together', () => {
  describe('the nights stepper', () => {
    it('starts at the four days the frame draws', async () => {
      await renderScreen(<TripSetupScreen />)

      expect(screen.getByText(COPY.nights.unit(4))).toBeTruthy()
    })

    it('will not go below one day, however many times you press', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      // Three presses reach 1 from the starting 4; the next three are the
      // clamp being asked to hold. A trip of zero — or minus two — days is not
      // a trip, and the stepper is the only thing standing between the user
      // and `heroTitle(-2, …)` on the next screen.
      for (let i = 0; i < 6; i += 1) {
        await user.press(screen.getByLabelText(COPY.nights.decrease))
      }

      expect(screen.getByText(COPY.nights.unit(1))).toBeTruthy()
      // Singular, not "1 days" — the clamp and the copy have to agree.
      expect(screen.getByText('1 day')).toBeTruthy()
    })

    it('will not go above what the planner can actually build', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      /*
       * The ceiling is the PLANNER'S, not a number in this test.
       *
       * It used to be a hardcoded 14 while the planner could only lay out three
       * complete days, so the form sold trips it could not build and the couple
       * got empty days. Deriving it here means this test keeps holding when a
       * real backend raises the limit — and fails if the form ever stops asking.
       */
      const cap = plannerService.maxNights

      for (let i = 0; i < cap + 3; i += 1) {
        await user.press(screen.getByLabelText(COPY.nights.increase))
      }

      expect(screen.getByText(COPY.nights.unit(cap))).toBeTruthy()
    })

    it('carries the clamped figure into the trip it creates', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      for (let i = 0; i < 6; i += 1) {
        await user.press(screen.getByLabelText(COPY.nights.decrease))
      }
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      // The clamp is worth nothing if the value that escapes to the store is
      // the unclamped one.
      expect(usePlansStore.getState().trip.nights).toBe(1)
    })

    it('names its two buttons rather than leaving a minus and a plus glyph', async () => {
      await renderScreen(<TripSetupScreen />)

      expect(screen.getByLabelText(COPY.nights.decrease)).toBeTruthy()
      expect(screen.getByLabelText(COPY.nights.increase)).toBeTruthy()
    })
  })

  describe('the travel-style chips', () => {
    it('opens with the three vibes the frame pre-selects', async () => {
      await renderScreen(<TripSetupScreen />)

      for (const label of [COPY.style.options.romantic, COPY.style.options.foodie, COPY.style.options.culture]) {
        expect(screen.getByLabelText(label).props.accessibilityState).toMatchObject({
          selected: true,
        })
      }

      expect(
        screen.getByLabelText(COPY.style.options.relaxing).props.accessibilityState,
      ).toMatchObject({ selected: false })
    })

    it('adds an unselected vibe and removes a selected one', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText(COPY.style.options.relaxing))
      await user.press(screen.getByLabelText(COPY.style.options.foodie))

      expect(
        screen.getByLabelText(COPY.style.options.relaxing).props.accessibilityState,
      ).toMatchObject({ selected: true })
      expect(
        screen.getByLabelText(COPY.style.options.foodie).props.accessibilityState,
      ).toMatchObject({ selected: false })
    })

    it('sends exactly the vibes still lit to the store', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText(COPY.style.options.adventure))
      await user.press(screen.getByLabelText(COPY.style.options.culture))
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      // Order matters here on purpose: `toggleStyle` appends, so a newly chosen
      // vibe lands at the end rather than back in the frame's original order.
      expect(usePlansStore.getState().trip.styles).toEqual(['romantic', 'foodie', 'adventure'])
    })

    it('lets the couple deselect every vibe rather than forcing one', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      for (const style of ['romantic', 'foodie', 'culture'] as const) {
        await user.press(screen.getByLabelText(COPY.style.options[style]))
      }
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      // "No particular vibe" is a legitimate answer — the field is a filter,
      // not a required choice, and nothing on the screen says otherwise.
      expect(usePlansStore.getState().trip.styles).toEqual([])
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('the budget band', () => {
    it('opens on £500, the band the sample trip carries', async () => {
      await renderScreen(<TripSetupScreen />)

      expect(screen.getByLabelText('£500').props.accessibilityState).toMatchObject({
        selected: true,
      })
      expect(screen.getByLabelText('£100').props.accessibilityState).toMatchObject({
        selected: false,
      })
    })

    it('moves the selection rather than adding to it — a band is a choice, not a filter', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText('£250'))

      expect(screen.getByLabelText('£250').props.accessibilityState).toMatchObject({
        selected: true,
      })
      expect(screen.getByLabelText('£500').props.accessibilityState).toMatchObject({
        selected: false,
      })
    })

    it('carries a numeric band to the store as a number', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText('£100'))
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      // `BudgetBand` is `100 | 250 | 500 | 'flexible'`. The chip prints "£100";
      // what leaves the screen must still be the number, or the itinerary's
      // `budgetBand === 'flexible'` check starts reading a string.
      expect(usePlansStore.getState().trip.budgetBand).toBe(100)
    })

    it('carries "Flexible" as the word, not as a price', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText(COPY.budget.flexible))
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().trip.budgetBand).toBe('flexible')
    })
  })

  describe('creating the plan', () => {
    it('writes the whole draft through the store and opens the itinerary', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.type(screen.getByLabelText(COPY.destination.label), 'Lisbon, Portugal')
      await user.press(screen.getByLabelText(COPY.nights.increase))
      await user.press(screen.getByLabelText(COPY.budget.flexible))
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      // Asserted through the real store rather than a spy: `createTrip` is
      // reached by a selector, so a screen that called some other action would
      // still satisfy a spy on this one.
      // One press up from the screen's default, clamped by the planner's cap.
      const expectedNights = Math.min(
        Math.min(4, plannerService.maxNights) + 1,
        plannerService.maxNights,
      )

      expect(usePlansStore.getState().trip).toMatchObject({
        destination: 'Lisbon, Portugal',
        nights: expectedNights,
        budgetBand: 'flexible',
      })
      /*
       * Submitting goes to the PLANNER, not straight to the itinerary — the
       * plan does not exist yet. The draft rides in the params rather than the
       * store, so this asserts the whole handover in one go.
       */
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/(app)/plans/trip/generating',
        params: {
          destination: 'Lisbon, Portugal',
          nights: String(expectedNights),
          budget: 'flexible',
          styles: 'romantic,foodie,culture',
        },
      })
    })

    it('resets the itinerary to day one, so the new trip does not open on the old day', async () => {
      const user = userEvent.setup()
      usePlansStore.getState().selectDay(3)

      await renderScreen(<TripSetupScreen />)
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().selectedDay).toBe(1)
    })

    it('trims the destination instead of storing the user’s stray spaces', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.type(screen.getByLabelText(COPY.destination.label), '  Kyoto, Japan  ')
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().trip.destination).toBe('Kyoto, Japan')
    })

    it('fills the destination from the suggestion chip', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByLabelText(COPY.destination.suggestion))
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().trip.destination).toBe('Paris, France')
    })
  })

  /**
   * THE EMPTY FIELD IS NOT AN ERROR.
   *
   * `onSubmit` reads `destination.trim() || placeholder`, so leaving the field
   * alone means taking the placeholder the screen was already showing. That is
   * the design — the field is pre-filled in the frame and "Paris, France" is a
   * real answer, not a missing one — and it is worth pinning down, because the
   * copy still carries a `destinationRequired` string that would look, to the
   * next person reading it, like the opposite promise.
   */
  describe('an empty destination', () => {
    it('falls back to the placeholder rather than blocking', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().trip.destination).toBe(COPY.destination.placeholder)
      // The placeholder is carried into the planner too, not just into the store.
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: '/(app)/plans/trip/generating',
          params: expect.objectContaining({ destination: COPY.destination.placeholder }),
        }),
      )
    })

    it('shows no validation message for it', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(screen.queryByText(COPY.destinationRequired)).toBeNull()
    })

    it('treats a field of only spaces the same way', async () => {
      const user = userEvent.setup()
      await renderScreen(<TripSetupScreen />)

      await user.type(screen.getByLabelText(COPY.destination.label), '   ')
      await user.press(screen.getByRole('button', { name: COPY.submit }))

      expect(usePlansStore.getState().trip.destination).toBe(COPY.destination.placeholder)
      expect(screen.queryByText(COPY.destinationRequired)).toBeNull()
    })
  })

  describe('the chrome around the form', () => {
    it('greets the couple by the names the relationship store holds', async () => {
      useRelationshipStore.getState().setProfile({ name: 'Praveen' })
      useRelationshipStore.getState().setPartner({ id: 'partner-1', name: 'Chandu' })

      await renderScreen(<TripSetupScreen />)

      expect(screen.getByText(COPY.nextChapterFor('Praveen & Chandu'))).toBeTruthy()
    })

    it('falls back to the couple the frames name when the store is empty', async () => {
      await renderScreen(<TripSetupScreen />)

      expect(screen.getByText(COPY.nextChapterFor('Chandu & Sarah'))).toBeTruthy()
    })

    it('draws "Plan a Date" as an honest, unbuilt option rather than a live one', async () => {
      await renderScreen(<TripSetupScreen />)

      // Present so the frame reads right, but not a control — nothing should be
      // pressable towards a screen that does not exist.
      expect(screen.getByText(COPY.modes.date.title)).toBeTruthy()
      expect(screen.queryByRole('button', { name: COPY.modes.date.title })).toBeNull()
    })

    it('marks Plans as the tab in view', async () => {
      await renderScreen(<TripSetupScreen />)

      expect(screen.getByLabelText('Plans').props.accessibilityState).toMatchObject({
        selected: true,
      })
    })
  })
})
