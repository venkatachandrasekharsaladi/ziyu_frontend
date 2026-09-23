import { requireApiUrl } from '@/config/env'
import { request } from '@/services/http/client'
import { isApiError } from '@/services/http/errors'
import type { TimelineItem, TimelineService } from '@/services/timeline/types'

export function createHttpTimelineService(): TimelineService {
  requireApiUrl()
  return {
    async list(input = {}) {
      try {
        const response = await request<TimelineItem[]>('/timeline', {
          method: 'GET', query: input,
        })
        return {
          ok: true,
          value: {
            items: response.data,
            nextCursor: typeof response.meta.nextCursor === 'string'
              ? response.meta.nextCursor : undefined,
          },
        }
      } catch (error) {
        return {
          ok: false,
          error: { code: isApiError(error) && error.code === 'NETWORK' ? 'NETWORK' : 'UNKNOWN' },
        }
      }
    },
  }
}
