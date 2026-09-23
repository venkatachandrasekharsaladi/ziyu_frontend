/**
 * STORY OVER HTTP.
 *
 * One method, because the flow has one commit point. M01-S12 … S16 collect the
 * story locally and S17 posts it — the user can go back and change "when we
 * met" four screens later, and a per-screen save would have to reconcile that.
 *
 * `PUT` rather than `POST` for the same reason: the request replaces the whole
 * story, so a user who taps *Save* twice on a slow connection ends up with one
 * story rather than two. The endpoint is idempotent by construction.
 *
 * The `Moment` photos are local URIs from the picker and are uploaded first,
 * in parallel — three sequential uploads on a mobile connection would make the
 * final screen feel broken.
 */
import { requireApiUrl } from '@/config/env'
import { get, put } from '@/services/http/client'
import { toStoryErrorCode } from '@/services/http/errors'
import { ensureRemoteUri } from '@/services/media'
import type { Moment, Result, Story, StoryService } from '@/services/story/types'

const ok = <T>(value: T): Result<T> => ({ ok: true, value })
const fail = (error: unknown): Result<never> => ({
  ok: false,
  error: { code: toStoryErrorCode(error) },
})

async function withRemotePhoto(moment: Moment | undefined): Promise<Moment | undefined> {
  if (!moment) return undefined
  if (!moment.photoUri) return moment
  return { ...moment, photoUri: await ensureRemoteUri(moment.photoUri) }
}

export function createHttpStoryService(): StoryService {
  requireApiUrl()

  return {
    async getStory(): Promise<Result<Story>> {
      try {
        return ok(await get<Story>('/story'))
      } catch (error) {
        return fail(error)
      }
    },

    async saveStory(input: Story): Promise<Result<Story>> {
      try {
        const [firstDate, becameUs, firstMemory] = await Promise.all([
          withRemotePhoto(input.firstDate),
          withRemotePhoto(input.becameUs),
          withRemotePhoto(input.firstMemory),
        ])

        const story = await put<Story>('/story', {
          ...input,
          firstDate,
          becameUs,
          firstMemory,
        })

        /**
         * The server's copy is returned, not the input. `yourBirthday` and
         * `partnerBirthday` are relative to whoever is asking, and the server
         * re-relativises them on the way out — echoing the request back would
         * quietly show the wrong labels to the second partner.
         */
        return ok(story)
      } catch (error) {
        return fail(error)
      }
    },
  }
}
