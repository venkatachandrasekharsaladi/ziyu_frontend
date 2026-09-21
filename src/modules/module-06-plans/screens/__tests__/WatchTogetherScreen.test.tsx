import { screen, userEvent } from '@testing-library/react-native'

import { WATCH_COPY } from '@/copy/watchTogether'
import { WatchTogetherScreen } from '@/modules/module-06-plans/screens/WatchTogetherScreen'
import {
  SAMPLE_WATCH_KEEPSAKE,
  SAMPLE_WATCH_ROOM,
  SAMPLE_WATCH_STREAM,
} from '@/sample/plans'
import { useRelationshipStore } from '@/state/relationshipStore'
import { renderScreen } from '@/test/renderScreen'

jest.mock('expo-router', () => ({
  useRouter: () => ({ canGoBack: () => true, push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}))

/**
 * THE FAKE PLAYER, and the reason this file needs one at all.
 *
 * `expo-video` is a native module: `useVideoPlayer` reaches through Nitro to a
 * real AVPlayer/ExoPlayer instance, and `VideoView` is a native view. Neither
 * exists under Jest, so the screen cannot even mount without a stand-in — this
 * is the same problem `jest.setup.js` solves for Reanimated, except that the
 * only native mocks this repo keeps globally are the ones EVERY test needs.
 * `expo-video` is imported by exactly one screen, so its mock lives here beside
 * the test that cares, which is what every other screen suite already does with
 * `expo-router` and `@/services/*`.
 *
 * ONE instance for the whole module, not one per render. The screen calls
 * `player.play()` from an event handler, so the object the handler closes over
 * has to be the same object this file asserts on — a mock that minted a fresh
 * player each render would record the press on an instance the test never sees
 * and report "play was never called" for a screen that plays perfectly.
 *
 * `loop` and `muted` start at the OPPOSITE of what the screen sets them to, so
 * asserting them proves the setup callback genuinely ran rather than proving
 * that two defaults happen to agree.
 */
const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  loop: true,
  muted: true,
}

/** Records what source the screen asked for, and how often it asked. */
const mockUseVideoPlayer = jest.fn()

/** Records the props the screen hands the native view. */
const mockVideoView = jest.fn()

jest.mock('expo-video', () => {
  // Required INSIDE the factory: `jest.mock` is hoisted above every import in
  // this file, so the module-scope `React`/`View` bindings do not exist yet at
  // the moment this runs. `mockPlayer` and friends survive the same hoist only
  // because babel-plugin-jest-hoist whitelists identifiers prefixed `mock`.
  const React = require('react')
  const { View } = require('react-native')

  return {
    useVideoPlayer: (
      source: string,
      // An inline structural type, not `typeof mockPlayer`: the hoist plugin's
      // out-of-scope check does not understand TS type positions and rejects a
      // bare identifier there even though it erases to nothing. Same workaround
      // `ChatJourney.test.tsx` documents.
      setup?: (instance: { loop: boolean; muted: boolean }) => void,
    ) => {
      // The real hook runs its setup ONCE, when the player is created, and
      // hands back the same instance on every later render. Re-running it here
      // would quietly re-apply `loop`/`muted` after a test had changed them.
      const isFirstCall = mockUseVideoPlayer.mock.calls.length === 0

      mockUseVideoPlayer(source)

      if (isFirstCall) setup?.(mockPlayer)

      return mockPlayer
    },
    VideoView: (props: { accessibilityLabel?: string }) => {
      mockVideoView(props)

      // Rendered as an accessible `View` carrying only the label, so the
      // player is findable by the same `getByLabelText` a real screen reader
      // would use. The rest of the props (`player`, `nativeControls`,
      // `contentFit`) mean nothing to a `View` and are asserted through
      // `mockVideoView` instead of being spread onto one.
      return React.createElement(View, {
        accessible: true,
        accessibilityLabel: props.accessibilityLabel,
      })
    },
  }
})

beforeEach(() => {
  mockPlayer.play.mockClear()
  mockPlayer.pause.mockClear()
  mockPlayer.loop = true
  mockPlayer.muted = true
  mockUseVideoPlayer.mockClear()
  mockVideoView.mockClear()
  useRelationshipStore.getState().reset()
})

/**
 * M06-S11 · Watch Together.
 *
 * The behaviour worth defending on this screen is the one the source calls out
 * in a comment: the video does NOT start on its own. Everything else here is
 * the session gate — the player, the whispers and the keepsake only exist once
 * the couple has said yes — plus the two lists that render either way.
 */
describe('M06-S11 Watch Together', () => {
  it('does not play anything until it is asked to', async () => {
    await renderScreen(<WatchTogetherScreen />)

    // The whole point: a video that began by itself would talk over whatever
    // the user was already listening to.
    expect(mockPlayer.play).not.toHaveBeenCalled()

    // And it is the player that was prepared, not one that was never built —
    // otherwise "play was not called" would pass on a screen with no video.
    expect(mockUseVideoPlayer).toHaveBeenCalled()
    expect(mockUseVideoPlayer.mock.calls[0][0]).toBe(SAMPLE_WATCH_STREAM)
  })

  it('prepares the player unlooped and unmuted', async () => {
    await renderScreen(<WatchTogetherScreen />)

    // A romance that restarts itself at the credits is a bug, and a shared
    // session that begins silent is a support ticket.
    expect(mockPlayer.loop).toBe(false)
    expect(mockPlayer.muted).toBe(false)
  })

  it('keeps the session out of the tree until watching starts', async () => {
    await renderScreen(<WatchTogetherScreen />)

    expect(
      screen.queryByLabelText(WATCH_COPY.playerLabel(SAMPLE_WATCH_ROOM.tonight.title)),
    ).toBeNull()
    expect(screen.queryByText(WATCH_COPY.sessionLabel)).toBeNull()
    expect(screen.queryByLabelText(WATCH_COPY.whisper)).toBeNull()
    expect(screen.queryByText(SAMPLE_WATCH_KEEPSAKE.heading)).toBeNull()

    // What IS offered instead: start, or pull the other person in first.
    expect(screen.getByRole('button', { name: WATCH_COPY.start })).toBeTruthy()
    expect(screen.getByRole('button', { name: WATCH_COPY.invite('Sarah') })).toBeTruthy()
  })

  it('starts playing, and opens the session, only once Start is pressed', async () => {
    const user = userEvent.setup()
    await renderScreen(<WatchTogetherScreen />)

    await user.press(screen.getByRole('button', { name: WATCH_COPY.start }))

    expect(mockPlayer.play).toHaveBeenCalledTimes(1)

    expect(
      screen.getByLabelText(WATCH_COPY.playerLabel(SAMPLE_WATCH_ROOM.tonight.title)),
    ).toBeTruthy()
    expect(screen.getByText(WATCH_COPY.sessionLabel)).toBeTruthy()
    expect(screen.getByText(WATCH_COPY.watchingTogether)).toBeTruthy()
    expect(screen.getByText(SAMPLE_WATCH_KEEPSAKE.heading)).toBeTruthy()

    // The start button hands over to the session rather than sitting under it
    // offering to start a thing that is already running.
    expect(screen.queryByRole('button', { name: WATCH_COPY.start })).toBeNull()
  })

  it('hands the native view the player it prepared', async () => {
    const user = userEvent.setup()
    await renderScreen(<WatchTogetherScreen />)

    await user.press(screen.getByRole('button', { name: WATCH_COPY.start }))

    // `VideoView` showing a DIFFERENT player than the one `onStart` played is
    // the failure mode that renders a black rectangle next to audible sound.
    expect(mockVideoView).toHaveBeenCalled()
    const lastCall = mockVideoView.mock.calls[mockVideoView.mock.calls.length - 1][0]
    expect(lastCall.player).toBe(mockPlayer)
    expect(lastCall.nativeControls).toBe(true)
  })

  describe('whispers', () => {
    /** Every whisper assertion needs the session open first. */
    const startWatching = async (user: ReturnType<typeof userEvent.setup>) => {
      await renderScreen(<WatchTogetherScreen />)
      await user.press(screen.getByRole('button', { name: WATCH_COPY.start }))
    }

    it('refuses to send an empty note', async () => {
      const user = userEvent.setup()
      await startWatching(user)

      expect(
        screen.getByRole('button', { name: WATCH_COPY.send }).props.accessibilityState,
      ).toMatchObject({ disabled: true })

      // Whitespace is not a whisper — the screen trims before it decides, so a
      // spacebar lean must not light the button up.
      await user.type(screen.getByLabelText(WATCH_COPY.whisper), '   ')

      expect(
        screen.getByRole('button', { name: WATCH_COPY.send }).props.accessibilityState,
      ).toMatchObject({ disabled: true })
    })

    it('opens the button once there is something to say', async () => {
      const user = userEvent.setup()
      await startWatching(user)

      await user.type(screen.getByLabelText(WATCH_COPY.whisper), 'this bit')

      expect(
        screen.getByRole('button', { name: WATCH_COPY.send }).props.accessibilityState,
      ).toMatchObject({ disabled: false })
    })

    it('appends the note and empties the field', async () => {
      const user = userEvent.setup()
      const note = 'This is our rain scene now'
      await startWatching(user)

      // The seeded session already carries one whisper from the partner.
      expect(
        screen.getByText(WATCH_COPY.whispersCount(SAMPLE_WATCH_ROOM.whispers.length)),
      ).toBeTruthy()

      await user.type(screen.getByLabelText(WATCH_COPY.whisper), note)
      await user.press(screen.getByRole('button', { name: WATCH_COPY.send }))

      // Quoted, exactly as the screen draws every whisper.
      expect(screen.getByText(`“${note}”`)).toBeTruthy()
      expect(
        screen.getByText(WATCH_COPY.whispersCount(SAMPLE_WATCH_ROOM.whispers.length + 1)),
      ).toBeTruthy()

      // The partner's seeded whisper is still there — appended, not replaced.
      expect(screen.getByText(`“${SAMPLE_WATCH_ROOM.whispers[0].text}”`)).toBeTruthy()

      // A composer that keeps the sent text is how a note gets whispered twice.
      expect(screen.getByLabelText(WATCH_COPY.whisper).props.value).toBe('')
      expect(
        screen.getByRole('button', { name: WATCH_COPY.send }).props.accessibilityState,
      ).toMatchObject({ disabled: true })
    })
  })

  it('draws the queue whether or not anything is playing', async () => {
    await renderScreen(<WatchTogetherScreen />)

    expect(screen.getByText(WATCH_COPY.viewQueue(SAMPLE_WATCH_ROOM.queue.length))).toBeTruthy()

    for (const title of SAMPLE_WATCH_ROOM.queue) {
      expect(screen.getByText(title.title)).toBeTruthy()
      // Uppercased in the frame, so uppercased here — a lowercase label would
      // be a different design.
      expect(screen.getByText(WATCH_COPY.finished(title.progress).toUpperCase())).toBeTruthy()
    }
  })

  it('draws the watch history with every title marked done', async () => {
    await renderScreen(<WatchTogetherScreen />)

    expect(screen.getByText(WATCH_COPY.historyLabel)).toBeTruthy()

    for (const entry of SAMPLE_WATCH_ROOM.history) {
      expect(screen.getByText(entry.title)).toBeTruthy()
      expect(screen.getByText(entry.detail)).toBeTruthy()
      expect(screen.getByText(entry.reactions)).toBeTruthy()
    }

    // One "Completed" chip per row, derived from the data rather than counted
    // by hand, so adding a row does not silently leave one unbadged.
    expect(screen.getAllByText(WATCH_COPY.completed)).toHaveLength(
      SAMPLE_WATCH_ROOM.history.length,
    )
  })

  it("names tonight's pick and who chose it", async () => {
    useRelationshipStore.getState().setPartner({ id: 'partner-1', name: 'Chandana' })

    await renderScreen(<WatchTogetherScreen />)

    expect(screen.getByText(SAMPLE_WATCH_ROOM.tonight.title)).toBeTruthy()
    // The partner's real name replaces the sample one everywhere it appears.
    expect(screen.getByText(WATCH_COPY.pickedBy('Chandana'))).toBeTruthy()
    expect(screen.getByText(WATCH_COPY.match(SAMPLE_WATCH_ROOM.matchScore))).toBeTruthy()
  })
})
