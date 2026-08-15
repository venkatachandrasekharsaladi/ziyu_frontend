import type { Result, Story, StoryErrorCode, StoryService } from '@/services/story/types'

/**
 * A reserved location string, so the failure path is reachable by hand on a
 * device and deterministically in tests — the same device the auth and pairing
 * mocks use for their reserved emails and codes.
 */
const OFFLINE_MARKER = 'offline'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function fail(code: StoryErrorCode): Result<never> {
  return { ok: false, error: { code } }
}

type MockOptions = {
  /** Default is deliberately slow enough that loading states are visible. */
  latencyMs?: number
}

export function createMockStoryService({ latencyMs = 600 }: MockOptions = {}): StoryService {
  return {
    async saveStory(input: Story) {
      await wait(latencyMs)

      const locations = [input.firstDate?.location, input.becameUs?.location, input.firstMemory?.location]

      if (locations.some((l) => l?.trim().toLowerCase() === OFFLINE_MARKER)) {
        return fail('NETWORK')
      }

      return { ok: true, value: input }
    },
  }
}
