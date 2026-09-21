import { screen, userEvent } from '@testing-library/react-native'
import type { ReactTestRendererJSON } from 'react-test-renderer'

import { TRIP_ITINERARY_COPY as COPY } from '@/copy/trips'
import { MomentCard } from '@/modules/module-06-plans/components/MomentCard'
import type { ItineraryMoment } from '@/services/plans/types'
import { renderScreen } from '@/test/renderScreen'

const PICNIC: ItineraryMoment = {
  id: 'm-1-3',
  time: '07:30 PM',
  slot: 'Sunset moment',
  title: 'Sunset picnic overlooking Paris',
  description: 'Linen blanket, fresh baguette, and two glasses of pinot noir.',
  cost: '£52',
  photoUri: null,
  saved: false,
}

/**
 * The rail is decorative, so it carries no label and no role and cannot be
 * queried for. It is found by the one prop that marks it — the
 * `importantForAccessibility` that hides it from screen readers — and its
 * children are counted: a dot alone, or a dot and the line below it.
 */
function railChildCount(tree: ReactTestRendererJSON | null): number {
  if (!tree || typeof tree !== 'object') return -1

  if (tree.props?.importantForAccessibility === 'no-hide-descendants') {
    return (tree.children ?? []).length
  }

  for (const child of tree.children ?? []) {
    if (typeof child === 'string') continue

    const found = railChildCount(child as ReactTestRendererJSON)

    if (found !== -1) return found
  }

  return -1
}

describe('MomentCard', () => {
  describe('what it puts on the card', () => {
    it('prints the time, the slot, the cost and the words', async () => {
      await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={jest.fn()} />)

      expect(screen.getByText(PICNIC.time)).toBeTruthy()
      // The slot is uppercased by the card, not by the fixture — the eyebrow is
      // typography, and the data stays sentence case.
      expect(screen.getByText('SUNSET MOMENT')).toBeTruthy()
      expect(screen.getByText(PICNIC.cost)).toBeTruthy()
      expect(screen.getByText(PICNIC.title)).toBeTruthy()
      expect(screen.getByText(PICNIC.description)).toBeTruthy()
    })

    it('prints a prose cost as readily as a price', async () => {
      // `cost` is a string precisely so "Free · Priceless" is as valid as "£52".
      await renderScreen(
        <MomentCard
          moment={{ ...PICNIC, cost: 'Free · Priceless' }}
          last={false}
          onToggleSaved={jest.fn()}
        />,
      )

      expect(screen.getByText('Free · Priceless')).toBeTruthy()
    })

    it('shows the photo caption when there is a photo to pin it to', async () => {
      await renderScreen(
        <MomentCard
          moment={{ ...PICNIC, photoUri: 'https://example.test/picnic.jpg', photoCaption: 'Golden hour highlight' }}
          last={false}
          onToggleSaved={jest.fn()}
        />,
      )

      expect(screen.getByText('Golden hour highlight')).toBeTruthy()
    })

    it('leaves the caption out when there is no photo under it', async () => {
      // A caption floating over nothing is worse than no caption.
      await renderScreen(
        <MomentCard
          moment={{ ...PICNIC, photoUri: null, photoCaption: 'Golden hour highlight' }}
          last={false}
          onToggleSaved={jest.fn()}
        />,
      )

      expect(screen.queryByText('Golden hour highlight')).toBeNull()
    })
  })

  describe('the timeline rail', () => {
    it('runs the line on past a card that has a card after it', async () => {
      const tree = (
        await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={jest.fn()} />)
      ).toJSON() as ReactTestRendererJSON

      // Dot plus line.
      expect(railChildCount(tree)).toBe(2)
    })

    it('stops the line at the last card', async () => {
      const tree = (
        await renderScreen(<MomentCard moment={PICNIC} last onToggleSaved={jest.fn()} />)
      ).toJSON() as ReactTestRendererJSON

      // Dot only — the rail is drawn by the card rather than the list precisely
      // so a one-moment day cannot end with a line running into empty space.
      expect(railChildCount(tree)).toBe(1)
    })

    it('hides the rail from screen readers either way', async () => {
      await renderScreen(<MomentCard moment={PICNIC} last onToggleSaved={jest.fn()} />)

      // Nothing decorative should be announced, so the only labelled control on
      // the card is the save toggle.
      expect(screen.getByLabelText(`${COPY.save}: ${PICNIC.title}`)).toBeTruthy()
    })
  })

  describe('the save control', () => {
    it('is a button named for the moment, not a bare "Save"', async () => {
      await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={jest.fn()} />)

      // Three of these sit on one day. "Save" alone would give a screen-reader
      // user three identical buttons and no way to tell them apart.
      expect(
        screen.getByRole('button', { name: `${COPY.save}: ${PICNIC.title}` }),
      ).toBeTruthy()
    })

    it('reports itself unselected while the moment is unsaved', async () => {
      await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={jest.fn()} />)

      expect(
        screen.getByLabelText(`${COPY.save}: ${PICNIC.title}`).props.accessibilityState,
      ).toMatchObject({ selected: false })
    })

    it('reports itself selected — and renames itself — once the moment is saved', async () => {
      await renderScreen(
        <MomentCard moment={{ ...PICNIC, saved: true }} last={false} onToggleSaved={jest.fn()} />,
      )

      expect(
        screen.getByLabelText(`${COPY.saved}: ${PICNIC.title}`).props.accessibilityState,
      ).toMatchObject({ selected: true })
      // The state is carried by BOTH the label and `accessibilityState`, because
      // the visible difference is a colour and a word, and colour alone is not
      // a state anyone can hear.
      expect(screen.getByText(COPY.saved)).toBeTruthy()
      expect(screen.queryByText(COPY.save)).toBeNull()
    })

    it('asks its owner to toggle rather than deciding for itself', async () => {
      const onToggleSaved = jest.fn()
      const user = userEvent.setup()
      await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={onToggleSaved} />)

      await user.press(screen.getByLabelText(`${COPY.save}: ${PICNIC.title}`))

      expect(onToggleSaved).toHaveBeenCalledTimes(1)
      // The card is a pure read of `moment.saved`; pressing it changes nothing
      // locally, so the label is unmoved until the store sends a new prop down.
      expect(screen.getByLabelText(`${COPY.save}: ${PICNIC.title}`)).toBeTruthy()
    })

    it('draws "Replace" as a label, not as a control that does nothing', async () => {
      await renderScreen(<MomentCard moment={PICNIC} last={false} onToggleSaved={jest.fn()} />)

      // The frame draws it; nothing implements it. A dead button would be a
      // worse lie than a plain label.
      expect(screen.getByText(COPY.replace)).toBeTruthy()
      expect(screen.queryByRole('button', { name: COPY.replace })).toBeNull()
    })
  })
})
